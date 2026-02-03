# Spec and build

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:
- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification
<!-- chat-id: e445c7d5-4693-488f-9048-3e8234067ff5 -->

Assess the task's difficulty, as underestimating it leads to poor outcomes.
- easy: Straightforward implementation, trivial bug fix or feature
- medium: Moderate complexity, some edge cases or caveats to consider
- hard: Complex logic, many caveats, architectural considerations, or high-risk changes

Create a technical specification for the task that is appropriate for the complexity level:
- Review the existing codebase architecture and identify reusable components.
- Define the implementation approach based on established patterns in the project.
- Identify all source code files that will be created or modified.
- Define any necessary data model, API, or interface changes.
- Describe verification steps using the project's test and lint commands.

Save the output to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach
- Source code structure changes
- Data model / API / interface changes
- Verification approach

If the task is complex enough, create a detailed implementation plan based on `{@artifacts_path}/spec.md`:
- Break down the work into concrete tasks (incrementable, testable milestones)
- Each task should reference relevant contracts and include verification steps
- Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function).

Important: unit tests must be part of each implementation task, not separate tasks. Each task should implement the code and its tests together, if relevant.

Save to `{@artifacts_path}/plan.md`. If the feature is trivial and doesn't warrant this breakdown, keep the Implementation step below as is.

---

### [ ] Step: Project Setup & Core Infrastructure
<!-- chat-id: 2cbe3fbc-1cb8-4000-ba5e-42dd41a7781b -->

Initialize backend and frontend project structures with development environment.

**Backend:**
- Create `streamflow-backend/` directory with structure per spec.md
- Setup `requirements.txt` with FastAPI, SQLAlchemy, Alembic, passlib, python-jose, httpx, pytest
- Create `pyproject.toml` with ruff, mypy configurations
- Setup `.env.example` with required environment variables
- Create `app/config.py` for Pydantic Settings-based configuration
- Create `app/core/database.py` with SQLAlchemy engine and session factory
- Create `app/core/exceptions.py` with custom exception classes
- Initialize Alembic for database migrations
- Create `.gitignore` (include `__pycache__`, `.env`, `*.pyc`, `.pytest_cache`, `.mypy_cache`, `*.db`)

**Frontend:**
- Create `streamflow-frontend/` directory with Vite + React template
- Install dependencies: react-router-dom, axios, tailwindcss, headlessui
- Setup Tailwind CSS configuration
- Create `.env.example` with `VITE_API_BASE_URL`
- Setup ESLint and Prettier configurations
- Create basic folder structure (components, pages, services, context, hooks, styles, utils)
- Create `.gitignore` (include `node_modules`, `dist`, `.env`, `.env.local`)

**Verification:**
- Backend: `python -m pytest --version`, `ruff --version`, `mypy --version`
- Frontend: `npm run dev` (ensure Vite starts)
- Both: Verify `.gitignore` files are comprehensive

---

### [ ] Step: Database Models & Migrations

Create SQLAlchemy models and initial database schema.

**Implementation:**
- Create `app/models/db_models.py` with:
  - `User` model (id UUID, username, password_hash, created_at, updated_at)
  - `RecoveryCode` model (id UUID, user_id FK, code_hash, used, created_at)
  - `WatchHistory` model (id UUID, user_id FK, tmdb_id, media_type, season_number, episode_number, last_position, watched_at)
  - `List` model (id UUID, user_id FK, name, created_at, updated_at)
  - `ListItem` model (id UUID, list_id FK, tmdb_id, media_type, added_at)
- Define proper relationships (User.recovery_codes, User.watch_history, User.lists, List.items)
- Add indexes per spec.md (username, user_id foreign keys, watched_at)
- Create Alembic migration: `alembic revision --autogenerate -m "Initial schema"`
- Test migration: `alembic upgrade head`, `alembic downgrade -1`, `alembic upgrade head`

