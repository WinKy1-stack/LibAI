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
        Build advanced YAZ query string with phrase search and structure

        Args:
            query: Search query
            query_type: Type of search

        Returns:
            YAZ query string optimized for accuracy
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

        # For ISBN searches - exact match only
        if query_type == "isbn":
            # Remove hyphens and spaces from ISBN
            clean_isbn = query.replace('-', '').replace(' ', '')
            return f'@attrset bib-1 @attr 1={attr} "{clean_isbn}"'

        # For title and author - use phrase search with position attribute
        # @attr 4=2 means phrase search (terms must appear in order)
        if query_type in ["title", "author"]:
            # If query has multiple words, use phrase search
            if ' ' in query.strip():
                # Add structure attribute: 4=2 for phrase, 4=6 for word list
                # Add completeness attribute: 6=3 for complete field
                return f'@attrset bib-1 @attr 1={attr} @attr 4=2 "{query}"'
            else:
                # Single word - use truncation for better matching
                # @attr 5=1 means right truncation (e.g., "python*")
                return f'@attrset bib-1 @attr 1={attr} @attr 5=1 "{query}"'

        # For subject - phrase search for precision
        if query_type == "subject":
            return f'@attrset bib-1 @attr 1={attr} @attr 4=2 "{query}"'

        # For keyword search - use word list to find all words
        # @attr 4=6 means word list (all words must appear but order doesn't matter)
        if ' ' in query.strip() and len(query.split()) > 1:
            # Multi-word keyword search - all words must appear
            words = query.split()
            if len(words) == 2:
                # For 2 words, build AND query
                return f'@attrset bib-1 @and @attr 1={attr} "{words[0]}" @attr 1={attr} "{words[1]}"'
            else:
                # For 3+ words, use word list (simpler and often more effective)
                return f'@attrset bib-1 @attr 1={attr} @attr 4=6 "{query}"'

        # Single keyword - use truncation for flexibility
        return f'@attrset bib-1 @attr 1={attr} @attr 5=1 "{query}"'

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

            logger.info(f"Searching {self.config['name']} with query_type={query_type}")
            logger.info(f"Original query: '{query}' -> YAZ query: {yaz_query}")

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

    def _extract_leader(self, line_stripped: str) -> Optional[str]:
        """
        Extract leader from a line
        
        Args:
            line_stripped: Stripped line text
            
        Returns:
            Leader string (24 chars) or None
        """
        # Check if this looks like a leader (24 characters, starts with digits)
        # Leader format: "01245cam  22003731  4500" (24 chars)
        if len(line_stripped) >= 20 and re.match(r'^\d', line_stripped):
            return line_stripped[:24].ljust(24, ' ')
        
        # Also check for "Leader:" prefix (some servers use this)
        if line_stripped.startswith('Leader:'):
            leader_match = re.search(r'Leader:\s*(.+)', line_stripped)
            if leader_match:
                return leader_match.group(1).strip()[:24].ljust(24, ' ')
        
        return None

    def _parse_control_field(self, tag: str, data: str) -> Optional[Any]:
        """
        Parse control field (001-009)
        
        Args:
            tag: Field tag
            data: Field data
            
        Returns:
            pymarc.Field object or None
        """
        from pymarc import Field
        
        if data:  # Only add if data exists
            return Field(tag=tag, data=data)
        return None

    def _parse_indicators(self, rest: str) -> tuple:
        """
        Parse indicators and data from field rest
        
        Args:
            rest: Rest of field after tag
            
        Returns:
            Tuple of (ind1, ind2, data)
        """
        # Format: "14 $a Title $b Subtitle"
        # Indicators are 1-2 characters, might have spaces
        indicator_match = re.match(r'^([\d\s]{1,2})\s+(.+)$', rest)
        
        if indicator_match:
            indicators_str = indicator_match.group(1).strip()
            data = indicator_match.group(2).strip()
            
            # Parse indicators (can be 1 or 2 characters)
            ind1 = indicators_str[0] if len(indicators_str) > 0 else ' '
            ind2 = indicators_str[1] if len(indicators_str) > 1 else ' '
            return ind1, ind2, data
        
        # No indicators, use defaults
        return ' ', ' ', rest

    def _parse_subfields(self, data: str) -> List[Any]:
        """
        Parse subfields from data string
        
        Args:
            data: Subfield data (e.g., "$a Title $b Subtitle")
            
        Returns:
            List of pymarc.Subfield objects
        """
        from pymarc import Subfield
        
        subfields = []
        if not data or not isinstance(data, str):
            return subfields
        
        # Parse subfields - format: "$a value $b value"
        subfield_parts = re.findall(r'\$([a-z0-9])\s*([^\$]*)', data)
        
        if subfield_parts:
            for code, value in subfield_parts:
                if value:
                    value_clean = value.strip()
                    if value_clean:  # Only add non-empty subfields
                        subfields.append(Subfield(code=code, value=value_clean))
        
        return subfields

    def _parse_data_field(self, tag: str, rest: str) -> Optional[Any]:
        """
        Parse data field (010-999)
        
        Args:
            tag: Field tag
            rest: Rest of field after tag
            
        Returns:
            pymarc.Field object or None
        """
        from pymarc import Field
        
        if not rest or not isinstance(rest, str):
            return None
        
        rest = rest.strip()
        
        # Parse indicators and data
        ind1, ind2, data = self._parse_indicators(rest)
        
        # Parse subfields
        subfields = self._parse_subfields(data)
        
        if not subfields:
            # No subfields found - likely a parsing error
            logger.debug(f"No subfields found for field {tag} with data: {data[:50] if data else ''}")
            return None
        
        return Field(
            tag=tag,
            indicators=[ind1, ind2],
            subfields=subfields
        )

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
            from pymarc import Record

            # Check if text is valid
            if not text or not isinstance(text, str):
                logger.warning("Invalid text for MARC parsing")
                return None

            record = Record()
            lines = text.split('\n')
            
            # State tracking
            leader_line = None
            in_record = False
            
            for line in lines:
                line_stripped = line.strip()
                if not line_stripped:
                    continue
                
                # Check for record marker (case-insensitive)
                if re.search(r'Record type:', line_stripped, re.IGNORECASE):
                    in_record = True
                    continue
                
                # Extract leader if not found yet
                if in_record and leader_line is None:
                    leader_line = self._extract_leader(line_stripped)
                    if leader_line:
                        record.leader = leader_line
                        logger.debug(f"Found leader: '{leader_line}'")
                        continue
                
                # Skip lines that don't look like MARC fields
                if not re.match(r'^\d{3}', line_stripped):
                    continue
                
                # Parse MARC field: "001 2165697" or "245 14 $a Title"
                field_match = re.match(r'^(\d{3})\s+(.+)$', line_stripped)
                if not field_match:
                    continue
                
                tag = field_match.group(1)
                rest = field_match.group(2)
                
                # Parse control fields (001-009)
                if tag.startswith('00') and len(tag) == 3:
                    field = self._parse_control_field(tag, rest)
                    if field:
                        record.add_field(field)
                    continue
                
                # Parse data fields (010-999)
                field = self._parse_data_field(tag, rest)
                if field:
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
