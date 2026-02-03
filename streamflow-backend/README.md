# StreamFlow Backend

FastAPI-based backend for StreamFlow streaming platform.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

5. Run database migrations:
```bash
alembic upgrade head
```

## Running Locally

Start the development server:
```bash
uvicorn app.main:app --reload
```

API documentation available at: http://localhost:8000/docs

## Running Tests

```bash
pytest tests/ -v
```

With coverage:
```bash
pytest tests/ -v --cov=app --cov-report=html
```

## Code Quality

Linting:
```bash
ruff check app/ tests/
```

Formatting:
```bash
ruff format app/ tests/
```

Type checking:
```bash
mypy app/
```

## Environment Variables

See `.env.example` for required configuration.

Key variables:
- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - JWT secret key
- `TMDB_API_KEY` - TMDB API key
- `VIDSRC_PRIMARY_DOMAIN` - Primary Vidsrc domain
