# StreamFlow Deployment Guide - Northflank

## Prerequisites

1. **Northflank Account** - Sign up at https://northflank.com
2. **GitHub Repository** - Your code should be pushed to GitHub
3. **TMDB API Key** - Get one from https://www.themoviedb.org/settings/api
4. **Vidsrc Domain** - Default: `vidsrc.to`

---

## Part 1: Deploy PostgreSQL Database

### Step 1: Create Database Addon

1. Go to your Northflank project
2. Click **"Create Service"** → **"Addon"**
3. Select **"PostgreSQL"**
4. Configuration:
   - **Name**: `streamflow-db`
   - **Version**: PostgreSQL 14 or higher
   - **Plan**: Free tier (or your preferred plan)
5. Click **"Create Addon"**
6. Wait for database to provision (~2-3 minutes)
7. **Copy the connection string** from the addon details

---

## Part 2: Deploy Backend

### Step 1: Create Backend Service

1. Click **"Create Service"** → **"Combined Service"**
2. Select your GitHub repository
3. Configuration:
   - **Name**: `streamflow-backend`
   - **Repository**: Select your repo
   - **Branch**: `new-task-ac30` (or your main branch)
   - **Build Type**: Dockerfile
   - **Dockerfile Path**: `streamflow-backend/Dockerfile`
   - **Build Context**: `streamflow-backend`

### Step 2: Configure Build Settings

1. **Port**: `8000`
2. **Protocol**: HTTP
3. **Health Check Path**: `/health`

### Step 3: Add Environment Variables

Go to **Environment** tab and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `[Your PostgreSQL URL from Step 1]` | From database addon |
| `SECRET_KEY` | `[Generate random 32+ char string]` | Use: `openssl rand -hex 32` |
| `TMDB_API_KEY` | `[Your TMDB API key]` | From themoviedb.org |
| `VIDSRC_PRIMARY_DOMAIN` | `vidsrc.to` | Video source domain |
| `CORS_ORIGINS` | `https://streamflow-frontend-[xxx].northflank.app` | Update after frontend deploy |

**Generate SECRET_KEY:**
```bash
openssl rand -hex 32
```

### Step 4: Add Persistent Storage (for uploads)

1. Go to **Volumes** tab
2. Click **"Add Volume"**
3. Configuration:
   - **Mount Path**: `/app/uploads`
   - **Size**: 1GB (or as needed)
4. Click **"Save"**

### Step 5: Deploy Backend

1. Click **"Deploy"**
2. Wait for build to complete (~5-10 minutes)
3. Check logs for any errors
4. **Copy the backend URL** (e.g., `https://streamflow-backend-[xxx].northflank.app`)

---

## Part 3: Deploy Frontend

### Step 1: Create Frontend Service

1. Click **"Create Service"** → **"Combined Service"**
2. Select your GitHub repository
3. Configuration:
   - **Name**: `streamflow-frontend`
   - **Repository**: Select your repo
   - **Branch**: `new-task-ac30` (or your main branch)
   - **Build Type**: Dockerfile
   - **Dockerfile Path**: `streamflow-frontend/Dockerfile`
   - **Build Context**: `streamflow-frontend`

### Step 2: Configure Build Settings

1. **Port**: `80`
2. **Protocol**: HTTP
3. **Health Check Path**: `/`

### Step 3: Add Build Arguments

Go to **Build Arguments** and add:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `[Your backend URL from Part 2]` |

**Example:**
```
VITE_API_BASE_URL=https://streamflow-backend-abc123.northflank.app
```

### Step 4: Update Frontend .env (Build Time)

In Northflank, add **Environment Variables** under **Build Arguments**:

```env
VITE_API_BASE_URL=https://streamflow-backend-[xxx].northflank.app
```

### Step 5: Deploy Frontend

1. Click **"Deploy"**
2. Wait for build to complete (~3-5 minutes)
3. **Copy the frontend URL** (e.g., `https://streamflow-frontend-[xxx].northflank.app`)

---

## Part 4: Update CORS Settings

### Step 1: Update Backend CORS

1. Go back to **Backend service**
2. Navigate to **Environment** tab
3. Update `CORS_ORIGINS` variable:
   ```
   CORS_ORIGINS=https://streamflow-frontend-[xxx].northflank.app
   ```
