# StreamFlow Combined Deployment Guide

This guide covers deploying StreamFlow as a **single container** where FastAPI serves both the API and the React frontend.

## Overview

- **Single Docker container** runs both backend and frontend
- **No CORS issues** - same domain
- **Simpler deployment** - one service instead of two
- **Cost effective** - one container instead of two

---

## Part 1: Prerequisites

### Required
1. **Northflank Account** - Sign up at https://northflank.com
2. **GitHub Repository** - Code pushed to GitHub
3. **TMDB API Key** - Get from https://www.themoviedb.org/settings/api

### Generate Secret Key
```bash
openssl rand -hex 32
```

---

## Part 2: Deploy PostgreSQL Database

### Step 1: Create Database Addon

1. Go to your Northflank project
2. Click **"Create Service"** → **"Addon"**
3. Select **"PostgreSQL"**
4. Configuration:
   - **Name**: `streamflow-db`
   - **Version**: PostgreSQL 14+
   - **Plan**: Free tier or your preferred plan
5. Click **"Create Addon"**
6. Wait for provisioning (~2-3 minutes)
7. **Copy the DATABASE_URL** connection string

---

## Part 3: Deploy Combined Application

### Step 1: Create Combined Service

1. Click **"Create Service"** → **"Combined Service"**
2. Connect to your GitHub repository
3. Configuration:
   - **Name**: `streamflow-app`
   - **Repository**: Your StreamFlow repo
   - **Branch**: `new-task-ac30` (or main)
   - **Build Type**: Dockerfile
   - **Dockerfile Path**: `Dockerfile` (root level)
   - **Build Context**: `.` (root)

### Step 2: Configure Service Settings

1. **Port**: `8000`
2. **Protocol**: HTTP
3. **Health Check Path**: `/health`
4. **Health Check Interval**: 30s

### Step 3: Add Environment Variables

Navigate to **Environment** tab and add:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | Generated secret (32+ chars) | From `openssl rand -hex 32` |
| `TMDB_API_KEY` | Your TMDB API key | `abc123...` |
| `VIDSRC_PRIMARY_DOMAIN` | Video source domain | `vidsrc.to` |
| `CORS_ORIGINS` | Same as app URL | `https://streamflow-app-xxx.northflank.app` |

**Important:** After deployment, update `CORS_ORIGINS` with your actual Northflank URL.

### Step 4: Add Persistent Storage

1. Go to **Volumes** tab
2. Click **"Add Volume"**
3. Configuration:
   - **Mount Path**: `/app/uploads`
   - **Size**: 1GB (or as needed)
4. Click **"Save"**

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build (~8-12 minutes for first build)
   - Frontend build: ~3-5 min
   - Backend build: ~3-5 min
   - Image push: ~2 min
3. Check build logs for any errors
4. Once deployed, **copy the application URL**

---

## Part 4: Update CORS Configuration

### Step 1: Get Your App URL

After deployment completes, your app will be available at:
```
https://streamflow-app-[random-id].northflank.app
```

### Step 2: Update CORS_ORIGINS

1. Go to your service → **Environment** tab
2. Update `CORS_ORIGINS` variable to your actual URL:
   ```
   https://streamflow-app-abc123.northflank.app
   ```
3. Click **"Save"**
4. **Redeploy** the service to apply changes

---

## Part 5: Verify Deployment

### Test Backend API

Visit: `https://your-app-url.northflank.app/docs`

You should see:
- ✅ FastAPI Swagger documentation
- ✅ All API endpoints listed
- ✅ Able to test `/health` endpoint

### Test Frontend

Visit: `https://your-app-url.northflank.app/`

You should see:
- ✅ StreamFlow homepage with logo
- ✅ Browse content button
- ✅ Trending movies carousel

### Test Complete Flow

