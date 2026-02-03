# StreamFlow - Technical Specification

## Difficulty Assessment

**Complexity Level:** **HARD**

**Justification:**
- Full-stack application built from scratch
- Multiple complex subsystems: authentication, video streaming, user management, watchlists, statistics
- External API integrations (TMDB, Vidsrc) with fallback handling
- Database design with multiple related tables and foreign key relationships
- Security-critical features (JWT, password hashing, recovery codes, rate limiting)
- Responsive frontend with dynamic carousels and video player integration
- Real-time watch position tracking and resume functionality

---

## 1. Technical Context

### 1.1 Technology Stack

**Backend:**
- **Language:** Python 3.11+
- **Framework:** FastAPI 0.104+
- **Database:** PostgreSQL 15+ (SQLite for development)
- **ORM:** SQLAlchemy 2.0+
- **Migration Tool:** Alembic
- **Authentication:** python-jose[cryptography] (JWT), passlib[bcrypt] (password hashing)
- **HTTP Client:** httpx (async support for external APIs)
- **Caching:** Redis (optional for TMDB caching)
- **Validation:** Pydantic v2
- **CORS:** fastapi.middleware.cors

**Frontend:**
- **HTML5** + **Tailwind CSS 3.x**
- **JavaScript Framework:** React 18+ (with Vite as build tool)
- **State Management:** React Context API
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **UI Components:** Custom components + Headless UI (for accessible components)

