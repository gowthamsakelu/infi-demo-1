# Deploying INFINITY CRM on Render

This guide outlines the complete process to deploy **INFINITY CRM** (Laravel 12 + Livewire 4 Backend & Standalone Frontend) to [Render](https://render.com/).

---

## 📋 Architecture Overview

The repository is structured to deploy smoothly on Render:

| Service | Type on Render | Description | Port / Path |
| :--- | :--- | :--- | :--- |
| **`infinity-crm-backend`** | **Web Service (Docker)** | Complete Laravel 12 application with Livewire 4 UI & REST APIs | Dynamic `$PORT` / `/` & `/api` |
| **`infinity-crm-frontend`** | **Static Site** | Standalone HTML5/CSS3/JS demonstration UI | Free Static Site / `index.html` |

---

## 🚀 Method 1: 1-Click Deployment via Render Blueprint (Recommended)

Render Blueprints use the pre-configured [render.yaml](render.yaml) file in the root of the repository to automatically create and deploy all services.

### Steps:
1. **Push your code to GitHub or GitLab**:
   ```bash
   git add .
   git commit -m "INFINITY CRM: Ready for Render deployment"
   git push origin main
   ```
2. Log in to your [Render Dashboard](https://dashboard.render.com/).
3. Click the **"New +"** button at the top right and select **"Blueprint"**.
4. Connect your GitHub/GitLab repository.
5. Render will automatically detect [`render.yaml`](render.yaml) and list:
   - `infinity-crm-backend` (Docker Web Service)
   - `infinity-crm-frontend` (Static Site)
6. Click **"Apply"**. Render will build the Docker container, run migrations and database seeders, and bring the site online!

---

## 🛠️ Method 2: Manual Setup on Render Dashboard

If you prefer to configure services manually:

### Deploying the Laravel Backend:
1. In the Render Dashboard, click **New +** > **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `infinity-crm-backend`
   - **Language / Runtime**: `Docker`
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: `backend` (or leave empty to use root Dockerfile)
   - **Dockerfile Path**: `./backend/Dockerfile` (or `./Dockerfile` if Root Directory is empty)
   - **Docker Context**: `./backend` (or `.` if Root Directory is empty)
   - **Instance Type**: `Free` (or higher)
4. Under **Advanced** > **Health Check Path**, enter:
   ```text
   /up
   ```
5. Add the following **Environment Variables**:

| Key | Value | Description |
| :--- | :--- | :--- |
| `APP_NAME` | `INFINITY CRM` | Application Title |
| `APP_ENV` | `production` | Production environment |
| `APP_DEBUG` | `false` | Disable debug output for security |
| `APP_KEY` | *(Click "Generate" or run `php artisan key:generate --show`)* | 32-character encryption key |
| `LOG_CHANNEL` | `stderr` | Streams logs directly to Render log viewer |
| `DB_CONNECTION` | `sqlite` | Database driver (or `pgsql` if using Render Postgres) |
| `DB_DATABASE` | `/var/www/html/database/database.sqlite` | SQLite database filepath |
| `SESSION_DRIVER` | `database` | Stores user sessions in the database |
| `CACHE_STORE` | `database` | Caching driver |

6. Click **Create Web Service**.

---

### Deploying the Frontend (Optional Standalone):
1. In Render Dashboard, click **New +** > **Static Site**.
2. Connect your Git repository.
3. Configure:
   - **Name**: `infinity-crm-frontend`
   - **Publish Directory**: `frontend`
   - **Build Command**: *(leave empty)*
4. Click **Create Static Site**.

---

## 🗄️ Database Options

### Option A: Embedded SQLite (Default & Zero Setup)
The container automatically initializes `/var/www/html/database/database.sqlite` and runs migrations and seeders on first boot.

> [!NOTE]
> On Render's Free tier, the local filesystem resets when the container spins down due to inactivity. If you require persistent file storage across container restarts on SQLite, attach a **Persistent Disk** in Render Dashboard:
> - **Mount Path**: `/var/www/html/database`
> - **Size**: 1 GB

### Option B: Render Managed PostgreSQL (Recommended for Production)
1. In Render Dashboard, click **New +** > **PostgreSQL Database**.
2. Name it (e.g. `infinity-crm-db`) and create it.
3. Once provisioned, copy the **Internal Database URL** (e.g. `postgres://user:password@host/db`).
4. In your `infinity-crm-backend` Web Service:
   - Set `DB_CONNECTION`: `pgsql`
   - Set `DATABASE_URL`: paste the copied PostgreSQL internal URL.
5. The container startup will automatically migrate and seed the PostgreSQL database!

---

## 🔍 Verification & Health Check

1. **Check Live UI**:
   Visit your Render URL: `https://<your-service-name>.onrender.com`
   The Laravel Livewire booking operations dashboard will load with sample bookings, filters, and slide-over drawers.
2. **Check REST API**:
   - `https://<your-service-name>.onrender.com/api/bookings`
   - `https://<your-service-name>.onrender.com/api/metadata`
3. **Health Check**:
   - `https://<your-service-name>.onrender.com/up` returns HTTP 200 `OK`.
4. **View Logs**:
   In your Render Dashboard, click on **Logs** to view startup output and live request streams.

---

## 🐳 Local Container Testing

To test the exact Docker setup on your local machine before pushing:

```bash
# Build and run with Docker Compose
docker compose up --build

# Open in browser:
http://localhost:8000
```