**Tests:**
- Create `tests/conftest.py` with SQLite in-memory database fixture
- Create `tests/test_models.py` to verify model creation and relationships

**Verification:**
- `pytest tests/test_models.py -v`
- `ruff check app/models/`
- `mypy app/models/`

---

### [ ] Step: Security Utilities & Authentication Service

Implement core security functions and authentication business logic.

**Implementation:**
- Create `app/utils/security.py`:
  - Password hashing with bcrypt (work factor 12)
  - JWT token generation and validation (HS256, 24h expiration)
  - Functions: `hash_password()`, `verify_password()`, `create_access_token()`, `decode_access_token()`
- Create `app/utils/codes.py`:
  - Recovery code generation (5 codes, 12 chars alphanumeric)
  - Code hashing and verification
  - Functions: `generate_recovery_codes()`, `hash_code()`, `verify_code()`
- Create `app/repositories/user_repo.py`:
  - CRUD operations: `create_user()`, `get_user_by_username()`, `get_user_by_id()`, `update_password()`
- Create `app/repositories/recovery_repo.py`:
  - Operations: `create_recovery_codes()`, `verify_and_invalidate_code()`
- Create `app/services/auth_service.py`:
  - `register_user()` - creates user, generates recovery codes, returns codes
  - `authenticate_user()` - validates credentials, returns user object
  - `recover_password()` - validates recovery code, updates password, invalidates code

**Tests:**
- `tests/test_security.py` - password hashing, JWT creation/validation
- `tests/test_codes.py` - recovery code generation, hashing, verification
- `tests/test_repositories.py` - user and recovery code CRUD operations
- `tests/test_auth_service.py` - registration, authentication, recovery flows

**Verification:**
- `pytest tests/ -v --cov=app/utils --cov=app/repositories --cov=app/services`
- `ruff check app/`
- `mypy app/`

---

### [ ] Step: Authentication API Endpoints

Create FastAPI routes for user authentication with rate limiting.

**Implementation:**
- Create `app/api/deps.py`:
  - `get_db()` dependency for database session
  - `get_current_user()` dependency for JWT token validation
- Create `app/core/middleware.py`:
  - Rate limiting middleware using `slowapi`
  - CORS middleware configuration
  - Global exception handler
- Create `app/schemas/auth.py`:
  - Pydantic schemas: `RegisterRequest`, `RegisterResponse`, `LoginRequest`, `LoginResponse`, `RecoverRequest`, `UserResponse`
- Create `app/api/routes/auth.py`:
  - `POST /auth/register` - rate limited (3/hour)
  - `POST /auth/login` - rate limited (5/15min)
  - `POST /auth/recover` - rate limited (3/hour)
  - `GET /auth/me` - requires authentication
- Create `app/main.py`:
  - FastAPI app initialization
  - Include auth router
  - Configure CORS and middleware
  - Health check endpoint: `GET /health`

**Tests:**
- `tests/test_api_auth.py`:
  - Test registration flow (valid, duplicate username, invalid data)
  - Test login flow (valid, invalid credentials)
  - Test recovery flow (valid code, invalid code, used code)
  - Test `/auth/me` endpoint (with/without token)
  - Test rate limiting

**Verification:**
- `pytest tests/test_api_auth.py -v`
- Start server: `uvicorn app.main:app --reload`
- Access Swagger docs: `http://localhost:8000/docs`
- Manual test: register user, login, verify token

---

### [ ] Step: TMDB API Integration

Create TMDB API client with caching support.

**Implementation:**
- Create `app/integrations/tmdb_client.py`:
  - `TMDBClient` class with async httpx client
  - Methods:
    - `get_trending(media_type, time_window, page)` - trending movies/TV
    - `get_popular_movies(page)` - popular movies
    - `get_top_rated_movies(page)` - top-rated movies
    - `get_popular_tv(page)` - popular TV shows
    - `get_movie_details(tmdb_id)` - movie details with cast, trailer
    - `get_tv_details(tmdb_id)` - TV show details with seasons
    - `get_season_details(tmdb_id, season_number)` - episode list
    - `search_multi(query, page, filters)` - search movies/TV
    - `get_genres(media_type)` - genre list
  - Error handling for API failures
  - Respect TMDB rate limits
  - Optional: In-memory caching with TTL (1 hour for most, 24h for details, indefinite for genres)
