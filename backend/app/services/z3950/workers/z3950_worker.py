"""
Core Z39.50 Worker using yaz-client
Handles connections and searches to Z39.50 servers
"""

from typing import List, Dict, Any, Optional
import subprocess
import re
import logging

from ..config import Z3950_SOURCES, SEARCH_LIMITS
from ..parsers.marc_parser import MARCParser

logger = logging.getLogger(__name__)


class Z3950Worker:
    """Base worker for Z39.50 operations using yaz-client"""

    def __init__(self, source_key: str):
        """
        Initialize Z39.50 worker

        Args:
            source_key: Key from Z3950_SOURCES config (e.g., 'loc', 'uw', 'oclc')
        """
        if source_key not in Z3950_SOURCES:
            raise ValueError(f"Unknown source: {source_key}")

        self.source_key = source_key
        self.config = Z3950_SOURCES[source_key]
        self.connection = None

    def connect(self) -> bool:
        """
        Test connection to Z39.50 server

        Returns:
            True if yaz-client is available
        """
        try:
            # Test if yaz-client is available
            result = subprocess.run(
                ["yaz-client", "-V"],
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='replace',  # Handle encoding errors gracefully
                timeout=5
            )

            if result.returncode == 0:
                logger.info(f"yaz-client available for {self.config['name']}")
                return True
            else:
                logger.error("yaz-client not found. Please install YAZ toolkit.")
                return False

        except FileNotFoundError:
            logger.error("yaz-client not found. Please install YAZ toolkit.")
            return False
        except Exception as e:
            logger.error(f"Failed to test yaz-client: {str(e)}")
            return False

    def disconnect(self):
        """Close Z39.50 connection (not needed for yaz-client)"""
        pass

    def _build_yaz_query(self, query: str, query_type: str) -> str:
        """
        Build YAZ query string

        Args:
            query: Search query
            query_type: Type of search

        Returns:
            YAZ query string
        """
        # Bib-1 attribute mapping
        attr_map = {
            "isbn": "7",        # ISBN
            "title": "4",       # Title
            "author": "1003",   # Author
            "subject": "21",    # Subject
            "keyword": "1016"   # Any field
        }

        attr = attr_map.get(query_type, "1016")
        return f'@attrset bib-1 @attr 1={attr} "{query}"'

    def search(
        self,
        query: str,
        query_type: str = "keyword",
        limit: int = None
    ) -> List[Dict[str, Any]]:
        """
        Search Z39.50 server using yaz-client and return normalized results

        Args:
            query: Search query string
            query_type: Type of search (isbn, title, author, subject, keyword)
            limit: Maximum number of results to return

        Returns:
            List of LibraryRecordLite dictionaries
        """
        if not self.config.get('enabled', False):
            logger.warning(f"Source {self.source_key} is disabled")
            return []

        try:
            # Set result limit
            if limit is None:
                limit = SEARCH_LIMITS['default_limit']
            limit = min(limit, SEARCH_LIMITS['max_limit'])

            # Build yaz-client script
            yaz_query = self._build_yaz_query(query, query_type)

            host = self.config['host']
            port = self.config['port']
            database = self.config['database']
            syntax = self.config.get('syntax', 'usmarc')

            # Build authentication if needed
            auth_commands = ""
            if self.config.get('requires_auth'):
                if self.config.get('username') and self.config.get('password'):
                    auth_commands = f"user {self.config['username']}\npassword {self.config['password']}\n"
                else:
                    logger.warning(f"Authentication required for {self.source_key} but credentials not provided")
                    return []

            script = f"""open {host}:{port}/{database}
{auth_commands}format {syntax}
find {yaz_query}
show 1+{limit}
quit
"""

            logger.info(f"Searching {self.config['name']} for: {query}")

            # Execute yaz-client
            # Use UTF-8 encoding with error handling to avoid UnicodeDecodeError
            result = subprocess.run(
                ["yaz-client"],
                input=script,
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='replace',  # Replace invalid characters instead of failing
                timeout=self.config.get('timeout', 30)
            )

            output = result.stdout
            
            # Check if output is valid
            if not output:
                logger.warning(f"No output from {self.config['name']}")
                return []

            # Parse total hits
            total = 0
            if output:
                match = re.search(r'Number of hits: (\d+)', output)
                if match:
                    total = int(match.group(1))
                    logger.info(f"Found {total} hits from {self.config['name']}")

            # Parse MARC records
            records = self._parse_yaz_output(output)

            logger.info(f"Parsed {len(records)} records from {self.config['name']}")
            return records

        except subprocess.TimeoutExpired:
            logger.error(f"Search timeout on {self.config['name']}")
            return []
        except Exception as e:
            logger.error(f"Search error on {self.config['name']}: {str(e)}")
            return []

    def _parse_yaz_output(self, output: str) -> List[Dict[str, Any]]:
        """
        Parse yaz-client output to extract MARC records

        Args:
            output: Raw yaz-client output

        Returns:
            List of LibraryRecordLite dictionaries
        """
        records = []

        try:
            # Check if output is valid
            if not output or not isinstance(output, str):
                logger.warning("Invalid output for parsing")
                return records
            
            # Split output by record separators
            # Handle both [VOYAGER]Record type: and [voyager]Record type: and Record type:
            raw_records = re.split(r'\n(?=\[.*?\]Record type:|Record type:)', output, flags=re.IGNORECASE)

            for raw in raw_records:
                # Check if this looks like a record (case-insensitive)
                if not re.search(r'Record type:', raw, re.IGNORECASE) or len(raw) < 50:
                    continue

                try:
                    marc_record = self._parse_marc_from_text(raw)
                    if marc_record:
                        # Parse with source set to the source_key
                        from app.models.mongodb_schemas import MARCRecordSource
                        source = MARCRecordSource.Z3950.value
                        normalized = MARCParser.parse_to_library_record(marc_record, source=source)
                        records.append(normalized)

                except Exception as e:
                    logger.error(f"Error parsing record: {str(e)}")
                    continue

        except Exception as e:
            logger.error(f"Error parsing yaz output: {str(e)}")

        return records

    def _parse_marc_from_text(self, text: str) -> Optional[Any]:
        """
        Parse MARC record from yaz-client text output
        
        Format from LOC:
        [voyager]Record type: USmarc
        01245cam  22003731  4500  <- Leader (24 chars, no prefix)
        001 2165697
        008 721219t19581953nyu           000 1 eng
        245 14 $a The great Gatsby.

        Args:
            text: MARC text from yaz-client

        Returns:
            pymarc.Record object or None
        """
        try:
            from pymarc import Record, Field, Subfield

            # Check if text is valid
            if not text or not isinstance(text, str):
                logger.warning("Invalid text for MARC parsing")
                return None

            record = Record()
            lines = text.split('\n')
            
            # Find record marker and extract leader
            # Leader is the first line after "[voyager]Record type: USmarc" or "Record type:"
            # It's a 24-character line (no prefix "Leader:")
            leader_line = None
            in_record = False
            processed_lines = []
            
            for i, line in enumerate(lines):
                line_stripped = line.strip()
                if not line_stripped:
                    processed_lines.append(line)
                    continue
                
                # Check for record marker (case-insensitive)
                if re.search(r'Record type:', line_stripped, re.IGNORECASE):
                    in_record = True
                    # Next non-empty line should be the leader
                    continue
                
                # If we're in a record and haven't found leader yet
                if in_record and leader_line is None:
                    # Check if this looks like a leader (24 characters, starts with digits)
                    # Leader format: "01245cam  22003731  4500" (24 chars)
                    if len(line_stripped) >= 20 and re.match(r'^\d', line_stripped):
                        leader_line = line_stripped[:24].ljust(24, ' ')
                        record.leader = leader_line
                        logger.debug(f"Found leader: '{leader_line}'")
                        continue
                    # Also check for "Leader:" prefix (some servers use this)
                    elif line_stripped.startswith('Leader:'):
                        leader_match = re.search(r'Leader:\s*(.+)', line_stripped)
                        if leader_match:
                            leader_line = leader_match.group(1).strip()[:24].ljust(24, ' ')
                            record.leader = leader_line
                            logger.debug(f"Found leader with prefix: '{leader_line}'")
                            continue
                
                # Now process fields
                # Skip lines that don't look like MARC fields
                if not re.match(r'^\d{3}', line_stripped):
                    continue
                
                # Parse MARC field: "001 2165697" or "245 14 $a Title" or "008 721219t19581953nyu..."
                # Format: TAG [INDICATORS] DATA
                field_match = re.match(r'^(\d{3})\s+(.+)$', line_stripped)
                
                if not field_match:
                    continue
                
                tag = field_match.group(1)
                rest = field_match.group(2)
                
                # Check if rest is valid
                if not rest or not isinstance(rest, str):
                    continue
                
                rest = rest.strip()
                
                # Control fields (001-009) - no indicators, just data
                if tag.startswith('00') and len(tag) == 3:
                    # For control fields, use Field with data parameter
                    # Format: Field(tag='001', data='2165697')
                    if rest:  # Only add if data exists
                        record.add_field(Field(tag=tag, data=rest))
                    continue
                
                # Data fields (010-999) - have indicators and subfields
                # Format: "245 14 $a Title $b Subtitle"
                # Indicators are 1-2 characters, might have spaces
                # Split indicators from data
                indicator_match = re.match(r'^([\d\s]{1,2})\s+(.+)$', rest)
                
                if indicator_match:
                    indicators_str = indicator_match.group(1).strip()
                    data = indicator_match.group(2).strip()
                    
                    # Parse indicators (can be 1 or 2 characters)
                    ind1 = indicators_str[0] if len(indicators_str) > 0 else ' '
                    ind2 = indicators_str[1] if len(indicators_str) > 1 else ' '
                else:
                    # No indicators, use defaults
                    ind1 = ' '
                    ind2 = ' '
                    data = rest
                
                # Parse subfields - format: "$a value $b value"
                subfields = []
                if data and isinstance(data, str):
                    subfield_parts = re.findall(r'\$([a-z0-9])\s*([^\$]*)', data)
                    
                    if subfield_parts:
                        for code, value in subfield_parts:
                            if value:
                                value_clean = value.strip()
                                if value_clean:  # Only add non-empty subfields
                                    subfields.append(Subfield(code=code, value=value_clean))
                    
                    # If no subfields found but we have data, might be a field without $ indicators
                    # This shouldn't happen in standard MARC, but handle it
                    if not subfields and data:
                        # Skip - this is likely a parsing error
                        logger.debug(f"No subfields found for field {tag} with data: {data[:50]}")
                        continue
                else:
                    # Skip if data is invalid
                    continue
                
                if subfields:
                    field = Field(
                        tag=tag,
                        indicators=[ind1, ind2],
                        subfields=subfields
                    )
                    record.add_field(field)

            # Return record if it has fields or a valid leader
            if len(record.fields) > 0 or (record.leader and len(record.leader.strip()) > 0):
                return record
            return None

        except Exception as e:
            logger.error(f"Error creating MARC record: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return None

    def get_record_by_id(self, record_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific record by its control number

        Args:
            record_id: Record control number

        Returns:
            LibraryRecordLite dictionary or None
        """
        try:
            results = self.search(record_id, query_type="isbn", limit=1)
            return results[0] if results else None
        except Exception as e:
            logger.error(f"Error retrieving record {record_id}: {str(e)}")
            return None

    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()
        return False
