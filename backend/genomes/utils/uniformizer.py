import hashlib
import re
from io import StringIO

from Bio import SeqIO

DEFAULT_QUALITY_THRESHOLD = 2.0

STANDARD_HEADER_FIELDS = [
    "accession", "family", "genus", "species",
    "organism_name", "molecular_type", "collection_date",
    "country", "completenessFlag", "source",
]

FIELD_ALIASES = {
    "acc": "accession", "accession": "accession",
    "family": "family", "genus": "genus",
    "species": "species", "specie": "species",
    "organism": "organism_name", "organism_name": "organism_name",
    "molecular_type": "molecular_type", "mol_type": "molecular_type",
    "collection_date": "collection_date", "collection date": "collection_date",
    "date": "collection_date",
    "country": "country", "location": "country",
    "completenessflag": "completenessFlag",
    "completeness_flag": "completenessFlag",
    "completeness": "completenessFlag",
    "source": "source",
}

_ACCESSION_RE = re.compile(r'^[A-Z]{1,2}_?[A-Z0-9]{4,}\.\d+|^[A-Z]{2}\d{6,}')


def _seq_hash(sequence: str) -> str:
    return hashlib.sha256(sequence.upper().encode()).hexdigest()


def is_quality_ok(sequence: str, threshold: float = DEFAULT_QUALITY_THRESHOLD) -> bool:
    if not sequence:
        return False
    bases = sequence.upper().replace('-', '')
    if not bases:
        return False
    ambiguous = sum(1 for b in bases if b not in 'ACGT')
    return (ambiguous / len(bases)) * 100 <= threshold


def _normalize_field(raw: str) -> str:
    key = raw.strip().lower().replace("-", "_")
    return FIELD_ALIASES.get(key, key.replace(" ", "_"))


def _parse_meta_order(meta_order_str: str) -> list[str]:
    fields = [_normalize_field(f) for f in meta_order_str.split(",") if f.strip()]
    if not fields:
        raise ValueError("Header order string is empty or invalid.")
    unknown = [f for f in fields if f not in STANDARD_HEADER_FIELDS]
    if unknown:
        raise ValueError(
            f"Invalid fields in header order: {', '.join(unknown)}. "
            f"Valid fields: {', '.join(STANDARD_HEADER_FIELDS)}"
        )
    return fields


def _parse_header(raw_header: str, order_fields: list[str]) -> str:
    data = {k: "" for k in STANDARD_HEADER_FIELDS}
    raw_header = raw_header.strip()[:500]  # cap before regex work

    if "=" in raw_header:
        for part in re.split(r"[|;]", raw_header):
            part = part.strip()
            if "=" not in part:
                continue
            k, v = part.split("=", 1)
            k = _normalize_field(k)
            if k in data:
                data[k] = v.strip().strip('"')
    else:
        tokens = [t.strip() for t in raw_header.split("|")]
        if len(tokens) == 1:
            parts = raw_header.split(maxsplit=1)
            data["accession"]    = parts[0] if parts else ""
            data["organism_name"] = parts[1] if len(parts) > 1 else ""
        else:
            for i, token in enumerate(tokens):
                if i >= len(order_fields):
                    break
                field = _normalize_field(order_fields[i])
                if field in data and token:
                    data[field] = token

    return "|".join(data.get(f, "") for f in STANDARD_HEADER_FIELDS)


def _is_sequence_line(line: str) -> bool:
    stripped = line.strip().upper().replace(' ', '').replace('-', '')
    if len(stripped) < 8:
        return False
    valid = set('ACGTNRYKMSWBDHV')
    return sum(1 for c in stripped if c in valid) / len(stripped) >= 0.9


def _has_headers(content: str) -> bool:
    if content.startswith('>'):
        return True
    for line in content.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if '\t' in line:
            return True
        if not _is_sequence_line(stripped):
            return True
    return False


def _to_fasta(content: str) -> str:
    content = content.replace('\r\n', '\n').replace('\r', '\n')

    if content.startswith('>'):
        return content

    if '\t' in content:
        lines = []
        for line in content.splitlines():
            if '\t' in line:
                h, s = line.split('\t', 1)
                lines.extend([f'>{h.strip()}', s.strip()])
            else:
                lines.append(line)
        return '\n'.join(lines)

    raw_lines = content.splitlines()
    fixed = []
    for i, line in enumerate(raw_lines):
        stripped = line.strip()
        if not stripped:
            continue
        next_line = raw_lines[i + 1].strip() if i + 1 < len(raw_lines) else ""
        is_header = (
            not _is_sequence_line(stripped)
            and (_is_sequence_line(next_line) or bool(_ACCESSION_RE.match(stripped)))
        )
        fixed.append(('>' + stripped) if is_header else line)

    return '\n'.join(fixed)


def _split_headerless_blocks(content: str) -> list[str]:
    blocks, current = [], []
    for line in content.splitlines():
        stripped = line.strip()
        if not stripped:
            if current:
                blocks.append(''.join(current))
                current = []
        else:
            current.append(stripped)
    if current:
        blocks.append(''.join(current))
    return [b for b in blocks if b]


def _count_original_sequences(content: str) -> int:
    if content.startswith('>'):
        return content.count('>')
    if not _has_headers(content):
        return len(_split_headerless_blocks(content))
    return len([l for l in content.splitlines() if l.strip() and not l.startswith('>')])


def uniformize_sequence_data(
    fasta_content: str,
    meta_order_str: str = "",
    quality_threshold: float = DEFAULT_QUALITY_THRESHOLD,
    strip_gaps: bool = False,
) -> list[tuple[str, str]]:
    content = fasta_content.strip()
    if not content:
        return []

    seen_hashes: set[str] = set()
    results: list[tuple[str, str]] = []

    if not _has_headers(content):
        for raw_seq in _split_headerless_blocks(content):
            raw_seq = raw_seq.replace(' ', '').upper()
            if strip_gaps:
                raw_seq = raw_seq.replace('-', '')
            if not raw_seq or not is_quality_ok(raw_seq, quality_threshold):
                continue
            h = _seq_hash(raw_seq)
            if h in seen_hashes:
                continue
            seen_hashes.add(h)
            results.append((f"seq_{h[:8]}", raw_seq))
        return results

    order_fields = _parse_meta_order(meta_order_str) if meta_order_str else []
    fasta_text   = _to_fasta(content)

    for record in SeqIO.parse(StringIO(fasta_text), "fasta"):
        sequence = str(record.seq).upper()
        if strip_gaps:
            sequence = sequence.replace('-', '')
        if not sequence or not is_quality_ok(sequence, quality_threshold):
            continue
        h = _seq_hash(sequence)
        if h in seen_hashes:
            continue
        seen_hashes.add(h)
        header = _parse_header(record.description, order_fields) if order_fields else f"seq_{h[:8]}"
        results.append((header, sequence))

    return results