- Create `app/schemas/movie.py` and `app/schemas/tv.py`:
  - Pydantic schemas for TMDB responses (simplified for frontend)

**Tests:**
- `tests/test_tmdb_client.py`:
  - Mock httpx responses
  - Test each method with successful and failed responses
  - Test caching behavior

**Verification:**
- `pytest tests/test_tmdb_client.py -v`
- Create test script to fetch real data (requires TMDB API key in .env)
- Verify JSON response structure matches schemas

---

### [ ] Step: Movie & TV Show API Endpoints

Create endpoints for browsing and searching content via TMDB.

**Implementation:**
- Create `app/services/movie_service.py`:
  - Business logic layer wrapping TMDB client
  - Methods: `get_trending_movies()`, `get_popular_movies()`, `get_top_rated_movies()`, `get_movie_details()`, `search_movies()`
- Create `app/services/tv_service.py`:
  - Methods: `get_trending_tv()`, `get_popular_tv()`, `get_tv_details()`, `get_season_details()`, `search_tv()`
- Create `app/api/routes/movies.py`:
  - `GET /movies/trending?page=1`
  - `GET /movies/popular?page=1`
  - `GET /movies/top-rated?page=1`
  - `GET /movies/{tmdb_id}`
  - `GET /movies/search?query=...&genre=...&year=...&page=1`
- Create `app/api/routes/tv.py`:
  - `GET /tv/trending?page=1`
  - `GET /tv/popular?page=1`
  - `GET /tv/{tmdb_id}`
  - `GET /tv/{tmdb_id}/season/{season_number}`
- Update `app/main.py` to include movie and TV routers

**Tests:**
- `tests/test_api_movies.py`:
  - Test each endpoint with mocked TMDB responses
  - Test pagination
  - Test search filters
- `tests/test_api_tv.py`:
  - Test TV endpoints
  - Test season details

**Verification:**
- `pytest tests/test_api_movies.py tests/test_api_tv.py -v`
- Start server and test via Swagger docs
- Verify responses match expected schema

---

### [ ] Step: Vidsrc Integration & Watch Endpoints

Implement video player URL generation and watch history tracking.

**Implementation:**
- Create `app/integrations/vidsrc_client.py`:
  - `VidsrcClient` class
  - Methods:
    - `get_movie_embed_url(tmdb_id)` - returns primary + fallback URLs
    - `get_tv_embed_url(tmdb_id, season, episode)` - returns primary + fallback URLs
  - Configure primary domain and fallback domains from environment
- Create `app/repositories/history_repo.py`:
  - `save_watch_position(user_id, tmdb_id, media_type, season, episode, position)`
  - `get_watch_position(user_id, tmdb_id, media_type, season, episode)`
  - `get_user_watch_history(user_id, limit, offset)`
- Create `app/services/watch_service.py`:
  - `record_watch_position()` - upserts watch history
  - `get_resume_position()` - retrieves last position
  - `get_watch_history()` - retrieves user's history with pagination
- Create `app/schemas/watch.py`:
  - Pydantic schemas for watch history requests/responses
- Create `app/api/routes/watch.py`:
  - `POST /watch/history` (auth required)
  - `GET /watch/resume/{tmdb_id}?media_type=...&season=...&episode=...` (auth required)
  - `GET /watch/history?limit=20&offset=0` (auth required)
- Create `app/api/routes/vidsrc.py`:
  - `GET /vidsrc/player/{tmdb_id}?type=movie`
  - `GET /vidsrc/player/{tmdb_id}?type=tv&season=1&episode=1`
