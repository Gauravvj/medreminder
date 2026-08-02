# 💊 MedReminder — Smart Medicine Reminder for Alzheimer's Patients

A comprehensive smart medicine reminder system designed specifically for Alzheimer's patients and their caregivers. Features include voice-activated confirmation, camera-based pill verification, cognitive games, real-time location tracking, and caregiver dashboards.

## 🏗️ Project Structure

```
hackathon/
├── backend/          # Express.js REST API (Node.js + MongoDB)
├── frontend/         # React + Vite frontend (TailwindCSS v4)
└── ai-service/       # Python AI microservice (FastAPI + EasyOCR)
```

---

## 🚀 Deployment Guide

### Prerequisites

1. **Node.js** v18+ and **npm**
2. **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier works)
3. **Python** 3.9+ (only if using camera pill verification)
4. **Google Gemini API Key** — [Get one free](https://aistudio.google.com/app/apikey)

---

### Step 1: Environment Variables

Copy the example env files and fill in your values:

```bash
# Backend
cp hackathon/backend/.env.example hackathon/backend/.env
# Edit hackathon/backend/.env with your actual values

# Frontend
cp hackathon/frontend/.env.example hackathon/frontend/.env
# Edit hackathon/frontend/.env with your actual values
```

**Required environment variables:**

| Variable | Description | Where to get it |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | Local: `mongodb://localhost:27017/medreminder`, Atlas: from your cluster dashboard |
| `JWT_SECRET` | Secret key for JWT tokens | Generate a random string: `openssl rand -hex 32` |
| `GEMINI_API_KEY` | Google Gemini AI API key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `VITE_API_URL` | Backend API base URL | For production: your deployed backend URL |

---

### Step 2: Install Dependencies

```bash
# Backend
cd hackathon/backend
npm install

# Frontend
cd hackathon/frontend
npm install

# AI Service (optional — for camera pill verification)
cd hackathon/ai-service
pip install -r requirements.txt
```

---

### Step 3: Run Locally

**Terminal 1 — Backend:**
```bash
cd hackathon/backend
npm run dev
# Starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd hackathon/frontend
npm run dev
# Starts on http://localhost:5173
```

**Terminal 3 — AI Service (optional):**
```bash
cd hackathon/ai-service
python main.py
# Starts on http://localhost:8000
```

---

### Step 4: Production Build

```bash
# Build frontend for production
cd hackathon/frontend
npm run build
# Output: frontend/dist/

# Backend is ready for production as-is
# Use a process manager like PM2:
npm install -g pm2
cd hackathon/backend
pm2 start src/server.js --name medreminder-api
```

**For production deployment, consider:**

1. **Frontend hosting:** Deploy `frontend/dist/` to Vercel, Netlify, or any static host
2. **Backend hosting:** Deploy the backend to Railway, Render, Fly.io, or a VPS
3. **Database:** Use MongoDB Atlas for a managed database
4. **Set environment variables** on your hosting platform (NOT in .env files)

---

## 🐛 Common Issues & Fixes

### Frontend build errors
- Ensure Node.js v18+ is installed
- Run `npm install` before `npm run build`
- The build was verified working on Node.js with Vite 7

### Backend won't start
- Make sure MongoDB is running locally OR provide a valid `MONGO_URI`
- All environment variables in `.env` must be set (use `.env.example` as reference)

### Camera verification not working
- The AI service (Python + EasyOCR) must be running on port 8000
- Without the AI service, camera verification falls back gracefully

### Voice confirmation not working
- Requires HTTPS (or localhost) — browser security restriction
- Use Chrome or Edge (Safari/Firefox have limited support)

---

## 🔑 Required API Keys Summary

| Service | Key needed? | Purpose | Cost |
|---|---|---|---|
| **MongoDB** | Yes (connection string) | Database storage | Free tier available (Atlas) |
| **JWT Secret** | Yes (random string) | Auth token signing | Free |
| **Google Gemini API** | Yes | MedBot AI chatbot | Free tier available |
| **Google Maps/Leaflet** | No | Map tiles (free CDN) | Free |
| **Speech Recognition** | No | Browser built-in API | Free |
| **Camera** | No | Browser built-in API | Free |

---

## 🧪 Tech Stack

- **Frontend:** React 19, Vite 7, TailwindCSS v4, Framer Motion, Recharts, Leaflet
- **Backend:** Express.js, Mongoose, JWT, bcrypt, node-cron
- **AI Service:** FastAPI, EasyOCR, Pillow
- **Database:** MongoDB
