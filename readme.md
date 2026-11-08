# Genome Web Platform

Web platform for ingesting, storing and exploring viral genomic sequences at scale. It offers species browsing, precomputed statistics, graphs, file downloads, and on-the-fly analysis of uploaded FASTA files.

Key goals: fast bulk import, precomputed statistics for quick queries, and easy local development with Docker.

## Tech stack
- **Backend:** Django 6.1, Django REST Framework, Python 3.13, Gunicorn, Biopython
- **Database:** MySQL 8.4
- **Frontend:** React 19, Vite, Tailwind CSS 4, React Query, React Router
- **Web server / proxy:** nginx
- **Containers:** Docker & Docker Compose

---

## Architecture

```
Browser ──► nginx ──┬─► /api/, /admin/  ─► Django (Gunicorn) ─► MySQL
                    ├─► /static/        ─► Django static files (admin assets)
                    └─► /               ─► React app (built files in production, Vite dev server locally)
```

- The React frontend talks to the backend only through `/api/...`.
- In production only nginx is exposed (port 80). MySQL and Django stay inside the Docker network.
- Django reads data files from `backend/data/` and graph PDFs from `backend/static/graphs/`. Neither is stored in git.

---

## Project layout

```
.
├── docker-compose.yml          # Development stack (Django runserver, Vite dev server, nginx)
├── docker-compose.prod.yml     # Production stack (Gunicorn, built React app, nginx)
├── nginx/
│   ├── nginx.conf              # Dev proxy
│   └── nginx.prod.conf         # Production proxy + static files
├── backend/
│   ├── config/                 # Django settings, URLs, WSGI/ASGI
│   ├── genomes/
│   │   ├── models.py           # Taxonomy, Sequence, SequenceMetrics
│   │   ├── views.py            # API viewsets and download endpoints
│   │   ├── serializers.py
│   │   ├── urls.py             # API routes
│   │   ├── services/           # analysis.py (FASTA metrics), graph.py (graph file lookup)
│   │   ├── utils/uniformizer.py        # FASTA cleaning
│   │   └── management/commands/
│   │       ├── populate_db.py          # Bulk loader from the CSV files
│   │       └── update_metadata.py      # Metadata refresh from metadados.csv
│   ├── data/                   # Not in git: CSVs, zip archives (see below)
│   └── static/graphs/          # Not in git: pre-computed graph PDFs
└── frontend/
    └── src/
        ├── pages/              # Home, SpeciesList, SpeciesDetail, SequenceAnalysis, Documentation
        ├── components/         # layout, species, sequences, ui
        ├── api/genomes.js      # All backend calls
        ├── hooks/              # React Query hooks, telemetry
        └── context/            # Theme (light/dark)
```

### Data files (not in git)

| Path | Used by |
|---|---|
| `backend/data/metadados.csv`, `backend/data/genomes.csv` | `populate_db` and `update_metadata` (database import only) |
| `backend/data/species_compressed/<Species>.zip` | Per-species download endpoint |
| `backend/data/all_genomes_clean.fasta.zip` | "Download all FASTA (zip)" |
| `backend/data/all_genomes_clean.fasta.zst` | "Download all FASTA (Zstandard)" |
| `backend/data/cncb_sequences.zip` | Single-sequence FASTA download (read directly as a zip) |
| `backend/static/graphs/<Species>/...` | Graph PDFs on the species page |

Species folder and file names are the species name with spaces, hyphens and dots replaced by underscores.

---

## Data model

- **Taxonomy:** one row per species (family, genus) plus precomputed statistics: sequence count, min/max length, GC content, melting temperature, entropy, first/last collection date.
- **Sequence:** one row per accession (organism name, country, collection date, source, molecular type, completeness flag), linked to a taxonomy.
- **SequenceMetrics:** one row per sequence (length, GC content, melting temperature, entropy, % A/C/G/T).

---

## API

All routes are under `/api/`.

| Method | Route | Description |
|---|---|---|
| GET | `/taxonomy/` | Paginated list of species |
| GET | `/taxonomy/<id>/` | Species detail, statistics and which graphs exist |
| GET | `/taxonomy/autocomplete/?q=` | Species name suggestions |
| GET | `/taxonomy/<id>/graph/?type=` | Graph PDF (`length`, `gc`, `entropy`, `melting_temp`, `bases_tempo`) |
| GET | `/taxonomy/<id>/download/` | Species zip |
| GET | `/sequences/` | Paginated list of sequences |
| GET | `/sequences/<accession>/fasta/` | FASTA for one sequence |
| GET | `/global/stats/` | Totals and top species |
| GET | `/global/metadata/` | Metadata as CSV |
| GET | `/global/fasta/zip/`, `/global/fasta/zstandard/` | Full FASTA download |
| GET | `/analysis/fields/` | Fields reported by the analysis |
| POST | `/analysis/fasta/` | Analyse an uploaded FASTA (`fasta_file`) |
| POST | `/analysis/uniformize/` | Clean an uploaded FASTA (`fasta_file`) |

Uploads are limited to 100 MB by the backend and 50 MB by the frontend.

---

## Local development

1. Create a `.env` file in the repository root:

   ```env
   DB_NAME=viraldb
   DB_USER=viral
   DB_PASSWORD=your_password
   DB_ROOT_PASSWORD=your_root_password
   DJANGO_SECRET_KEY=your_random_secret_key
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
   DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost
   ```

2. Put `metadados.csv` and `genomes.csv` in `backend/data/` (and the other data files if you want downloads and graphs to work).

3. Start the stack:

   ```bash
   docker compose up -d --build
   ```

4. Create the schema and import the data:

   ```bash
   docker compose exec backend python manage.py migrate
   docker compose exec backend python manage.py populate_db
   ```

5. Open http://localhost (nginx). The Vite dev server is also on http://localhost:5173 and the API on http://localhost:8000/api/.

`populate_db` truncates the three tables before importing, so it always starts from scratch.

### Frontend only

```bash
cd frontend
npm install
npm run dev      # dev server
npm run build    # production build
npm run lint
```

---

## Production

Use `docker-compose.prod.yml`, which runs Gunicorn behind nginx, serves the built React app, and exposes only port 80:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

See [DEPLOY.md](DEPLOY.md) for the full step-by-step server guide, including where every data file goes (written in Portuguese).

---

## Common maintenance
- Stop containers: `docker compose down`
- Logs: `docker compose logs -f backend`
- Reset the database (**deletes all data**):

  ```bash
  docker compose down -v
  docker compose up -d
  docker compose exec backend python manage.py migrate
  docker compose exec backend python manage.py populate_db
  ```

---

## Troubleshooting
- If migrations fail, check the DB variables in `.env` and that the DB container is healthy.
- Django 6.1 needs MySQL 8.4 or newer. An older MySQL image makes the backend fail at startup.
- If `populate_db` is slow or runs out of memory, increase the container memory. It runs in one transaction and keeps all accession IDs in memory, so very large datasets may need a batched import or a database dump restore.
- If a graph or download returns 404, the file is missing or the species folder name doesn't match (see "Data files").

---

## Contact messages (notes)

```bash
docker compose exec db mysql -u root -p
```

```sql
SHOW DATABASES;
USE database_name;
SHOW TABLES LIKE '%contact%';
SELECT id, name, email, category, subject, message, status, created_at
FROM genomes_contactmessage
ORDER BY created_at DESC;
```

This table is not defined in the current backend models, so the query only works once a contact form model exists.