1. **Register** a new account
2. **Browse** movies/TV shows
3. **Create** a watchlist
4. **Add** items to watchlist
5. **Watch** a movie/show

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│   Northflank Container (Port 8000)      │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │     FastAPI Backend              │   │
│  │  - API Routes (/api/v1/*)       │   │
│  │  - Database Connection          │   │
│  │  - Business Logic               │   │
│  │  - Static File Serving          │   │
│  └──────────────────────────────────┘   │
│              ↓                           │
│  ┌──────────────────────────────────┐   │
│  │   Built React Frontend (dist/)   │   │
│  │  - index.html                    │   │
│  │  - assets/ (JS, CSS, images)    │   │
│  └──────────────────────────────────┘   │
│                                          │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────┐
│  PostgreSQL Addon   │
│  (Database)         │
└─────────────────────┘
```

### Request Flow

**Frontend Request (e.g., `/` or `/movie/123`):**
```
Browser → Northflank → FastAPI → Serve index.html → Browser
```

**API Request (e.g., `/api/v1/movies/trending`):**
```
Browser → Northflank → FastAPI → Business Logic → Database → Response
```

**Static Asset (e.g., `/assets/logo.png`):**
```
Browser → Northflank → FastAPI → Serve from /app/frontend-dist/assets/
```

---

## Troubleshooting

### Build Fails

**Frontend build errors:**
```bash
# Check logs for npm errors
# Common issues:
- Missing dependencies in package.json
- Syntax errors in React components
- Environment variable issues
```

**Backend build errors:**
```bash
# Check logs for pip/Python errors
# Common issues:
- Missing dependencies in requirements.txt
- Python version mismatch
- PostgreSQL client installation fails
```

**Solution:**
1. Check build logs in Northflank
2. Test build locally: `docker build -f Dockerfile .`
3. Fix errors and push to GitHub

### Application Won't Start

**Check logs for:**
```bash
# Database connection issues
- Invalid DATABASE_URL
- Database not accessible
- Wrong credentials

# Missing environment variables
- SECRET_KEY not set
- TMDB_API_KEY not set
```

**Solution:**
1. Verify all environment variables are set
2. Test database connection from logs
3. Check health check endpoint: `/health`

### Frontend Not Loading

**Symptoms:**
- Blank white page
- 404 errors for assets
- API calls work but no UI

**Check:**
```bash
# In container logs, verify:
- "frontend-dist" directory exists
- index.html is present
- Assets are mounted correctly
```

**Solution:**
1. Rebuild with clean cache
2. Check Dockerfile frontend build stage
3. Verify `VITE_API_BASE_URL=""` is set (empty for relative paths)

### CORS Errors

**Symptoms:**
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' 
has been blocked by CORS policy
```

**Solution:**
1. This **shouldn't happen** with combined deployment (same origin)
2. If it does, check `CORS_ORIGINS` matches your app URL exactly
3. Ensure no trailing slashes
4. Redeploy after changing

### Database Connection Issues

**Error:** `could not connect to server`

**Solution:**
1. Check DATABASE_URL format is correct
2. Ensure database addon is running
3. Verify network connectivity between services
4. Check database addon logs

### Upload Issues

**Symptom:** File uploads fail or disappear

**Check:**
1. Volume is mounted at `/app/uploads`
2. Volume has sufficient space
3. Check container logs for write permission errors

**Solution:**
```bash
# In Northflank:
1. Go to service → Volumes
2. Verify mount path: /app/uploads
3. Check volume size
4. Restart service if needed
```

---

## Local Testing

### Test Combined Build Locally

```bash
# Build the image
docker build -f Dockerfile -t streamflow:local .

# Run with environment variables
docker run -p 8000:8000 \
  -e DATABASE_URL="sqlite:///./test.db" \
  -e SECRET_KEY="test-secret-key-min-32-chars-long" \
  -e TMDB_API_KEY="your-key" \
  -e VIDSRC_PRIMARY_DOMAIN="vidsrc.to" \
  -e CORS_ORIGINS="http://localhost:8000" \
  streamflow:local
```

**Visit:**
- Frontend: http://localhost:8000/
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

---

## Updating the Application

### Deploy Updates

1. **Push changes** to GitHub
2. Northflank **auto-deploys** (if enabled)
3. Or manually click **"Deploy"** in Northflank

### Zero-Downtime Deployments

Northflank automatically:
1. Builds new container
2. Starts new instance
3. Health checks pass
4. Routes traffic to new instance
5. Stops old instance

---

## Advantages of Combined Deployment

### ✅ Pros
- **Simpler architecture** - One service instead of two
- **No CORS issues** - Same origin
- **Lower cost** - One container
- **Easier management** - Single deployment
- **Faster local dev** - One Docker command

### ⚠️ Cons
- **Larger image** - ~500MB vs ~50MB frontend only
- **Slower deployments** - Must rebuild both
- **Less flexibility** - Can't scale independently
- **Backend restarts affect frontend** - Brief downtime

---

## Cost Estimation

### Free Tier (Northflank)
- **Application**: 1 container (sleeps after 30min inactivity)
- **Database**: 256MB PostgreSQL (expires after 90 days without card)
- **Storage**: 1GB persistent volume
- **Total**: $0/month (with limitations)

### Paid Tier (Always-On)
- **Application**: ~$10/month (512MB RAM, 0.25 CPU)
- **Database**: ~$7/month (PostgreSQL addon)
- **Storage**: Included (1GB)
- **Total**: ~$17/month

### Comparison: Separate vs Combined
- **Separate**: Frontend ($5) + Backend ($10) + DB ($7) = $22/month
- **Combined**: Application ($10) + DB ($7) = $17/month
- **Savings**: $5/month

---

## Scaling

### Vertical Scaling (Increase Resources)
1. Go to service → **Plan**
2. Upgrade to higher tier:
   - More CPU
   - More RAM
   - Faster performance

### Horizontal Scaling (Multiple Instances)
1. Go to service → **Scaling**
2. Increase **Replicas**
3. Northflank handles load balancing
4. **Note:** Requires shared storage for uploads

---

## Migration to Separate Deployments

If you later want to separate:

1. Use `streamflow-backend/Dockerfile` for backend
2. Use `streamflow-frontend/Dockerfile` for frontend
3. Follow `DEPLOYMENT.md` guide
4. Update CORS and API URLs

---

## Security Checklist

- ✅ `SECRET_KEY` is random and 32+ characters
- ✅ `DATABASE_URL` stored as secret
- ✅ `TMDB_API_KEY` not exposed to frontend
- ✅ HTTPS enabled (automatic on Northflank)
- ✅ CORS configured correctly
- ✅ File upload size limits in place
- ✅ Rate limiting enabled for auth endpoints

---

## Monitoring

### View Logs
1. Go to service in Northflank
2. Click **"Logs"** tab
3. Real-time application logs
4. Filter by error/warning

### View Metrics
1. Click **"Metrics"** tab
2. CPU usage
3. Memory usage
4. Network traffic
5. Request count

### Set Up Alerts
1. Go to **"Notifications"**
2. Configure alerts for:
   - High CPU/memory
   - Service crashes
   - Health check failures

---

## Support & Resources

- **Northflank Docs**: https://northflank.com/docs
- **Northflank Discord**: https://discord.gg/northflank
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Vite Docs**: https://vitejs.dev/
- **Project Issues**: https://github.com/DohmBoy64Bit/StreamFlow/issues

---

## Quick Commands Reference

```bash
# Generate secret key
openssl rand -hex 32

# Test combined build locally
docker build -f Dockerfile -t streamflow:test .

# Run locally with SQLite
docker run -p 8000:8000 \
  -e DATABASE_URL="sqlite:///./test.db" \
  -e SECRET_KEY="$(openssl rand -hex 32)" \
  -e TMDB_API_KEY="your-key" \
  streamflow:test

# View container logs
docker logs -f <container-id>

# Access container shell
docker exec -it <container-id> sh

# Check frontend files in container
docker exec <container-id> ls -la /app/frontend-dist
```