- Update `app/main.py` to include watch and vidsrc routers

**Tests:**
- `tests/test_vidsrc_client.py` - URL generation
- `tests/test_history_repo.py` - watch history CRUD
- `tests/test_api_watch.py` - watch endpoints with authentication

**Verification:**
- `pytest tests/test_api_watch.py -v`
- Test via Swagger: save position, retrieve position, get history
- Verify Vidsrc URLs are correctly formatted

---

### [ ] Step: Watchlists & User Lists System

Implement custom list creation and management.

**Implementation:**
- Create `app/repositories/list_repo.py`:
  - `create_list(user_id, name)`
  - `get_user_lists(user_id)`
  - `get_list_by_id(list_id, user_id)` - verify ownership
  - `delete_list(list_id, user_id)`
  - `add_item_to_list(list_id, tmdb_id, media_type)`
  - `remove_item_from_list(list_id, item_id)`
  - `get_list_items(list_id)`
- Create `app/services/list_service.py`:
  - Business logic for list operations
  - Ownership verification
- Create `app/schemas/list.py`:
  - Pydantic schemas: `CreateListRequest`, `ListResponse`, `AddItemRequest`, `ListItemResponse`
- Create `app/api/routes/lists.py`:
  - `POST /lists` (auth required)
  - `GET /lists` (auth required)
  - `GET /lists/{list_id}` (auth required)
  - `DELETE /lists/{list_id}` (auth required)
  - `POST /lists/{list_id}/items` (auth required)
  - `DELETE /lists/{list_id}/items/{item_id}` (auth required)
- Update `app/main.py` to include lists router

**Tests:**
- `tests/test_list_repo.py` - CRUD operations
- `tests/test_api_lists.py`:
  - Test list creation
  - Test adding/removing items
  - Test ownership verification
  - Test with/without authentication

**Verification:**
- `pytest tests/test_api_lists.py -v`
- Manual test: create list, add items, retrieve list, delete item

---

### [ ] Step: Statistics & Analytics Endpoints

Implement global and per-user statistics aggregation.

**Implementation:**
- Create `app/repositories/stats_repo.py`:
  - `get_most_watched_movie()` - aggregate watch_history by tmdb_id
  - `get_most_watched_tv_show()`
  - `get_trending_this_week()` - filter by watched_at in last 7 days
  - `get_user_total_watch_time(user_id)` - sum of watch positions
  - `get_user_top_genres(user_id)` - requires joining with TMDB data (fetch genre for each watched item)
  - `get_user_most_rewatched(user_id)` - count watch_history entries per tmdb_id
  - `get_user_watch_timeline(user_id, limit)` - recent watch history with timestamps
- Create `app/services/stats_service.py`:
  - Business logic for stats aggregation
  - Enrich data with TMDB metadata (titles, posters)
- Create `app/schemas/stats.py`:
  - Pydantic schemas for stats responses
- Create `app/api/routes/stats.py`:
  - `GET /stats/global` (public)
  - `GET /stats/user` (auth required)
- Update `app/main.py` to include stats router

**Tests:**
- `tests/test_stats_repo.py` - stats aggregation queries
- `tests/test_api_stats.py`:
  - Test global stats
  - Test user stats (with/without watch history)

**Verification:**
- `pytest tests/test_api_stats.py -v`
- Seed database with watch history data
- Verify stats calculations are accurate

---

### [ ] Step: Frontend - Project Setup & Auth System

Initialize React frontend with authentication flow.

**Implementation:**
- Create `src/main.jsx` - React entry point with StrictMode
- Create `src/App.jsx` - root component with React Router
- Create `src/styles/index.css` - Tailwind imports + custom global styles
- Create `src/utils/constants.js` - API base URL, routes
- Create `src/services/api.js`:
  - Axios instance with base URL
  - Request interceptor to add JWT token from localStorage
  - Response interceptor for error handling (401 redirects to login)
