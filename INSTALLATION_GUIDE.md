# NovaMind AI - Complete Installation & Deployment Guide

This guide provides all the necessary CLI commands and configuration instructions to set up the complete SaaS database-integrated local AI chatbot workspace.

---

## 1. Git Repository Setup
To initialize and track version controls inside the workspace:

```bash
# Initialize clean repository inside the project directory
git init

# Add all files to the staging area
git add .

# Create the initial version commit
git commit -m "feat: complete saas database-integrated local ai chatbot"

# View current staging status
git status
```

---

## 2. MySQL Database Setup
Ensure your MySQL server is running (e.g. via XAMPP, Laragon, or standalone MySQL).

```bash
# Log into MySQL CLI and create the workspace database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS novamind_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# (If password is blank/empty, run without -p flag)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS novamind_ai;"
```

---

## 3. Laravel Backend Installation (Composer)
Navigate to the backend directory (`c:\Users\Dhyan Patel\Documents\chatbot\backend\back`):

```bash
# 1. Install Composer dependencies
composer install

# 2. Copy environment variables file
copy .env.example .env

# 3. Generate Laravel security application key
php artisan key:generate

# 4. Run database migrations to set up the tables
php artisan migrate

# 5. Create storage symlink for file uploads/attachments
php artisan storage:link

# 6. Run the test suite to verify endpoints
php artisan test

# 7. Start the local Laravel development server
php artisan serve
```

---

## 4. React Frontend Installation (Node.js & npm)
Navigate to the frontend directory (`c:\Users\Dhyan Patel\Documents\chatbot\frontend\front`):

```bash
# 1. Install npm packages (includes react, vite, framer-motion, lucide-react)
npm install

# 2. Start the Vite React development server
npm run dev

# 3. Validate TypeScript and compile production-ready bundle
npm run build
```

---

## 5. Local Ollama & Qwen3:8b AI Engine Setup
To run local LLM processing privately without expensive API keys:

```bash
# 1. Download and run Ollama Installer for Windows
# URL: https://ollama.com/download

# 2. Pull the Qwen 8B model to local storage
ollama pull qwen:8b

# 3. Verify pulled models list
ollama list

# 4. Start the Ollama local AI server
ollama serve

# 5. Connect and test model directly via CLI
ollama run qwen:8b
```

---

## 6. Project Architecture Routing Settings
Ensure `.env` values are set as follows to link frontend and backend:

### Backend Configuration (`backend/back/.env`):
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
DB_DATABASE=novamind_ai
DB_USERNAME=root
DB_PASSWORD=

# Ollama local port mapping
OLLAMA_HOST=http://localhost:11434
```

### Frontend Configuration (`frontend/front/.env`):
```env
VITE_API_URL=http://localhost:8000/api
```
