"""
MARC Parser
Converts MARC21 records to LibraryRecordLite JSON format
"""

from typing import Dict, List, Any, Optional
from pymarc import Record
import uuid
import re


class MARCParser:
    """Parse MARC21 records to normalized JSON format"""

    @staticmethod
    def parse_to_library_record(marc_record: Record) -> Dict[str, Any]:
        """
        Convert MARC record to LibraryRecordLite format

        Args:
            marc_record: pymarc.Record object

        Returns:
            Dict in LibraryRecordLite format
        """
        return {
            "record_id": str(uuid.uuid4()),
            "title": MARCParser._extract_title(marc_record),
            "contributors": MARCParser._extract_contributors(marc_record),
            "subjects": MARCParser._extract_subjects(marc_record),
            "publication": MARCParser._extract_publication(marc_record),
            "identifiers": MARCParser._extract_identifiers(marc_record),
            "languages": MARCParser._extract_languages(marc_record),
            "format": MARCParser._extract_format(marc_record),
            "holdings": []  # Holdings will be added separately if available
        }

    @staticmethod
    def _extract_title(record: Record) -> Dict[str, Optional[str]]:
        """Extract title from MARC field 245"""
        title_field = record.get_fields('245')
        if not title_field:
            return {"main": "Unknown Title", "subtitle": None}

        field = title_field[0]
        main_title = field.get_subfields('a')[0] if field.get_subfields('a') else "Unknown Title"
        subtitle = field.get_subfields('b')[0] if field.get_subfields('b') else None

        # Clean up title (remove trailing punctuation like :, /, etc.)
        main_title = main_title.rstrip(' :;/,.')
        if subtitle:
            subtitle = subtitle.rstrip(' :;/,.')

        return {
            "main": main_title,
            "subtitle": subtitle
        }

    @staticmethod
    def _extract_contributors(record: Record) -> List[Dict[str, str]]:
        """Extract contributors from MARC fields 100, 700, 110, 710"""
        contributors = []

        # Main author (100)
        for field in record.get_fields('100'):
            name = field.get_subfields('a')
            if name:
                contributors.append({
                    "role": "author",
                    "name": name[0].rstrip('.,;/')
                })

        # Additional authors (700)
        for field in record.get_fields('700'):
            name = field.get_subfields('a')
            if name:
                contributors.append({
                    "role": "contributor",
                    "name": name[0].rstrip('.,;/')
                })

        # Corporate authors (110, 710)
        for field in record.get_fields('110', '710'):
            name = field.get_subfields('a')
            if name:
                contributors.append({
                    "role": "corporate",
                    "name": name[0].rstrip('.,;/')
                })

        return contributors

    @staticmethod
    def _extract_subjects(record: Record) -> List[Dict[str, Any]]:
        """Extract subjects from MARC fields 650, 651, 655"""
        subjects = []

        for field in record.get_fields('650', '651', '655'):
            term = field.get_subfields('a')
            if term:
                subdivisions = []
                # Get subdivisions (x, y, z, v)
                for subfield in ['x', 'y', 'z', 'v']:
                    subdivs = field.get_subfields(subfield)
                    subdivisions.extend([s.rstrip('.,;/') for s in subdivs])

                subjects.append({
                    "term": term[0].rstrip('.,;/'),
                    "subdivisions": subdivisions
                })

        return subjects

    @staticmethod
    def _extract_publication(record: Record) -> Dict[str, Optional[str]]:
        """Extract publication info from MARC field 260 or 264"""
        pub_info = {
            "place": None,
            "publisher": None,
            "year": ""
        }

        # Try 264 first (RDA), then 260 (AACR2)
        pub_fields = record.get_fields('264', '260')
        if not pub_fields:
            return pub_info

        field = pub_fields[0]

        # Place (subfield a)
        place = field.get_subfields('a')
        if place:
            pub_info["place"] = place[0].rstrip(' :;/,.')

        # Publisher (subfield b)
        publisher = field.get_subfields('b')
        if publisher:
            pub_info["publisher"] = publisher[0].rstrip(' :;/,.')

        # Year (subfield c)
        year = field.get_subfields('c')
        if year:
            # Extract 4-digit year using regex
            year_match = re.search(r'\b(19|20)\d{2}\b', year[0])
            if year_match:
                pub_info["year"] = year_match.group(0)

        return pub_info

    @staticmethod
    def _extract_identifiers(record: Record) -> Dict[str, List[Dict[str, str]]]:
        """Extract identifiers (ISBN, ISSN, etc.) from MARC fields 020, 022"""
        identifiers = {
            "isbn": [],
            "issn": []
        }

        # ISBN (020)
        for field in record.get_fields('020'):
            isbn = field.get_subfields('a')
            if isbn:
                # Clean ISBN (remove hyphens and extra text)
                isbn_clean = isbn[0].split()[0].replace('-', '')
                identifiers["isbn"].append({"value": isbn_clean})

        # ISSN (022)
        for field in record.get_fields('022'):
            issn = field.get_subfields('a')
            if issn:
                identifiers["issn"].append({"value": issn[0].strip()})

        # Remove ISSN if not used
        if not identifiers["issn"]:
            del identifiers["issn"]

        return identifiers

    @staticmethod
    def _extract_languages(record: Record) -> List[str]:
        """Extract languages from MARC field 008 and 041"""
        languages = []

        # From field 008 (positions 35-37)
        field_008 = record.get_fields('008')
        if field_008:
            data = str(field_008[0].data) if field_008[0].data else ""
            if len(data) >= 38:
                lang_code = data[35:38].strip()
                if lang_code and lang_code != '|||':
                    languages.append(lang_code)

        # Additional languages from 041
        for field in record.get_fields('041'):
            for subfield in ['a', 'd', 'h']:
                langs = field.get_subfields(subfield)
                languages.extend(langs)

        # Remove duplicates and return
        return list(set(filter(None, languages)))

    @staticmethod
    def _extract_format(record: Record) -> List[str]:
        """Extract format/material type from leader and 007"""
        formats = []

        # Get format from leader position 6-7
        leader = str(record.leader) if record.leader else ""
        if len(leader) >= 7:
            type_code = leader[6]
            blvl_code = leader[7]

            format_map = {
                'a': 'book',
                't': 'book',
                'c': 'music',
                'd': 'music',
                'e': 'map',
                'f': 'map',
                'g': 'video',
                'i': 'audio',
                'j': 'audio',
                'k': 'image',
                'm': 'computer_file',
                'o': 'kit',
                'p': 'mixed'
            }

            if type_code in format_map:
                formats.append(format_map[type_code])

        # Additional format from 007
        for field in record.get_fields('007'):
            data = str(field.data)
            if data:
                category = data[0]
                format_007_map = {
                    'c': 'electronic',
                    'v': 'video',
                    's': 'audio',
                    'm': 'film',
                    'k': 'image'
                }
                if category in format_007_map:
                    fmt = format_007_map[category]
                    if fmt not in formats:
                        formats.append(fmt)

        return formats if formats else ['unknown']

    @staticmethod
    def parse_batch(marc_records: List[Record]) -> List[Dict[str, Any]]:
        """
        Parse multiple MARC records

        Args:
            marc_records: List of pymarc.Record objects

        Returns:
            List of LibraryRecordLite dictionaries
        """
        return [MARCParser.parse_to_library_record(record) for record in marc_records]
