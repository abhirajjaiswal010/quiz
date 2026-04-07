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
# ClubQuiz: High-Concurrency Learning Platform

ClubQuiz is a professional, production-grade MERN application designed for real-time classroom engagement. It is specifically optimized to support **70+ concurrent student submissions** with zero UI lag and highly efficient server-side data broadcasting.

---

## 1. Project Overview
*   **Application Name**: ClubQuiz (V.1.0 Protocol Innovixus)
*   **Description**: A live, synchronizable quiz platform where an Admin controls the flow of questions and students compete in a real-time leaderboard environment.
*   **Target Users**: College bootcamps, classroom teachers, and event organizers.
*   **Use Case**: Running high-pressure, live competitive tests without the infrastructure cost or lag of third-party platforms.

## 2. Features
*   **Admin Command Center**: Real-time monitoring of "Active Pool" participants.
*   **Throttled Leaderboard**: A sophisticated broadcast system that batches 70+ updates into a single stream to prevent network congestion.
*   **Synchronized Start HUD**: A cinematic countdown intro that ensures all students begin the test at the exact same millisecond.
*   **Anti-Cheat Measures**: Tab-switching detection and server-side time validation.
*   **Haptic UI**: Glassmorphic, responsive design with high-polish animations for a premium feel.
*   **Auto-Grading**: Near-instant scoring based on precision and time-taken metrics.

## 3. Tech Stack
*   **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons.
*   **Backend**: Node.js, Express.js.
*   **Real-time Engine**: Socket.io (using optimized rooms and broadcast aggregation).
*   **Database**: MongoDB (Mongoose) with compound indexing for leaderboard performance.

## 4. System Architecture
*   **Architecture**: Monolithic service with a Client-Server decoupled structure.
*   **Data Flow**: 
    1. Admin initiates session -> Socket room created.
    2. Students join room -> Real-time heartbeat established.
    3. Quiz Start -> Global broadcast emitted -> UI transition.
    4. Submissions -> Throttled aggregator -> Final Leaderboard.
*   **Key Components**: `QuizContext` (State management), `useAdminData` (Business Logic), `broadcastUtils` (Performance Aggregator).

## 5. User Roles & Permissions
*   **Admin**:
    *   Create unique Quiz IDs.
    *   Upload/Manage questions via CSV or UI.
    *   Control Quiz Lifecycle (Start/Stop/Launch).
    *   Delete historical records and verify results.
*   **Student**:
    *   Joins via Name and Roll Number.
    *   Answers questions in real-time.
    *   Views live ranked leaderboard.

## 6. Installation & Setup
### Prerequisites:
*   Node.js (v18+)
*   MongoDB Atlas or Local Instance.

### Local Setup:
1. **Clone Repo**:
   ```bash
   git clone <repo-url>
   cd clubQUiz
   ```
2. **Backend Config**:
   * Create `backend/.env`:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_uri
     ADMIN_KEY=your_secret_admin_key
     ```
   * Install & Start:
     ```bash
     cd backend && npm install && npm run dev
     ```
3. **Frontend Config**:
   * Install & Start:
     ```bash
     cd frontend && npm install && npm run dev
     ```

## 7. Usage Guide
1. **Log in as Admin**: Use your `ADMIN_KEY` to access the panel.
2. **Setup Room**: Enter a unique Quiz ID and click **Create Session**.
3. **Wait for Joiners**: Share the Quiz ID with students. Watch the **Active Pool** counter.
4. **Launch**: Click **Launch Quiz** to start the synchronized countdown.
5. **Analyze**: Monitor the **Live Distribution** and **Leaderboard** as students finish.

## 8. API Documentation
*   `POST /api/join-quiz`: Adds a participant to the session.
*   **Note**: All routes are prefixed with `/api`.
*   `POST /api/submit`: Processes terminal answers and calculates score.
*   `GET /api/leaderboard?quizId=ID`: Returns the throttled, lean rankings.
*   `POST /api/create-quiz`: Admin-only endpoint to register a new session.

## 9. Database Design
*   **Quiz**: Master record for session ID, timing, and active status.
*   **Question**: Bank of multiple-choice questions.
*   **Participant**: Lean attendance records (with 24hr TTL).
*   **Result**: Persistent score records indexed by `(score, timeTaken)`.
*   **Attempt**: Intermediate persistent state to support student reconnection.

## 10. Performance & Optimization
*   **Query Lean Mode**: All high-traffic backend routes use `.lean()` and `.select()` to bypass overhead.
*   **React Memoization**: `LeaderboardRow` and `ParticipantRow` use `React.memo` to handle large lists (100+ items) at a stable 60FPS.
*   **Throttling**: Submissions are aggregated over a 2.5s window to prevent the "Socket Broadcast Storm" during mass submissions.

## 11. Security
*   **Protected Routes**: Admin endpoints require the `x-admin-key` header.
*   **Data Protection**: Rate limiting enforced to prevent brute-force attacks on quiz joins.
*   **Security Headers**: Integrated `Helmet.js` to protect against common XSS and Clickjacking.

## 12. Deployment
*   **Hosting**: Recommended on **Render.com** or **DigitalOcean**.
*   **Build Flow**:
    1. Run `npm run build` in `frontend/`.
    2. Set `NODE_ENV=production`.
    3. Run `backend/server.js` (Server is optimized to serve `dist` folders automatically).

## 13. Testing
*   **Stress Testing**: Use the included `backend/stress-test.js` to simulate 70-100 students in a single command (`node stress-test.js`).

## 14. License
*   MIT License. (C) 2026 ClubQuiz contributors.

---
**Maintained by**: Abhiraj Jaiswal & The ClubQuiz Core Team.
