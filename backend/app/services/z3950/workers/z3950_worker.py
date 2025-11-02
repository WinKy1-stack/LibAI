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
            result = subprocess.run(
                ["yaz-client"],
                input=script,
                capture_output=True,
                text=True,
                timeout=self.config.get('timeout', 30)
            )

            output = result.stdout

            # Parse total hits
            total = 0
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
            # Split output by record separators
            raw_records = re.split(r'\n(?=\[.*?\]Record type:|Record type:)', output)

            for raw in raw_records:
                if ('Record type:' not in raw and 'Voyager' not in raw) or len(raw) < 100:
                    continue

                try:
                    marc_record = self._parse_marc_from_text(raw)
                    if marc_record:
                        normalized = MARCParser.parse_to_library_record(marc_record)
                        normalized['source'] = {
                            'name': self.config['name'],
                            'key': self.source_key
                        }
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

        Args:
            text: MARC text from yaz-client

        Returns:
            pymarc.Record object or None
        """
        try:
            from pymarc import Record, Field, Subfield

            record = Record()
            lines = text.split('\n')

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                # Parse MARC field format: "245 10 $a Title $b Subtitle"
                field_match = re.match(r'^(\d{3})\s+(.{2})\s+(.+)$', line)

                if field_match:
                    tag = field_match.group(1)
                    indicators = field_match.group(2)
                    data = field_match.group(3)

                    # Skip leader
                    if tag == '000' or tag.lower().startswith('lead'):
                        continue

                    # Control fields (001-009)
                    if tag.startswith('00'):
                        from pymarc import Field as ControlField
                        record.add_field(ControlField(tag, data))
                        continue

                    # Data fields with subfields
                    ind1 = indicators[0] if len(indicators) > 0 else ' '
                    ind2 = indicators[1] if len(indicators) > 1 else ' '

                    # Parse subfields - use Subfield objects
                    subfields = []
                    subfield_parts = re.findall(r'\$([a-z0-9])\s*([^\$]+)', data)

                    for code, value in subfield_parts:
                        subfields.append(Subfield(code=code, value=value.strip()))

                    if subfields:
                        field = Field(
                            tag=tag,
                            indicators=[ind1, ind2],
                            subfields=subfields
                        )
                        record.add_field(field)

            return record if len(record.fields) > 0 else None

        except Exception as e:
            logger.error(f"Error creating MARC record: {str(e)}")
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