**External APIs:**
- **TMDB API:** v3 (https://api.themoviedb.org/3/)
- **Vidsrc API:** https://vidsrc.me/embed/ (primary), with NEW domain fallbacks
- **API Documentation:** https://vidsrcme.ru/api/, https://developer.themoviedb.org/docs

**Development Tools:**
- **Backend Testing:** pytest, pytest-asyncio
- **Frontend Testing:** Vitest, React Testing Library
- **Linting:** ruff (Python), ESLint (JavaScript)
- **Formatting:** ruff format (Python), Prettier (JavaScript)
- **Type Checking:** mypy (Python), TypeScript (optional for frontend)

---

## 2. Implementation Approach

### 2.1 Architecture Pattern

**Layered Architecture** (Separation of Concerns):

1. **Presentation Layer (Frontend):** React components for UI/UX
2. **API Layer (Routes/Controllers):** FastAPI route handlers
3. **Service Layer (Business Logic):** Pure business logic, independent of framework
4. **Repository Layer (Data Access):** SQLAlchemy models and database queries
5. **Integration Layer:** External API clients (TMDB, Vidsrc)

**Key Design Principles:**
- **DRY (Don't Repeat Yourself):** Shared utilities, reusable components
- **Single Responsibility:** Each module has one clear purpose
- **Dependency Injection:** Dependencies passed via FastAPI's `Depends()`
- **Stateless Authentication:** JWT tokens (no server-side sessions)

### 2.2 Development Phases

**Phase 1:** Project Setup & Core Infrastructure
- Initialize backend and frontend projects
- Setup database models and migrations
- Configure environment variables and secrets management
- Setup testing framework

**Phase 2:** Authentication System
- User registration with recovery code generation
- Login with JWT token issuance
- Password recovery using one-time codes
- Rate limiting middleware

**Phase 3:** External API Integration
- TMDB client with caching
- Vidsrc client with domain fallback logic
- Error handling and retry mechanisms

**Phase 4:** Content Browsing & Search
- Movie/TV show endpoints using TMDB data
- Search with filters (genre, year, rating)
- Trending/popular/top-rated endpoints

**Phase 5:** Video Player & Watch History
- Vidsrc embed integration
- Watch position tracking (save/resume)
- Watch history recording

**Phase 6:** Watchlists & User Lists
- CRUD operations for custom lists
- Add/remove items from lists
- List item management

**Phase 7:** Statistics & Analytics
- Global stats (most watched, trending)
- Per-user stats (watch time, top genres)
- Watch history timeline

**Phase 8:** Frontend Development
- Homepage with carousels
- Movie/TV show detail pages
- Video player page
- User profile and lists
- Mobile-responsive UI

**Phase 9:** Testing & Refinement
- Unit tests for services and repositories
- Integration tests for API endpoints
- Frontend component tests
- End-to-end testing (optional)

---

## 3. Source Code Structure

### 3.1 Backend Structure

```
streamflow-backend/
├── app/
│   ├── main.py                      # FastAPI application entry point
│   ├── config.py                    # Environment config (Pydantic Settings)
│   │
│   ├── api/
│   │   ├── deps.py                  # Dependency injection (DB session, current user)
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py              # POST /auth/register, /auth/login, /auth/recover
│   │       ├── movies.py            # GET /movies/{tmdb_id}, /movies/search, /movies/trending
│   │       ├── tv.py                # GET /tv/{tmdb_id}, /tv/{tmdb_id}/season/{n}
│   │       ├── lists.py             # POST /lists, GET /lists/{id}, POST /lists/{id}/items
│   │       ├── stats.py             # GET /stats/global, GET /stats/user
│   │       └── watch.py             # POST /watch/history, GET /watch/resume/{tmdb_id}
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py          # Registration, login, recovery logic
│   │   ├── movie_service.py         # Movie search, details, trending
│   │   ├── tv_service.py            # TV show details, seasons, episodes
│   │   ├── list_service.py          # List CRUD, item management
│   │   ├── stats_service.py         # Global/user stats aggregation
│   │   └── watch_service.py         # Watch history, position tracking
│   │
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── user_repo.py             # User CRUD operations
│   │   ├── recovery_repo.py         # Recovery code management
│   │   ├── history_repo.py          # Watch history queries
│   │   └── list_repo.py             # List and list item queries
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── db_models.py             # SQLAlchemy ORM models
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py                  # Request/response schemas for auth
│   │   ├── movie.py                 # Movie schemas
│   │   ├── tv.py                    # TV schemas
│   │   ├── list.py                  # List schemas
│   │   ├── stats.py                 # Stats schemas
│   │   └── common.py                # Shared schemas (pagination, errors)
│   │
│   ├── integrations/
│   │   ├── __init__.py
│   │   ├── tmdb_client.py           # TMDB API wrapper
│   │   └── vidsrc_client.py         # Vidsrc URL generation + fallback
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── security.py              # Password hashing, JWT handling
│   │   ├── codes.py                 # Recovery code generation/validation
│   │   └── caching.py               # Redis cache wrapper (optional)
│   │
│   └── core/
│       ├── __init__.py
│       ├── database.py              # SQLAlchemy engine, session factory
│       ├── exceptions.py            # Custom exception classes
│       └── middleware.py            # Rate limiting, CORS, error handling
│
├── migrations/                       # Alembic migration files
│   └── versions/
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                  # pytest fixtures
│   ├── test_auth.py
│   ├── test_movies.py
│   ├── test_lists.py
│   └── test_stats.py
│
├── .env.example                      # Example environment variables
├── .gitignore
├── alembic.ini                       # Alembic configuration
├── requirements.txt                  # Python dependencies
├── pyproject.toml                    # Project metadata, tool configs
└── README.md
```

### 3.2 Frontend Structure

```
streamflow-frontend/
├── public/
│   ├── index.html
│   └── assets/
│       └── logo.svg
│
├── src/
│   ├── main.jsx                     # React entry point
│   ├── App.jsx                      # Root component with routing
│   │
│   ├── components/
│   │   ├── Navbar.jsx               # Top navigation bar
│   │   ├── Carousel.jsx             # Reusable content carousel
│   │   ├── VideoPlayer.jsx          # Vidsrc iframe wrapper
│   │   ├── Footer.jsx               # Footer component
│   │   ├── MovieCard.jsx            # Movie/TV thumbnail card
│   │   └── ProtectedRoute.jsx      # Auth-required route wrapper
│   │
│   ├── pages/
│   │   ├── Home.jsx                 # Homepage with multiple carousels
│   │   ├── Login.jsx                # Login/register forms
│   │   ├── Recover.jsx              # Password recovery form
│   │   ├── Movie.jsx                # Movie detail page
│   │   ├── Show.jsx                 # TV show detail page (seasons/episodes)
│   │   ├── Watch.jsx                # Video player page
│   │   ├── Profile.jsx              # User profile & stats
│   │   ├── Lists.jsx                # User's custom lists
│   │   └── Search.jsx               # Search results page
│   │
│   ├── services/
│   │   ├── api.js                   # Axios instance with interceptors
│   │   ├── auth.js                  # Auth API calls (login, register, recover)
│   │   ├── movies.js                # Movie API calls
│   │   ├── tv.js                    # TV API calls
│   │   ├── lists.js                 # List API calls
│   │   └── stats.js                 # Stats API calls
│   │
│   ├── context/
│   │   └── AuthContext.jsx          # Global auth state (user, token)
│   │
│   ├── hooks/
│   │   ├── useAuth.js               # Custom hook for auth context
│   │   └── useFetch.js              # Custom hook for API calls
│   │
│   ├── styles/
│   │   └── index.css                # Tailwind imports + custom styles
│   │
│   └── utils/
│       └── constants.js             # API URLs, routes
│
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js
└── README.md
```

---

## 4. Data Model

### 4.1 Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
```

#### Recovery Codes Table
```sql
CREATE TABLE recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recovery_codes_user_id ON recovery_codes(user_id);
```

#### Watch History Table
```sql
CREATE TABLE watch_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('movie', 'tv', 'episode')),
    season_number INTEGER,              -- NULL for movies
    episode_number INTEGER,             -- NULL for movies
    last_position INTEGER DEFAULT 0,   -- Seconds
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tmdb_id, media_type, season_number, episode_number)
);

CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_watched_at ON watch_history(watched_at DESC);
```

#### Lists Table
```sql
CREATE TABLE lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lists_user_id ON lists(user_id);
```

#### List Items Table
```sql
CREATE TABLE list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('movie', 'tv')),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(list_id, tmdb_id, media_type)
);

CREATE INDEX idx_list_items_list_id ON list_items(list_id);
```

### 4.2 SQLAlchemy Models

Models will be defined in `app/models/db_models.py` using SQLAlchemy 2.0 declarative syntax with proper relationships:
- `User` model with relationship to `RecoveryCode`, `WatchHistory`, `List`
- `RecoveryCode` model with foreign key to `User`
- `WatchHistory` model with foreign key to `User`
- `List` model with foreign key to `User` and relationship to `ListItem`
- `ListItem` model with foreign key to `List`

---

## 5. API Design

### 5.1 Authentication Endpoints

**POST /api/auth/register**
- Request: `{ "username": str, "password": str }`
- Response: `{ "user_id": UUID, "recovery_codes": [str, ...] }`
- Creates user, generates 5 recovery codes, returns codes (only shown once)

**POST /api/auth/login**
- Request: `{ "username": str, "password": str }`
- Response: `{ "access_token": str, "token_type": "bearer", "user": {...} }`
- Returns JWT token valid for 24 hours

**POST /api/auth/recover**
- Request: `{ "username": str, "recovery_code": str, "new_password": str }`
- Response: `{ "message": "Password reset successful" }`
- Validates recovery code, updates password, invalidates used code

**GET /api/auth/me**
- Headers: `Authorization: Bearer <token>`
- Response: `{ "id": UUID, "username": str, "created_at": datetime }`
- Returns current user info

### 5.2 Movie Endpoints

**GET /api/movies/trending?page=1**
- Response: TMDB trending movies with pagination

**GET /api/movies/popular?page=1**
- Response: TMDB popular movies

**GET /api/movies/top-rated?page=1**
- Response: TMDB top-rated movies

**GET /api/movies/{tmdb_id}**
- Response: Full movie details (title, overview, year, rating, cast, trailer, etc.)

**GET /api/movies/search?query=...&genre=...&year=...&page=1**
- Response: Search results with filters

### 5.3 TV Endpoints

**GET /api/tv/trending?page=1**
- Response: TMDB trending TV shows

**GET /api/tv/popular?page=1**
- Response: TMDB popular TV shows

**GET /api/tv/{tmdb_id}**
- Response: TV show details including seasons list

**GET /api/tv/{tmdb_id}/season/{season_number}**
- Response: Episode list for specific season

### 5.4 Watch Endpoints

**POST /api/watch/history**
- Headers: `Authorization: Bearer <token>`
- Request: `{ "tmdb_id": int, "media_type": str, "season_number": int?, "episode_number": int?, "position": int }`
- Response: `{ "message": "Watch position saved" }`
- Records/updates watch history and position

**GET /api/watch/resume/{tmdb_id}?media_type=...&season=...&episode=...**
- Headers: `Authorization: Bearer <token>`
- Response: `{ "position": int, "watched_at": datetime }`
- Returns last watch position for resume

**GET /api/watch/history?limit=20&offset=0**
- Headers: `Authorization: Bearer <token>`
- Response: User's watch history (paginated)

### 5.5 List Endpoints

**POST /api/lists**
- Headers: `Authorization: Bearer <token>`
- Request: `{ "name": str }`
- Response: Created list object

**GET /api/lists**
- Headers: `Authorization: Bearer <token>`
- Response: User's all lists

**GET /api/lists/{list_id}**
- Headers: `Authorization: Bearer <token>`
- Response: List with items

**POST /api/lists/{list_id}/items**
- Headers: `Authorization: Bearer <token>`
- Request: `{ "tmdb_id": int, "media_type": str }`
- Response: `{ "message": "Item added" }`

**DELETE /api/lists/{list_id}/items/{item_id}**
- Headers: `Authorization: Bearer <token>`
- Response: `{ "message": "Item removed" }`

### 5.6 Stats Endpoints

**GET /api/stats/global**
- Response: `{ "most_watched_movie": {...}, "most_watched_show": {...}, "trending_this_week": [...] }`

**GET /api/stats/user**
- Headers: `Authorization: Bearer <token>`
- Response: `{ "total_minutes": int, "top_genres": [...], "most_rewatched": [...], "watch_timeline": [...] }`

### 5.7 Vidsrc Endpoints

**GET /api/vidsrc/player/{tmdb_id}?type=movie**
- Response: `{ "embed_url": str, "fallback_urls": [str, ...] }`

**GET /api/vidsrc/player/{tmdb_id}?type=tv&season=1&episode=1**
- Response: `{ "embed_url": str, "fallback_urls": [str, ...] }`

---

## 6. External API Integration

### 6.1 TMDB API Client

**Configuration:**
- API Key stored in environment variable `TMDB_API_KEY`
- Base URL: `https://api.themoviedb.org/3`
- Image base URL: `https://image.tmdb.org/t/p/`

