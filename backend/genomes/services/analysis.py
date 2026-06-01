from pathlib import Path

from Bio.Seq import Seq
from Bio.SeqUtils import MeltingTemp as mt

from rest_framework.response import Response


MAX_UPLOAD_BYTES = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {'.fasta', '.fa', '.fna', '.ffn', '.faa', '.frn'}


def clean_sequence_id(header: str, max_length: int = 25) -> str:
    if not header:
        return ''
    clean_id = next((part for part in header.split('|') if part.strip()), '')
    if not clean_id:
        return ''
    return clean_id[:max_length] + '...' if len(clean_id) > max_length else clean_id


def process_sequence(seq_id, seq_str):
    seq_str = seq_str.upper()
    length = len(seq_str)

    if length == 0:
        return {'id': seq_id, 'length': 0, 'gc_content': 0, 'a_perc': 0, 't_perc': 0, 'c_perc': 0, 'g_perc': 0, 'melting_temp': 0}

    count_a, count_t = seq_str.count('A'), seq_str.count('T')
    count_c, count_g = seq_str.count('C'), seq_str.count('G')

    try:
        tm_val = round(float(mt.Tm_NN(Seq(seq_str), nn_table=mt.DNA_NN3)), 2)
    except Exception:
        tm_val = 0

    return {
        'id': seq_id,
        'length': length,
        'gc_content': round(((count_g + count_c) / length) * 100, 2),
        'a_perc': round((count_a / length) * 100, 2),
        't_perc': round((count_t / length) * 100, 2),
        'c_perc': round((count_c / length) * 100, 2),
        'g_perc': round((count_g / length) * 100, 2),
        'melting_temp': tm_val,
    }


def build_cleaned_fasta(cleaned_sequences: list[tuple[str, str]]) -> str:
    lines = []
    for header, seq_str in cleaned_sequences:
        wrapped = '\n'.join(seq_str[i:i + 80] for i in range(0, len(seq_str), 80))
        lines.append(f'>{header}\n{wrapped}')
    return '\n'.join(lines)


def read_upload(request):
    if 'fasta_file' not in request.FILES:
        return Response({'error': 'O ficheiro fasta_file é obrigatório.'}, status=400)

    file = request.FILES['fasta_file']
    ext = Path(file.name).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        return Response({'error': f'Tipo de ficheiro inválido: {ext}'}, status=400)

    raw = file.read(MAX_UPLOAD_BYTES + 1)
    if len(raw) > MAX_UPLOAD_BYTES:
        return Response({'error': 'Ficheiro demasiado grande. Limite: 50MB.'}, status=413)

    content = raw.decode('utf-8-sig').strip().replace('\x00', '')
    meta_order = request.data.get('meta_order', '').strip()
    return content, meta_order