4. Click **"Save"**
5. Redeploy backend

---

## Part 5: Verify Deployment

### Test Backend

1. Visit: `https://streamflow-backend-[xxx].northflank.app/docs`
2. You should see FastAPI Swagger docs
3. Test `/health` endpoint - should return `{"status": "healthy"}`

### Test Frontend

1. Visit: `https://streamflow-frontend-[xxx].northflank.app`
2. You should see the StreamFlow homepage
3. Try registering a new account
4. Test browsing movies

---

## Troubleshooting

### Backend Issues

**Database connection fails:**
- Check `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
- Ensure database addon is running
- Check database logs in Northflank

**Build fails:**
- Check build logs in Northflank
- Verify `requirements.txt` is present
- Ensure Python version is 3.11+

**CORS errors:**
- Verify `CORS_ORIGINS` matches exact frontend URL (with https://)
- No trailing slash in URL
- Redeploy backend after changing

### Frontend Issues

**Blank page:**
- Check browser console for errors
- Verify `VITE_API_BASE_URL` is set correctly
- Ensure API is accessible from browser

**API calls fail:**
- Check Network tab in browser DevTools
- Verify backend URL is correct
- Check CORS configuration

**Build fails:**
- Check if `npm install` succeeds locally
- Verify `package.json` is valid
- Check Node version (should be 18+)

### File Upload Issues

**Uploads disappearing:**
- Ensure persistent volume is mounted at `/app/uploads`
- Check volume size hasn't exceeded limit
- Verify write permissions in container

---

## Environment Variables Reference

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/streamflow

# Security
SECRET_KEY=your-secret-key-here-min-32-chars

# TMDB Integration
TMDB_API_KEY=your-tmdb-api-key-here

# Vidsrc
VIDSRC_PRIMARY_DOMAIN=vidsrc.to

# CORS
CORS_ORIGINS=https://your-frontend-url.northflank.app
```

### Frontend (Build Arguments)

```env
VITE_API_BASE_URL=https://your-backend-url.northflank.app
```

---

## Custom Domains (Optional)

### Add Custom Domain to Frontend

1. Go to **Frontend service** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `streamflow.yourdomain.com`)
4. Update DNS records as instructed
5. Wait for SSL certificate provisioning

### Add Custom Domain to Backend

1. Go to **Backend service** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Update DNS records
5. Update frontend `VITE_API_BASE_URL` and redeploy
6. Update backend `CORS_ORIGINS` to include new frontend domain

---

## Automatic Deployments

### Enable Auto-Deploy

1. Go to service settings
2. Navigate to **CI/CD** tab
3. Enable **"Auto-deploy on push"**
4. Select branch to watch
5. Northflank will now deploy automatically on git push

---

## Monitoring & Logs

### View Logs

1. Go to service in Northflank
2. Click **"Logs"** tab
3. Real-time logs from your application

### View Metrics

1. Go to service
2. Click **"Metrics"** tab
3. CPU, Memory, Network usage

---

## Scaling (Paid Plans)

### Horizontal Scaling

1. Go to service → **Scaling**
2. Increase **Replicas** count
3. Northflank handles load balancing

### Vertical Scaling

1. Go to service → **Plan**
2. Select higher tier plan
3. More CPU/RAM allocated

---

## Cost Estimation

### Free Tier
- **Backend**: 1 service (sleeps after inactivity)
- **Frontend**: 1 service
- **Database**: 256MB PostgreSQL
- **Total**: $0/month

### Paid (No Sleep)
- **Backend**: ~$7-10/month
- **Frontend**: ~$5/month
- **Database**: ~$7/month
- **Total**: ~$20/month

---

## Backup & Restore

### Database Backups

Northflank automatically backs up PostgreSQL addons. To restore:
1. Go to database addon
2. Click **"Backups"**
3. Select backup and restore

### Manual Backup

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

---

## Support

- **Northflank Docs**: https://northflank.com/docs
- **Northflank Discord**: https://discord.gg/northflank
- **StreamFlow Issues**: https://github.com/DohmBoy64Bit/StreamFlow/issues
