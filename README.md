# SplitMint

A full-stack expense splitting application (Splitwise clone).

## Tech Stack

- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: React (Vite), Tailwind CSS

## Prerequisites

- Node.js installed
- PostgreSQL installed and running
- A database created (e.g. named `splitmint`)

## Setup

### Backend

1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your Postgres credentials.
4. Initialize Database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Start Server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Dev Server:
   ```bash
   npm run dev
   ```

## Features

- **Authentication**: Register/Login with JWT.
- **Groups**: Create groups, add participants.
- **Expenses**: Add expenses with Equal Split logic.
- **Balances**: Automatically calculates who owes whom.
- **Settlements**: View minimized settlement plan.

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET/POST /api/groups`
- `POST /api/expenses`
- `GET /api/expenses/group/:id/balance`

## Deployment Guide

### 1. GitHub
1. Initialize Git: `git init`
2. Add files: `git add .`
3. Commit: `git commit -m "Initial commit"`
4. Create a repo on GitHub.
5. Link remote: `git remote add origin <YOUR_REPO_URL>`
6. Push: `git push -u origin main`

### 2. Database (PostgreSQL)
- Use **Supabase**, **Neon**, or **Render** to get a free PostgreSQL database.
- Get the `connection string`.

### 3. Backend (Render.com)
1. Creating a new **Web Service** on Render.
2. Connect your GitHub repo.
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. **Environment Variables**: Add `DATABASE_URL` and `JWT_SECRET`.

### 4. Frontend (Vercel)
1. Import the same GitHub repo on Vercel.
2. Root Directory: `frontend`
3. Framework: `Vite` (Auto-detected).
4. **Environment Variables**: Set `VITE_API_URL` to your Render Backend URL (e.g., `https://splitmint-backend.onrender.com/api`).
   *(Note: You will need to update `frontend/src/context/AuthContext.jsx` to use `import.meta.env.VITE_API_URL` instead of hardcoded localhost)*

