# Deploying INFINITY CRM (infi-demo-1) on Render

This guide provides the complete production configuration and deployment instructions for **INFINITY CRM** on [Render](https://render.com/).

---

## 📋 Architecture & Overview

- **Service Name**: `infi-demo-1`
- **Repository**: `gowthamsakelu/infi-demo-1`
- **Branch**: `main`
- **Runtime**: `Docker` (Multi-stage build)
- **Web Stack**: `PHP 8.2-FPM` + `Nginx` + `Supervisor`
- **Framework**: `Laravel 12`
- **Database**: `SQLite` (with `/var/data` persistent disk support)
- **Health Check Path**: `/health` (returns HTTP 200 JSON)

---

## 🚀 Deployment Instructions

### Method 1: Connect as a Web Service (Recommended)

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Select your GitHub repository: `gowthamsakelu/infi-demo-1`.
4. Configure the service settings:
   - **Name**: `infi-demo-1`
   - **Language / Runtime**: `Docker`
   - **Branch**: `main`
   - **Root Directory**: *(leave blank/empty)*
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Build Context**: `.`
   - **Instance Type**: `Free` (or Starter / Standard)
5. Expand **Advanced**:
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: `Yes` (On Commit)
6. Add the following **Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `APP_NAME` | `INFINITY` | Application name |
| `APP_ENV` | `production` | Production environment |
| `APP_DEBUG` | `false` | Security: disable debug mode |
| `APP_KEY` | *(Click "Generate" or paste 32-char key)* | Application encryption key |
| `APP_URL` | `https://infi-demo-1.onrender.com` | Your public Render URL |
| `LOG_CHANNEL` | `stderr` | Streams logs directly to Render log viewer |
| `DB_CONNECTION` | `sqlite` | Database driver |
| `DB_DATABASE` | `/var/www/html/database/database.sqlite` | SQLite file path (or `/var/data/database.sqlite`) |
| `SESSION_DRIVER` | `file` | File-based sessions |
| `CACHE_STORE` | `file` | File-based cache |
| `QUEUE_CONNECTION` | `sync` | Synchronous queue |
| `DEMO_LOGIN` | `true` | Enables 1-click demo access |

7. Click **Create Web Service**. Render will build the Docker container and start your service automatically!

---

### Method 2: 1-Click Blueprint (`render.yaml`)

1. In Render Dashboard, click **New +** > **Blueprint**.
2. Connect `gowthamsakelu/infi-demo-1`.
3. Render automatically detects `render.yaml` with the `infi-demo-1` web service, health check `/health`, and environment variables.
4. Click **Apply**.

---

## 🗄️ SQLite Database Persistence

### On Render Free Tier
Render's free tier provides an ephemeral local container disk. The SQLite database at `/var/www/html/database/database.sqlite` will persist during normal operation, but resets if the free instance spins down due to inactivity or when a new deployment is triggered.

The startup script (`docker/entrypoint.sh`) safely initializes the database without destructive commands (`migrate --force --isolated`), ensuring smooth operation on every cold start.

### Enabling 100% Persistent Storage (Paid Plan)
If you attach a **Persistent Disk** on Render:
1. In your `infi-demo-1` service on Render, go to **Disks** > **Add Disk**.
2. Set:
   - **Name**: `sqlite-data`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB`
3. In **Environment Variables**, set:
   - `DB_DATABASE`: `/var/data/database.sqlite`
4. The startup script will automatically detect `/var/data`, copy the seed database on first boot, and preserve all modifications across every restart and redeployment!

---

## 🔍 Verification & Health Checks

- **Health Check**: `https://<your-service>.onrender.com/health` (Returns HTTP 200 JSON `{"status": "ok", "app": "INFINITY"}`)
- **Sign In Page**: `https://<your-service>.onrender.com/login` (Features the Infinity logo, tagline, credentials login, and 1-click Instant Demo)
- **Dashboard & CRM**: `https://<your-service>.onrender.com/` (Authenticated operations dashboard with live customer enquiries, cargo specifications, and updates audit trail)
- **Live Logs**: Render Dashboard > **Logs** tab streams all startup progress, Nginx access logs, and PHP-FPM messages in real time.
