# StreamFlow

A Netflix-style streaming web application built with React and FastAPI, enabling users to browse and watch movies and TV shows.

## Features

- 🔐 **Email-free Authentication** - Secure registration with one-time recovery codes
- 🎬 **Browse Content** - Trending movies, popular shows, and advanced search
- 📺 **Video Streaming** - Watch movies and TV shows with Vidsrc integration
- 📚 **Custom Watchlists** - Create and manage personalized lists
- ⏯️ **Resume Watching** - Pick up where you left off with watch history tracking
- 📊 **Statistics** - View your watching stats and preferences
- 📱 **Responsive Design** - Mobile-friendly interface with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- Vite
- React Router v6
- Axios
- Tailwind CSS

### Backend
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy 2.0
- JWT Authentication
- TMDB API Integration

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+

### Backend Setup

1. Navigate to backend directory:
```bash
cd streamflow-backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run migrations:
```bash
alembic upgrade head
```

6. Start server:
```bash
python -m uvicorn main:app --reload
```

Backend runs at: http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd streamflow-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with backend URL
```

4. Start development server:
```bash
npm run dev
```

Frontend runs at: http://localhost:5173

## Testing

### Backend Tests
```bash
cd streamflow-backend
pytest
```

### Build Frontend
```bash
cd streamflow-frontend
npm run build
```

## Docker Deployment

Run StreamFlow in a single container with both frontend and backend:

### Prerequisites
- Docker or Podman installed
- TMDB API key from https://www.themoviedb.org/settings/api

### Build Image
```bash
docker build -t streamflow:latest .
# or with Podman
podman build -t streamflow:latest .
```

### Run Container
```bash
docker run -d -p 8000:8000 \
  -e DATABASE_URL="sqlite:///./streamflow.db" \
  -e SECRET_KEY="your-secret-key-here" \
  -e TMDB_API_KEY="your-tmdb-api-key" \
  -e VIDSRC_PRIMARY_DOMAIN="vidsrc.to" \
  -e CORS_ORIGINS="http://localhost:8000" \
  --name streamflow \
  streamflow:latest
```

Or use the `.env` file:
```bash
docker run -d -p 8000:8000 \
  --env-file streamflow-backend/.env \
  --name streamflow \
  streamflow:latest
```

Access the application at: **http://localhost:8000**

### Container Management
```bash
# View logs
docker logs -f streamflow

# Stop container
docker stop streamflow

# Start container
docker start streamflow

# Remove container
docker rm -f streamflow
```

For production deployment with PostgreSQL, see [DEPLOYMENT_COMBINED.md](DEPLOYMENT_COMBINED.md).

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

## Project Structure

```
streamflow/
├── streamflow-backend/     # FastAPI backend
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Core utilities
│   │   ├── models/        # Database models
│   │   ├── repositories/  # Data access layer
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   └── tests/             # Backend tests
├── streamflow-frontend/    # React frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       ├── context/       # React context
│       ├── hooks/         # Custom hooks
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── utils/         # Utilities
└── README.md
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/streamflow
SECRET_KEY=your-secret-key
TMDB_API_KEY=your-tmdb-api-key
VIDSRC_PRIMARY_DOMAIN=vidsrc.to
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