**Key Endpoints Used:**
- `/trending/{media_type}/{time_window}` - Trending content
- `/movie/popular` - Popular movies
- `/movie/top_rated` - Top-rated movies
- `/movie/{movie_id}` - Movie details
- `/tv/popular` - Popular TV shows
- `/tv/{tv_id}` - TV show details
- `/tv/{tv_id}/season/{season_number}` - Season details
- `/search/multi` - Multi-search (movies + TV)
- `/genre/movie/list` - Movie genres
- `/genre/tv/list` - TV genres

**Caching Strategy:**
- Cache TMDB responses for 1 hour (using Redis or in-memory cache)
- Cache genre lists indefinitely (rarely change)
- Cache movie/TV details for 24 hours

### 6.2 Vidsrc API Client

**Configuration:**
- Primary domain: `https://vidsrc.me/embed/`
- Fallback domains: NEW domains only (to be configured)

**URL Structure:**
- Movie: `https://vidsrc.me/embed/movie/{tmdb_id}`
- TV Show: `https://vidsrc.me/embed/tv/{tmdb_id}/{season}/{episode}`

**Fallback Logic:**
1. Return primary embed URL
2. Include array of fallback URLs (NEW domains)
3. Frontend attempts primary first, then fallbacks on error

---

## 7. Security Implementation

### 7.1 Password Security

- **Hashing Algorithm:** bcrypt (work factor 12)
- **Library:** `passlib[bcrypt]`
- **Implementation:** 
  ```python
  from passlib.context import CryptContext
  pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
  ```

### 7.2 Recovery Codes

- **Generation:** 5 random alphanumeric codes (12 characters each)
- **Storage:** Hashed using bcrypt (same as passwords)
- **Validation:** Compare hash of input code with stored hashes
- **One-time use:** Mark `used=True` after successful recovery

### 7.3 JWT Tokens

- **Library:** `python-jose[cryptography]`
- **Algorithm:** HS256
- **Secret Key:** Stored in environment variable `JWT_SECRET_KEY`
- **Expiration:** 24 hours
- **Payload:** `{ "sub": user_id, "username": username, "exp": expiration }`
- **Refresh:** No refresh tokens (user re-authenticates after expiration)

### 7.4 Rate Limiting

- **Library:** `slowapi` (FastAPI rate limiting)
- **Login Endpoint:** 5 attempts per 15 minutes per IP
- **Register Endpoint:** 3 attempts per hour per IP
- **Recovery Endpoint:** 3 attempts per hour per IP
- **General API:** 100 requests per minute per IP

### 7.5 CORS Configuration

