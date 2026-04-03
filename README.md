# 🧠 ClubQuiz — College Bootcamp Quiz Platform

A full-stack, production-ready quiz web application built with **React + Tailwind CSS** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 📁 Project Structure

```
clubQUiz/
├── backend/           # Express API server
│   ├── models/        # Mongoose schemas (Question, Result)
│   ├── routes/        # API routes (questions, submit, leaderboard)
│   ├── seed/          # Database seed script (20 questions)
│   ├── server.js      # Main Express server
│   └── .env           # Environment variables (create from .env.example)
│
└── frontend/          # React + Vite + Tailwind CSS app
    ├── src/
    │   ├── api/       # Axios API service
    │   ├── context/   # Global quiz state (QuizContext)
    │   └── pages/     # RegistrationPage, QuizPage, LeaderboardPage, AdminPanel
    └── vite.config.js # Proxy to backend API
```

---

## 🚀 Quick Start

### 1. Configure Environment

```bash
cd backend
copy .env.example .env
# Edit .env and set your MongoDB Atlas URI
```

Your `.env` should look like:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/clubquiz
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 2. Install & Seed Backend

```bash
cd backend
npm install
npm run seed      # Loads 20 questions into MongoDB
npm run dev       # Starts server on port 5000
```

### 3. Install & Run Frontend

```bash
cd frontend
npm install
npm run dev       # Starts Vite dev server on port 5173
```

Open **http://localhost:5173** in your browser 🎉

---

## 📡 API Endpoints

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/api/questions`      | Fetch all questions (no answers)     |
| POST   | `/api/submit`         | Submit quiz answers                  |
| GET    | `/api/leaderboard`    | Get ranked leaderboard               |
| GET    | `/api/leaderboard?department=CSE` | Department-filtered leaderboard |
| GET    | `/api/leaderboard/stats` | Aggregate statistics             |
| GET    | `/api/health`         | Server health check                  |
| POST   | `/api/questions/add`  | Admin: Add a question                |
| DELETE | `/api/questions/clear`| Admin: Clear all questions           |

---

## 🎨 Features

- **Student Registration**: Name, Roll Number (unique), Email (unique), Department
- **15-Minute Timer**: Auto-submits when time expires
- **Question Navigator**: Jump to any question via dot grid
- **Anti-Cheat**: Tab-switch warning detection
- **Duplicate Prevention**: Server-side + MongoDB unique index
- **Leaderboard**: Ranked by score (desc) then time (asc), filterable by department
- **Admin Panel**: Add questions, clear DB, health check (accessible via top nav)
- **Responsive**: Mobile-first design

---

## 🚀 Deployment

### Backend → Render.com
1. Push `backend/` to a GitHub repo
2. Create a new **Web Service** on Render
3. Set environment variables: `MONGO_URI`, `PORT`, `NODE_ENV=production`, `FRONTEND_URL`
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend → Vercel
1. Push `frontend/` to a GitHub repo
2. Import to Vercel (auto-detects Vite)
3. Set environment variable: `VITE_API_URL` (if not using proxy)
4. `vercel.json` handles SPA routing rewrites

---

## 🔐 Security Notes

- Correct answers are **never sent** to the frontend (stripped in GET /questions)
- Rate limiting: 200 req/15min general, 5 submissions/hr per IP
- Input validation with `express-validator`
- Helmet.js for security headers
- MongoDB connection pooling (maxPoolSize: 50) for 100 concurrent users