- Create `src/context/AuthContext.jsx`:
  - State: `user`, `token`, `isAuthenticated`, `recoveryCodes`
  - Methods: `login()`, `logout()`, `register()`, `recover()`, `checkAuth()`
  - Persist token in localStorage
- Create `src/hooks/useAuth.js` - custom hook to access AuthContext
- Create `src/services/auth.js`:
  - `registerUser(username, password)` - POST /auth/register
  - `loginUser(username, password)` - POST /auth/login
  - `recoverPassword(username, code, newPassword)` - POST /auth/recover
  - `getCurrentUser()` - GET /auth/me
- Create `src/pages/Login.jsx`:
  - Tabbed UI: Login tab and Register tab
  - Login form: username, password
  - Register form: username, password, confirm password
  - Display recovery codes after registration (modal/alert)
  - Error handling and validation
- Create `src/pages/Recover.jsx`:
  - Form: username, recovery code, new password, confirm password
  - Success message redirects to login
- Create `src/components/ProtectedRoute.jsx`:
  - Wrapper component that redirects to /login if not authenticated
- Update `src/App.jsx` with routing:
  - Public: `/`, `/login`, `/recover`
  - Protected routes setup (to be added in next step)

**Verification:**
- `npm run dev` - frontend starts
- Test registration flow: create user, see recovery codes
- Test login flow: login, verify token in localStorage
- Test logout: clear token, redirect to login
- Test recovery flow: use recovery code to reset password

---

### [ ] Step: Frontend - Homepage & Content Browsing

Create Netflix-style homepage with carousels and content pages.

**Implementation:**
- Create `src/services/movies.js`:
  - `getTrendingMovies(page)`, `getPopularMovies(page)`, `getTopRatedMovies(page)`, `getMovieDetails(tmdbId)`, `searchMovies(query, filters, page)`
- Create `src/services/tv.js`:
  - `getTrendingTV(page)`, `getPopularTV(page)`, `getTVDetails(tmdbId)`, `getSeasonDetails(tmdbId, season)`
- Create `src/components/MovieCard.jsx`:
  - Props: `item` (movie/TV object), `onClick`
  - Display: poster image, title, rating
  - Responsive: touch-friendly on mobile
- Create `src/components/Carousel.jsx`:
  - Props: `title` (section title), `items` (array), `onItemClick`
  - Horizontal scroll on mobile, grid on desktop
  - Tailwind: `overflow-x-auto`, `flex`, `snap-x`
- Create `src/components/Navbar.jsx`:
  - Logo, navigation links (Home, Search, Profile)
  - Logout button if authenticated
  - Responsive: hamburger menu on mobile
- Create `src/components/Footer.jsx`:
  - Copyright, links
- Create `src/pages/Home.jsx`:
  - Fetch data: trending movies, popular movies, top-rated movies, trending TV, popular TV
  - If authenticated: fetch continue watching (recent watch history), user's first watchlist
  - Render 6+ carousels using `Carousel` component
  - Loading states and error handling
- Create `src/pages/Search.jsx`:
  - Search bar with filters: genre dropdown, year input, rating slider
  - Display results in grid layout
  - Pagination
- Create `src/pages/Movie.jsx`:
  - Fetch movie details by tmdbId from route params
  - Display: poster, title, overview, year, rating, cast, trailer (YouTube embed)
  - "Watch" button - navigates to `/watch/movie/:tmdbId`
  - "Add to List" button (dropdown to select list)
- Create `src/pages/Show.jsx`:
  - Fetch TV show details
  - Display: poster, title, overview, seasons list
  - Expandable season accordion showing episode list
  - Each episode: thumbnail, title, episode number, "Watch" button
  - "Add to List" button for the entire show

**Verification:**
- `npm run dev`
- Navigate to homepage: verify carousels load with TMDB data
- Click on movie card: navigate to movie detail page
- Click "Watch": navigate to player page (to be implemented)
- Test search: enter query, apply filters, verify results
- Test responsive design: resize browser, check mobile layout