- **Allowed Origins:** Frontend URL (configurable via environment)
- **Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers:** Authorization, Content-Type
- **Credentials:** True (allow cookies/auth headers)

---

## 8. Frontend Implementation Details

### 8.1 Routing Structure

**Public Routes:**
- `/` - Homepage
- `/login` - Login/Register
- `/recover` - Password recovery
- `/movie/:tmdbId` - Movie details
- `/show/:tmdbId` - TV show details
- `/search` - Search results

**Protected Routes (Require Auth):**
- `/watch/:type/:tmdbId` - Video player
- `/profile` - User profile
- `/lists` - User's lists
- `/lists/:listId` - Specific list view

### 8.2 State Management

**AuthContext:**
- Stores: `user`, `token`, `isAuthenticated`
- Methods: `login()`, `logout()`, `register()`, `recover()`
- Persists token in localStorage
- Automatically adds token to API requests via Axios interceptor

### 8.3 Component Hierarchy

```
App
├── Navbar (always visible)
├── Routes
│   ├── Home
│   │   └── Carousel (x6) [Trending, Popular Movies, Popular TV, Top Rated, Continue Watching, Watchlist]
│   ├── Login/Register
│   ├── Recover
│   ├── Movie
│   │   └── VideoPlayer (embedded Vidsrc)
│   ├── Show
│   │   ├── Season List
│   │   └── Episode List
│   ├── Watch
│   │   └── VideoPlayer (embedded Vidsrc)
│   ├── Profile
│   │   ├── User Stats
│   │   └── Watch History
│   └── Lists
│       └── List Items (MovieCard components)
└── Footer
```

### 8.4 Responsive Design

**Breakpoints (Tailwind):**
- `sm`: 640px - Mobile landscape
- `md`: 768px - Tablet
- `lg`: 1024px - Desktop
- `xl`: 1280px - Large desktop

**Mobile-First Approach:**
- Default styles for mobile (<640px)
- Carousels scroll horizontally on mobile, grid on desktop
- Bottom navigation bar on mobile (Home, Search, Watchlist, Profile)
- Hamburger menu for additional options

---

## 9. Testing Strategy

### 9.1 Backend Tests

**Unit Tests (pytest):**
- `tests/test_auth.py` - Auth service logic (registration, login, recovery)
- `tests/test_security.py` - Password hashing, JWT generation/validation
- `tests/test_codes.py` - Recovery code generation/validation
- `tests/test_repositories.py` - Database CRUD operations

**Integration Tests:**
- `tests/test_api_auth.py` - Auth endpoints (register, login, recover)
- `tests/test_api_movies.py` - Movie endpoints with mocked TMDB responses
- `tests/test_api_lists.py` - List CRUD endpoints
- `tests/test_api_stats.py` - Stats endpoints

**Test Database:**
- Use SQLite in-memory database for tests
- Reset database between tests using fixtures

**Coverage Goal:** 80%+ code coverage

### 9.2 Frontend Tests

**Component Tests (Vitest + React Testing Library):**
- `Navbar.test.jsx` - Navigation rendering, auth state
- `Carousel.test.jsx` - Data rendering, scrolling
- `VideoPlayer.test.jsx` - Embed URL handling
- `MovieCard.test.jsx` - Thumbnail, title, click handling

**Integration Tests:**
- `Login.test.jsx` - Form submission, error handling
- `Home.test.jsx` - Multiple carousels, loading states

**E2E Tests (Optional):**
- Playwright or Cypress for critical user flows

### 9.3 Manual Testing Checklist

- [ ] User registration flow with recovery codes
- [ ] Login with valid/invalid credentials
- [ ] Password recovery using code
- [ ] Browse movies and TV shows
- [ ] Search with filters
- [ ] Watch video (Vidsrc embed loads)
- [ ] Create watchlist and add items
- [ ] View user profile and stats
- [ ] Mobile responsive layout

---

## 10. Verification Approach

### 10.1 Backend Verification

**Linting & Formatting:**
```bash
ruff check .
ruff format --check .
```

**Type Checking:**
```bash
mypy app/
```

**Tests:**
```bash
pytest tests/ -v --cov=app --cov-report=term-missing
```

**Run Server:**
```bash
uvicorn app.main:app --reload
```

**API Documentation:**
- Access Swagger UI at `http://localhost:8000/docs`
- Verify all endpoints documented correctly

### 10.2 Frontend Verification

