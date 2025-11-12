"""
MARC Parser
Converts MARC21 records to MARC21 Book Record JSON format
"""

from typing import Dict, List, Any, Optional
from pymarc import Record
import uuid
import re
from datetime import datetime, timezone
from app.models.mongodb_schemas import MARCRecordSource


class MARCParser:
    """Parse MARC21 records to normalized JSON format"""

    @staticmethod
    def parse_to_library_record(marc_record: Record, source: str = MARCRecordSource.Z3950.value) -> Dict[str, Any]:
        """
        Convert MARC record to MARC21 Book Record format

        Args:
            marc_record: pymarc.Record object
            source: Source of the record (local, z3950, oai)

        Returns:
            Dict in MARC21 Book Record format
        """
        now = datetime.now(timezone.utc).isoformat()
        
        # Extract control number (001)
        control_number = ""
        control_fields = marc_record.get_fields('001')
        if control_fields:
            control_data = control_fields[0].data
            if control_data:
                control_number = str(control_data).strip()
                # Sometimes control number might have extra spaces or formatting
                control_number = re.sub(r'\s+', '', control_number)
        
        # Extract leader
        leader = ""
        if marc_record.leader:
            leader = str(marc_record.leader).strip()
            # Leader should be 24 characters, pad if shorter
            if len(leader) < 24:
                leader = leader.ljust(24, ' ')
            elif len(leader) > 24:
                leader = leader[:24]
        
        # Extract fixed fields from 008
        fixed_fields = MARCParser._extract_fixed_fields(marc_record)
        
        # Extract identifiers (ISBN, ISSN, etc.)
        identifiers = MARCParser._extract_identifiers(marc_record)
        
        # Get first ISBN for Google Books API lookup
        first_isbn = None
        if identifiers.get('isbn'):
            first_isbn = identifiers['isbn'][0]
        
        # Extract title and contributors for Google Books fallback
        title_info = MARCParser._extract_title(marc_record)
        contributors = MARCParser._extract_contributors(marc_record)
        first_author = contributors[0]['name'] if contributors and contributors[0].get('role') == 'author' else None
        
        return {
            "record_id": str(uuid.uuid4()),
            "leader": leader,
            "control_number": control_number,
            "agency_code": MARCParser._extract_agency_code(marc_record),
            "updated_at": now,
            "created_at": now,
            "source": source,
            "rights": MARCParser._extract_rights(marc_record),
            "fixed_fields": fixed_fields,
            "identifiers": identifiers,
            "title": title_info,
            "contributors": contributors,
            "edition": MARCParser._extract_edition(marc_record),
            "publication": MARCParser._extract_publication(marc_record),
            "physical_description": MARCParser._extract_physical_description(marc_record),
            "notes": MARCParser._extract_notes(marc_record),
            "subjects": MARCParser._extract_subjects(marc_record),
            "classification": MARCParser._extract_classification(marc_record),
            "holdings": [],  # Holdings will be added separately if available
            "access": MARCParser._extract_access(marc_record),
            "format": MARCParser._extract_format(marc_record),
            "image_url": ""  # Will be populated by Google Books API integration
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
    def _extract_subjects(record: Record) -> List[str]:
        """Extract subjects from MARC fields 650, 651, 655 as simple strings"""
        subjects = []

        for field in record.get_fields('650', '651', '655'):
            term = field.get_subfields('a')
            if term:
                # Build full subject string with subdivisions
                subject_parts = [term[0].rstrip('.,;/')]
                # Get subdivisions (x, y, z, v)
                for subfield in ['x', 'y', 'z', 'v']:
                    subdivs = field.get_subfields(subfield)
                    subject_parts.extend([s.rstrip('.,;/') for s in subdivs])
                
                # Join parts with -- (MARC standard)
                subject_str = " -- ".join(subject_parts)
                subjects.append(subject_str)

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
    def _extract_identifiers(record: Record) -> Dict[str, List[str]]:
        """Extract identifiers (ISBN, ISSN, etc.) from MARC fields 020, 022"""
        identifiers = {
            "isbn": [],
            "other": []
        }

        # ISBN (020)
        for field in record.get_fields('020'):
            isbn = field.get_subfields('a')
            if isbn:
                isbn_str = isbn[0].strip()
                # Clean ISBN: remove hyphens, spaces, and extra text
                # ISBN can be: "978-0-123456789-0 (hardcover)" or "9780123456789"
                # Extract first part (before any space or parenthesis)
                isbn_clean = re.split(r'[\s\(\)]', isbn_str)[0]
                # Remove hyphens but keep digits and X
                isbn_clean = re.sub(r'[^\dX]', '', isbn_clean)
                if isbn_clean and len(isbn_clean) >= 10:  # Valid ISBN length
                    identifiers["isbn"].append(isbn_clean)

        # ISSN (022) - add to other
        for field in record.get_fields('022'):
            issn = field.get_subfields('a')
            if issn:
                identifiers["other"].append(f"ISSN:{issn[0].strip()}")

        # Other identifiers (010 LCCN, 024 other standard numbers)
        for field in record.get_fields('010'):
            lccn = field.get_subfields('a')
            if lccn:
                identifiers["other"].append(f"LCCN:{lccn[0].strip()}")
        
        for field in record.get_fields('024'):
            standard_num = field.get_subfields('a')
            if standard_num:
                identifier_type = field.indicators[1] if len(field.indicators) > 1 else 'OTHER'
                identifiers["other"].append(f"{identifier_type}:{standard_num[0].strip()}")

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
    def _extract_fixed_fields(record: Record) -> Dict[str, str]:
        """Extract fixed fields from MARC field 008"""
        fixed_fields = {
            "date_entered": "",
            "type_of_record": "",
            "language": "",
            "publication_year": ""
        }
        
        # Field 008 is a control field, access via .data
        field_008 = record.get_fields('008')
        if field_008:
            # Control field data is directly accessible
            data = field_008[0].data if hasattr(field_008[0], 'data') else None
            if not data:
                # Try as string
                data = str(field_008[0]) if field_008[0] else ""
            else:
                data = str(data)
            
            # Ensure data is at least 38 characters (MARC 008 standard length)
            # Pad with spaces if shorter
            if len(data) < 40:
                data = data.ljust(40, '|')
            
            # Date entered on file (positions 00-05) - YYMMDD format
            if len(data) >= 6:
                date_entered = data[0:6].strip()
                # Validate: should be 6 digits or spaces
                if re.match(r'^\d{6}$', date_entered) or date_entered:
                    fixed_fields["date_entered"] = date_entered
            
            # Type of record (position 06) - single character
            if len(data) >= 7:
                type_rec = data[6].strip()
                if type_rec and type_rec != '|':
                    fixed_fields["type_of_record"] = type_rec
            
            # Publication date (positions 07-10) - can be YYYY, YYY?, YYY-, etc.
            if len(data) >= 11:
                pub_date = data[7:11].strip()
                # Extract year (first 4 characters, might have ? or -)
                year_match = re.match(r'^(\d{4})', pub_date)
                if year_match:
                    fixed_fields["publication_year"] = year_match.group(1)
                elif pub_date and pub_date != '||||':
                    # Try to extract any year pattern
                    year_match = re.search(r'(\d{4})', pub_date)
                    if year_match:
                        fixed_fields["publication_year"] = year_match.group(1)
            
            # Language code (positions 35-37) - 3 character code
            if len(data) >= 38:
                lang_code = data[35:38].strip()
                # Language codes are usually 3 lowercase letters
                if lang_code and lang_code != '|||' and lang_code != '   ':
                    # Clean: remove pipe characters
                    lang_code = lang_code.replace('|', '').strip()
                    if lang_code:
                        fixed_fields["language"] = lang_code
        
        return fixed_fields

    @staticmethod
    def _extract_agency_code(record: Record) -> str:
        """Extract agency code from MARC field 003"""
        agency_fields = record.get_fields('003')
        if agency_fields:
            return str(agency_fields[0].data).strip()
        return ""

    @staticmethod
    def _extract_rights(record: Record) -> Dict[str, Any]:
        """Extract rights information from MARC fields"""
        rights = {
            "access": "",
            "format": []
        }
        
        # Check field 506 (Restrictions on Access Note)
        access_fields = record.get_fields('506')
        if access_fields:
            access_note = access_fields[0].get_subfields('a')
            if access_note:
                rights["access"] = access_note[0].strip()
        
        # Check field 540 (Terms Governing Use and Reproduction Note)
        use_fields = record.get_fields('540')
        if use_fields:
            use_note = use_fields[0].get_subfields('a')
            if use_note:
                if rights["access"]:
                    rights["access"] += "; " + use_note[0].strip()
                else:
                    rights["access"] = use_note[0].strip()
        
        return rights

    @staticmethod
    def _extract_edition(record: Record) -> str:
        """Extract edition statement from MARC field 250"""
        edition_fields = record.get_fields('250')
        if edition_fields:
            edition = edition_fields[0].get_subfields('a')
            if edition:
                return edition[0].rstrip('.,;/').strip()
        return ""

    @staticmethod
    def _extract_physical_description(record: Record) -> Dict[str, str]:
        """Extract physical description from MARC field 300"""
        physical = {
            "extent": "",
            "size": "",
            "illustration": ""
        }
        
        field_300 = record.get_fields('300')
        if field_300:
            field = field_300[0]
            # Extent (subfield a)
            extent = field.get_subfields('a')
            if extent:
                physical["extent"] = extent[0].rstrip('.,;/').strip()
            # Other physical details / illustrations (subfield b)
            illustration = field.get_subfields('b')
            if illustration:
                physical["illustration"] = illustration[0].rstrip('.,;/').strip()
            # Dimensions / size (subfield c)
            size = field.get_subfields('c')
            if size:
                physical["size"] = size[0].rstrip('.,;/').strip()
        
        return physical

    @staticmethod
    def _extract_notes(record: Record) -> List[str]:
        """Extract notes from various MARC note fields (500, 520, 504, etc.)"""
        notes = []
        
        # General notes (500)
        for field in record.get_fields('500'):
            note = field.get_subfields('a')
            if note:
                notes.append(note[0].strip())
        
        # Summary/Abstract (520)
        for field in record.get_fields('520'):
            note = field.get_subfields('a')
            if note:
                notes.append(note[0].strip())
        
        # Bibliography note (504)
        for field in record.get_fields('504'):
            note = field.get_subfields('a')
            if note:
                notes.append(note[0].strip())
        
        # Content notes (505)
        for field in record.get_fields('505'):
            note = field.get_subfields('a')
            if note:
                notes.append(note[0].strip())
        
        return notes

    @staticmethod
    def _extract_classification(record: Record) -> Dict[str, str]:
        """Extract classification numbers from MARC fields 082 (DDC) and 050 (LCC)"""
        classification = {
            "ddc": "",
            "lcc": ""
        }
        
        # Dewey Decimal Classification (082)
        ddc_fields = record.get_fields('082')
        if ddc_fields:
            ddc = ddc_fields[0].get_subfields('a')
            if ddc:
                classification["ddc"] = ddc[0].strip()
        
        # Library of Congress Classification (050)
        lcc_fields = record.get_fields('050')
        if lcc_fields:
            lcc_parts = []
            # Subfield a (classification number)
            lcc_a = lcc_fields[0].get_subfields('a')
            if lcc_a:
                lcc_parts.append(lcc_a[0].strip())
            # Subfield b (item number)
            lcc_b = lcc_fields[0].get_subfields('b')
            if lcc_b:
                lcc_parts.append(lcc_b[0].strip())
            if lcc_parts:
                classification["lcc"] = " ".join(lcc_parts)
        
        return classification

    @staticmethod
    def _extract_access(record: Record) -> Dict[str, str]:
        """Extract access information from MARC field 856 (Electronic Location and Access)"""
        access = {
            "online_url": "",
            "restrictions": ""
        }
        
        # Field 856 (Electronic Location and Access)
        url_fields = record.get_fields('856')
        if url_fields:
            # Get URL from subfield u
            url = url_fields[0].get_subfields('u')
            if url:
                access["online_url"] = url[0].strip()
            
            # Get restrictions from subfield z
            restrictions = url_fields[0].get_subfields('z')
            if restrictions:
                access["restrictions"] = restrictions[0].strip()
        
        return access

    @staticmethod
    def parse_batch(marc_records: List[Record], source: str = MARCRecordSource.Z3950.value) -> List[Dict[str, Any]]:
        """
        Parse multiple MARC records

        Args:
            marc_records: List of pymarc.Record objects
            source: Source of the records

        Returns:
            List of MARC21 Book Record dictionaries
        """
        return [MARCParser.parse_to_library_record(record, source) for record in marc_records]
