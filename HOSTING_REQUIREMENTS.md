# StreamFlow Hosting Requirements

## Backend Requirements

### Essential Requirements

| Requirement | Description |
|------------|-------------|
| **Python 3.11+** | Runtime environment for FastAPI application |
| **PostgreSQL Database** | Relational database (external or included) |
| **Persistent File Storage** | For `/uploads` directory (list icons) |
| **512MB+ RAM** | Minimum memory for application |
| **HTTPS/SSL Certificate** | Secure connection support |
| **Environment Variables** | Configuration management |
| **FastAPI/Uvicorn Support** | Compatible ASGI server |
| **CORS Configuration** | Cross-origin request handling |
| **Git Deployment** | Deploy from GitHub repository |
| **Always-On or Cold Starts** | Continuous availability or acceptable startup delay |

### Nice to Have

| Feature | Purpose |
|---------|---------|
| **Redis** | Caching layer for improved performance (optional) |
| **1GB+ RAM** | Better performance under load |
| **Custom Domain** | Branded backend URL |
| **Automatic Deployments** | Deploy on git push |
| **Logs/Monitoring** | Debugging and performance tracking |

---

## Frontend Requirements

### Essential Requirements

| Requirement | Description |
|------------|-------------|
| **Static File Hosting** | Serve HTML, CSS, JavaScript files |
| **HTTPS/SSL Certificate** | Secure connection support |
| **SPA Routing Support** | Fallback to `index.html` for client-side routing |
| **Environment Variables** | Configuration at build time |
| **Node.js** | Build process support |
| **Git Deployment** | Deploy from GitHub repository |

### Nice to Have

| Feature | Purpose |
|---------|---------|
| **CDN/Edge Network** | Fast global content delivery |
| **Custom Domain** | Branded frontend URL |
| **Automatic Deployments** | Deploy on git push |
| **Build Preview** | Preview deployments for pull requests |
| **Analytics Integration** | Usage tracking and insights |

---

## Summary Checklist

### Backend Must Have
- ✅ Python runtime
- ✅ PostgreSQL database
- ✅ Persistent file storage
- ✅ HTTPS/SSL

### Frontend Must Have
- ✅ Static hosting
- ✅ SPA routing support
- ✅ HTTPS/SSL

### Deal Breakers
- ❌ **No persistent storage** → File uploads won't work
- ❌ **No PostgreSQL support** → Need external database
- ❌ **30s+ cold starts** → Poor user experience

---

## Recommended Free Stack

| Component | Service | Notes |
|-----------|---------|-------|
| **Frontend** | Vercel | Free tier, auto-deploy, CDN |
| **Backend** | Render.com | Free tier (sleeps after 15min) |
| **Database** | Neon.tech | Free 512MB PostgreSQL |
| **File Storage** | Cloudflare R2 | Free 10GB/month |

### Cost to Avoid Limitations
- **Railway**: $5/month (includes backend + database + storage)
- **Render Paid**: $7/month (always-on + persistent disk)

---

## Configuration Examples

### Backend Environment Variables
```env
DATABASE_URL=postgresql://user:pass@host:5432/streamflow
SECRET_KEY=your-secret-key-here
TMDB_API_KEY=your-tmdb-api-key
VIDSRC_PRIMARY_DOMAIN=vidsrc.to
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```
