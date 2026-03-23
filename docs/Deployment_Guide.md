# 🚀 Prepify Deployment Guide — alokkumarsahu.in (Hostinger)

## 📋 Prerequisites
- Hostinger hosting account with domain `alokkumarsahu.in`
- Node.js installed on your local machine
- Git installed
- SSH access to Hostinger (optional, for backend)

---

## Part 1: Frontend Deployment (React + Vite)

### Step 1: Build the Production Bundle
```bash
cd c:\Users\alokk\OneDrive\Desktop\desktop\study-assistant-ai\frontend
npm run build
```
This creates a `dist/` folder with all static files.

### Step 2: Configure Vite for Production
Update `vite.config.js` if needed:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // root domain
})
```

### Step 3: Create `.htaccess` for SPA Routing
Create a file `dist/.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```
This ensures React Router works correctly on page refresh.

### Step 4: Upload to Hostinger
1. **Login to Hostinger** → Go to **hPanel**
2. Navigate to **Files → File Manager**
3. Go to `public_html` directory
4. **Delete** any existing files (backup first if needed)
5. **Upload** all contents from the `dist/` folder:
   - `index.html`
   - `assets/` folder (JS, CSS files)
   - `.htaccess` file
6. Alternatively, use **FTP upload**:
   - Go to **Files → FTP Accounts** in hPanel
   - Use FileZilla or similar FTP client
   - Host: `ftp.alokkumarsahu.in`
   - Upload `dist/` contents to `/public_html/`

### Step 5: Configure Domain SSL
1. In hPanel → **Security → SSL**
2. Enable **Free SSL** for `alokkumarsahu.in`
3. Enable **Force HTTPS**

---

## Part 2: Backend Deployment (Flask API)

### Option A: Deploy on Hostinger VPS (Recommended for full control)

#### Step 1: Access VPS via SSH
```bash
ssh root@your-server-ip
```

#### Step 2: Install Dependencies
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv nginx
```

#### Step 3: Upload Backend Code
```bash
# On your local machine
scp -r backend/ root@your-server-ip:/var/www/prepify-api/
```

#### Step 4: Set Up Virtual Environment
```bash
cd /var/www/prepify-api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Step 5: Create `.env` on Server
```bash
nano .env
```
Add your environment variables:
```env
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
DEEPSEEK_API_KEY=your-deepseek-key
DATABASE_URI=sqlite:///data/app.db
```

#### Step 6: Set Up Gunicorn
```bash
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 2 run:app
```

#### Step 7: Create Systemd Service
```bash
sudo nano /etc/systemd/system/prepify.service
```
```ini
[Unit]
Description=Prepify Flask API
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/prepify-api
Environment="PATH=/var/www/prepify-api/venv/bin"
ExecStart=/var/www/prepify-api/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 run:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl start prepify
sudo systemctl enable prepify
```

#### Step 8: Configure Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/prepify
```
```nginx
server {
    listen 80;
    server_name api.alokkumarsahu.in;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/prepify /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option B: Deploy Backend on Free Services

#### Render.com (Free Tier)
1. Push backend code to GitHub
2. Go to [render.com](https://render.com)
3. Create → **Web Service**
4. Connect your GitHub repo
5. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app`
6. Add environment variables in Render dashboard
7. Note the URL (e.g., `https://prepify-api.onrender.com`)

#### Railway.app (Free Tier)
1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. Deploy from GitHub
4. Configure environment variables
5. Get your API URL

---

## Part 3: Connect Frontend to Backend

### Step 1: Update API Base URL
Edit `frontend/src/config.js`:
```js
// For Hostinger VPS:
export const API_BASE_URL = "https://api.alokkumarsahu.in/api";

// OR for Render:
export const API_BASE_URL = "https://your-app.onrender.com/api";
```

### Step 2: Rebuild and Re-upload
```bash
cd frontend
npm run build
```
Then upload the new `dist/` folder to Hostinger.

---

## Part 4: DNS Configuration

### If using subdomain for API (api.alokkumarsahu.in):
1. In Hostinger → **Domains → DNS Zone**
2. Add **A Record**:
   - Name: `api`
   - Points to: `Your VPS IP address`
   - TTL: 14400

### If using external service (Render/Railway):
1. Add **CNAME Record**:
   - Name: `api`
   - Points to: `your-app.onrender.com`

---

## 🔒 Security Checklist
- [ ] Enable HTTPS/SSL on domain
- [ ] Set strong `SECRET_KEY` in production
- [ ] Never expose API keys in frontend code
- [ ] Enable CORS only for your domain
- [ ] Set up rate limiting
- [ ] Database backups

---

## 📱 Testing
1. Visit `https://alokkumarsahu.in`
2. Test registration/login
3. Test all features:
   - Dashboard, Notes, Flashcards, Quiz, AI Chat
   - Study Room, Analytics, Achievements
   - Study Planner, Brain Dump
   - Pomodoro, Attendance, Goals
4. Test on mobile devices
5. Check browser console for errors

---

## 🔄 Updating the App
```bash
# Make changes locally
cd frontend
npm run build
# Upload new dist/ files to Hostinger File Manager
```

## 🆘 Troubleshooting
| Issue | Solution |
|-------|----------|
| Blank page on refresh | Add `.htaccess` file (Step 3) |
| API 404 errors | Check `config.js` API URL |
| CORS errors | Enable CORS in Flask for your domain |
| SSL errors | Re-install SSL certificate in hPanel |
| Slow loading | Enable Gzip compression in `.htaccess` |
