
# Expense Tracker

A full stack personal finance dashboard for tracking expenses, income, and assets.

**Live demo:** https://expense-tracker-three-hazel-55.vercel.app

## Features

- Track expenses, income, and assets with full CRUD (create, read, update, delete)
- Dashboard with real-time stats — total spent, income, savings rate, net worth
- Line chart showing spending vs income over the last 7 days
- Category breakdown with animated progress bars
- Recent activity feed with color-coded tags
- Clickable stat cards with detailed breakdowns
- Recurring entries (weekly, monthly, yearly)
- Time period filtering (today, week, month, year, all time)
- Dark mode and customizable header (solid colors, gradients, custom photo)
- Animated cycling banner in header with live stats
- Centered modal forms for adding/editing entries
- Success toast notifications
- Fully responsive

## Tech Stack

**Frontend** — React, Vite, Tailwind CSS, Recharts  
**Backend** — Node.js, Express  
**Database** — PostgreSQL (Supabase)  
**Deployment** — Vercel (frontend), Railway (backend)

## Getting Started

### Prerequisites
- Node.js v18+
- A Supabase account

### Database Setup

Run these in Supabase SQL Editor:

```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'demo-user',
  category TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE income (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'demo-user',
  source TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'demo-user',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE income DISABLE ROW LEVEL SECURITY;
ALTER TABLE assets DISABLE ROW LEVEL SECURITY;
```

### Backend

```bash
cd server
npm install
```

Create a `.env` file:
```
DATABASE_URL=your_supabase_connection_string
PORT=3001
```

```bash
node index.js
```

### Frontend

```bash
cd client
npm install
```

Create a `.env.local` file:
```
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

## Deployment

- Frontend deployed on **Vercel** — connect your GitHub repo and set `VITE_API_URL` to your Railway backend URL
- Backend deployed on **Railway** — set `DATABASE_URL` to your Supabase Session Pooler connection string

## Project Structure

```
expense-tracker/
├── client/          # React frontend
│   ├── src/
│   │   └── App.jsx  # Main component
│   └── .env.local
└── server/          # Express backend
    ├── index.js     # API routes
    ├── db.js        # Database connection
    └── .env
```
- Initial release
