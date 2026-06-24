# Genome Web Platform

Lightweight Django app for ingesting, storing, and exploring viral genomic sequences at scale.

Key goals: fast bulk import, precomputed statistics for querying, and easy local development with Docker.

## Tech stack
- **Backend:** Django 5.2, Python 3.11
- **Database:** PostgreSQL 16
- **Containers:** Docker & Docker Compose

---

## Quick Start (Local)
1. Copy environment variables

	Create a `.env` file in the repository root with the following keys:

	```env
	DB_NAME=viraldb
	DB_USER=viral
	DB_PASSWORD=your_secure_password
	DJANGO_SECRET_KEY=your_random_secret_key
	DJANGO_DEBUG=True
	DJANGO_ALLOWED_HOSTS=*
	```

2. Place data files

	Put your CSVs into `backend/data/`:

	- `backend/data/metadados.csv`
	- `backend/data/genomes.csv`

3. Build and start containers

	```bash
	docker-compose up -d --build
	```

4. Create the database schema

	```bash
	docker-compose exec backend python manage.py makemigrations
	docker-compose exec backend python manage.py migrate
	```

5. Import data (fast bulk loader)

	```bash
	docker-compose exec backend python manage.py populate_db
	```

6. Visit the site

	Open http://localhost:8000 in your browser once the import finishes.

---

## Common Maintenance
- Stop containers: `docker-compose down`
- Reset database (drops volumes):

  ```bash
  docker-compose down -v
  docker-compose up -d
  docker-compose exec backend python manage.py migrate
  docker-compose exec backend python manage.py populate_db
  ```

---

## Project layout (key files)
- `backend/data/` — raw CSV inputs.
- `backend/genomes/models.py` — DB schema and indexes.
- `backend/genomes/management/commands/populate_db.py` — optimized bulk-loader.
- `backend/genomes/views.py` — list/detail views and pagination.

---

## Troubleshooting
- If migrations fail, confirm DB env vars in `.env` and that the DB container is healthy.
- If `populate_db` is slow or runs out of memory, try increasing container memory or split CSVs.



Contact 
docker compose exec db mysql -u root -p
SHOW DATABASES;
USE database_name;
SHOW TABLES LIKE '%contact%';
SELECT
    id,
    name,
    email,
    category,
    subject,
    message,
    status,
    created_at
FROM genomes_contactmessage
ORDER BY created_at DESC;