---

### [ ] Step: Frontend - Video Player & Watch History

Integrate Vidsrc player with watch position tracking.

**Implementation:**
- Create `src/services/watch.js`:
  - `saveWatchPosition(tmdbId, mediaType, season, episode, position)` - POST /watch/history
  - `getResumePosition(tmdbId, mediaType, season, episode)` - GET /watch/resume
  - `getWatchHistory(limit, offset)` - GET /watch/history
- Create `src/services/vidsrc.js`:
  - `getPlayerUrl(tmdbId, type, season, episode)` - GET /vidsrc/player
- Create `src/components/VideoPlayer.jsx`:
  - Props: `tmdbId`, `type` (movie/tv), `season`, `episode`
  - Fetch Vidsrc embed URL and fallback URLs
  - Render iframe with primary URL
  - Fallback logic: if iframe fails to load (onerror), try next fallback URL
  - Track current playback position every 10 seconds (use setInterval)
  - Save position on: interval, pause event, beforeunload (browser close)
  - On mount: fetch resume position and seek iframe to saved position (if possible via postMessage)
  - Fullscreen button
- Create `src/pages/Watch.jsx`:
  - Route params: `type`, `tmdbId`, `season?`, `episode?`
  - Render `VideoPlayer` component
  - Display content title above player
  - Back button to return to content page
- Update `src/pages/Movie.jsx` and `src/pages/Show.jsx`:
  - "Watch" button links to `/watch/movie/:tmdbId` or `/watch/tv/:tmdbId?season=X&episode=Y`
- Create `src/pages/Profile.jsx`:
  - Fetch user info, watch history, stats
  - Display: username, member since, total watch time, top genres
  - Recent watch history list (clickable to resume watching)

**Verification:**
- Click "Watch" on a movie: verify Vidsrc player loads in iframe
- Play video for 30 seconds, close tab, reopen: verify position resumes
- Check browser Network tab: verify watch position saves every 10 seconds
- Test fallback: manually break primary Vidsrc URL, verify fallback URL loads
- View profile: verify watch history displays

---

### [ ] Step: Frontend - Watchlists & User Lists UI

Implement list management interface.

**Implementation:**
- Create `src/services/lists.js`:
  - `createList(name)` - POST /lists
  - `getUserLists()` - GET /lists
  - `getListDetails(listId)` - GET /lists/{id}
  - `deleteList(listId)` - DELETE /lists/{id}
  - `addItemToList(listId, tmdbId, mediaType)` - POST /lists/{id}/items
  - `removeItemFromList(listId, itemId)` - DELETE /lists/{id}/items/{id}
- Create `src/pages/Lists.jsx`:
  - Display all user lists as cards
  - "Create New List" button opens modal with name input
  - Click list card: navigate to `/lists/:listId`
- Create `src/pages/ListDetail.jsx`:
  - Route param: `listId`
  - Fetch list details with items
  - Display items in grid (using `MovieCard` component)
  - Click item: navigate to movie/TV detail page
  - "Remove from List" button on each card
  - Back button to lists overview
- Update `src/pages/Movie.jsx` and `src/pages/Show.jsx`:
  - "Add to List" button opens dropdown
  - Fetch user lists
  - Select list to add current item
  - Show success message
- Create `src/components/AddToListModal.jsx` (optional):
  - Reusable modal for adding items to lists
  - List selection + "Create New List" option

**Verification:**
- Create a new list
- Add movies/TV shows to list from detail pages
- Navigate to lists page: verify items display
- Remove item from list
- Delete list

---

### [ ] Step: Mobile Responsive Design & Polish

Finalize mobile-first responsive design and UI polish.

**Implementation:**
- Create `src/components/MobileNav.jsx`:
  - Bottom navigation bar (sticky) with icons: Home, Search, Lists, Profile
  - Show only on mobile (`md:hidden` in Tailwind)
  - Active tab highlighting