**Linting:**
```bash
npm run lint
```

**Formatting:**
```bash
npm run format:check
```

**Tests:**
```bash
npm run test
```

**Build:**
```bash
npm run build
```

**Dev Server:**
```bash
npm run dev
```

### 10.3 Integration Verification

**Database Migrations:**
```bash
alembic upgrade head
alembic downgrade -1
alembic upgrade head
```

**Full Stack Test:**
1. Start backend server
2. Start frontend dev server
3. Register a new user
4. Login
5. Browse content
6. Add item to watchlist
7. Start watching (verify Vidsrc embed)
8. Check watch history persists
9. View user stats

---

## 11. Environment Configuration

### 11.1 Backend Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/streamflow
# or for SQLite: DATABASE_URL=sqlite:///./streamflow.db

# Security
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# External APIs
TMDB_API_KEY=your-tmdb-api-key
VIDSRC_PRIMARY_DOMAIN=https://vidsrc.me/embed/
VIDSRC_FALLBACK_DOMAINS=https://domain1.com,https://domain2.com

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# Rate Limiting
RATE_LIMIT_ENABLED=true
```

### 11.2 Frontend Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=StreamFlow
```

---

## 12. Deployment Considerations (Future)

**Backend:**
- Docker container with Gunicorn + Uvicorn workers
- PostgreSQL managed database (AWS RDS, DigitalOcean Managed DB)
- Redis for caching (ElastiCache, Redis Cloud)
- Environment secrets via AWS Secrets Manager or similar

**Frontend:**
- Build and deploy to Vercel, Netlify, or AWS S3 + CloudFront
- Environment variables configured in platform

**Database Migrations:**
- Run `alembic upgrade head` as part of deployment pipeline

**Monitoring:**
- Sentry for error tracking
- Logging with structlog
- Health check endpoint: `GET /health`

---

## 13. Open Questions & Decisions Needed

1. **TMDB API Key:** User needs to provide their own TMDB API key (free tier supports 1000 requests/day)
2. **Vidsrc Fallback Domains:** Need to identify specific NEW Vidsrc domains to use as fallbacks
3. **Redis:** Optional for caching - implement if performance issues arise, start without it
4. **TypeScript:** Should frontend use TypeScript? (Recommendation: Yes for better type safety)
5. **Testing Priority:** Which tests to implement first? (Recommendation: Auth flow, then movie browsing)
6. **Mobile Bottom Nav:** Should it be sticky or auto-hide on scroll? (Recommendation: Sticky for better UX)
7. **Watch Position Sync:** How frequently to save position? (Recommendation: Every 10 seconds + on pause/close)

---

## 14. Success Criteria

The implementation will be considered complete when:

1. ✅ Users can register with username/password and receive 5 recovery codes
2. ✅ Users can login and receive JWT token
3. ✅ Users can recover password using recovery code
4. ✅ Homepage displays trending, popular, top-rated movies and TV shows from TMDB
5. ✅ Users can search for movies/TV shows with filters
6. ✅ Movie detail pages show full information + trailer + cast
7. ✅ TV show pages show seasons and episodes
8. ✅ Clicking "Watch" embeds Vidsrc player and tracks watch position
9. ✅ Users can create custom watchlists and add/remove items
10. ✅ User profile shows statistics (watch time, top genres, history)
11. ✅ Global stats show most watched content
12. ✅ Frontend is fully responsive (mobile, tablet, desktop)
13. ✅ All backend endpoints have ≥80% test coverage
14. ✅ No linting or type checking errors
15. ✅ Application runs successfully locally (both backend and frontend)

---

## 15. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TMDB API rate limits exceeded | Medium | High | Implement caching, use Redis, respect rate limits |
| Vidsrc domains go down | Medium | High | Implement fallback domain logic, monitor uptime |
| JWT secret key leak | Low | Critical | Store in environment variables, never commit, rotate periodically |
| Database performance issues | Low | Medium | Add indexes, use connection pooling, optimize queries |
| Frontend bundle size too large | Medium | Low | Code splitting, lazy loading, tree shaking |
| CORS issues in production | Low | Medium | Configure CORS properly, test with production URLs |

---

## Next Steps

After approval of this specification:
1. Create detailed implementation plan with phased tasks
2. Setup project structure (backend and frontend)
3. Initialize databases and migrations
4. Begin Phase 1: Authentication system implementation