- Update `src/components/Navbar.jsx`:
  - Hide on mobile (`hidden md:flex`)
  - Full navigation on desktop
- Responsive adjustments:
  - `Carousel.jsx`: horizontal scroll on mobile, 3-4 column grid on desktop
  - `Home.jsx`: stack carousels vertically with proper spacing
  - `Movie.jsx` / `Show.jsx`: single column on mobile, two-column layout on desktop (poster + details)
  - `VideoPlayer.jsx`: full width on mobile, 16:9 aspect ratio maintained
  - `Search.jsx`: filters collapse into expandable menu on mobile
- Dark theme styling:
  - Use Tailwind dark mode classes (`dark:bg-gray-900`, `dark:text-white`)
  - Default to dark theme for Netflix-style aesthetic
- Loading states:
  - Create `src/components/Spinner.jsx` - reusable loading spinner
  - Use in all pages during data fetching
- Error handling:
  - Create `src/components/ErrorMessage.jsx` - reusable error display
  - Show user-friendly error messages
- Touch optimizations:
  - Increase touch target sizes (min 44x44px)
  - Add touch feedback (active states)
- Performance:
  - Lazy load images in carousels (use `loading="lazy"`)
  - Code splitting: lazy load routes with `React.lazy()` and `Suspense`

**Verification:**
- Test on mobile device or browser dev tools (iPhone, Android sizes)
- Verify bottom nav appears on mobile
- Test all interactions on touch screen
- Verify dark theme applied consistently
- Check performance: Lighthouse score >80 for mobile
- Test keyboard navigation and accessibility

---

### [ ] Step: Testing & Quality Assurance

Implement comprehensive testing and final verification.

**Backend:**
- Run full test suite: `pytest tests/ -v --cov=app --cov-report=html`
- Verify coverage ≥80%
- Fix any failing tests
- Run linting: `ruff check app/ tests/`
- Run formatting: `ruff format --check app/ tests/`
- Run type checking: `mypy app/`
- Fix all errors and warnings

**Frontend:**
- Create component tests:
  - `src/components/__tests__/Navbar.test.jsx`
  - `src/components/__tests__/Carousel.test.jsx`
  - `src/components/__tests__/VideoPlayer.test.jsx`
  - `src/components/__tests__/MovieCard.test.jsx`
- Run tests: `npm run test`
- Run linting: `npm run lint`
- Run build: `npm run build` (verify no errors)

**Integration Testing:**
- Manual test full user journey:
  1. Register new user → save recovery codes
  2. Login → verify token
  3. Browse homepage → carousels load
  4. Search for content → results display
  5. View movie details → data accurate
  6. Watch movie → Vidsrc loads, position saves
  7. Create watchlist → add items
  8. View profile → stats accurate
  9. Recover password → use recovery code
  10. Mobile: test bottom nav, touch interactions

**Documentation:**
- Update `streamflow-backend/README.md`:
  - Setup instructions
  - Environment variables
  - Running locally
  - Running tests
- Update `streamflow-frontend/README.md`:
  - Setup instructions
  - Environment variables
  - Available scripts
  - Building for production

**Final Verification Checklist:**
- [ ] All 15 success criteria from spec.md met
- [ ] No linting errors (backend and frontend)
- [ ] No type checking errors (backend)
- [ ] Test coverage ≥80% (backend)
- [ ] All tests passing
- [ ] Application runs locally (both services)
- [ ] Mobile responsive design verified
- [ ] Recovery codes system working
- [ ] Vidsrc player working with fallbacks
- [ ] Watch position tracking working
- [ ] Statistics accurate
- [ ] TMDB API integration working

---

### [ ] Step: Final Report

Write implementation report to `{@artifacts_path}/report.md` describing:
- What was implemented (summary of all features)
- How the solution was tested (testing approach and coverage)
- Biggest issues or challenges encountered
- Known limitations or future improvements
- Deployment recommendations
