# HRMS Lite — Human Resource Management System

A lightweight, web-based Human Resource Management System that allows an admin to manage employee records and track daily attendance.

---

## 🚀 Live URLs

| Service | URL |
|---|---|
| Frontend | `https://your-app.vercel.app` |
| Backend API | `https://your-app.onrender.com` |
| API Docs | `https://your-app.onrender.com/docs` |

> ⚠️ The backend is hosted on Render's free tier. It may take **20–30 seconds** to wake up on the first request.

---

## 📌 Project Overview

HRMS Lite is a full-stack internal HR tool built for a single admin user. It covers two core HR operations:

**Employee Management**
- Add employees with a unique ID, full name, email, and department
- View all registered employees in a searchable table
- Delete an employee (also removes their attendance records)

**Attendance Management**
- Mark attendance for any employee on any date as Present or Absent
- View all attendance records with employee filter
- Delete individual attendance records

**Dashboard**
- Summary cards — total employees, total records, present/absent counts
- Overall attendance rate progress bar
- Per-employee attendance breakdown with present/absent counts and attendance rate

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Material UI (MUI v6) | Component library |
| React Router v6 | Client-side routing |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| Motor | Async MongoDB driver |
| Pydantic v2 | Data validation and schemas |
| Python-dotenv | Environment variable management |

### Database
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted NoSQL database |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |

---

## 📁 Project Structure

```
hrms-lite/
├── hrms-lite-backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── database.py          # MongoDB connection
│   │   ├── schemas.py           # Pydantic models
│   │   ├── routes/
│   │   │   ├── employee.py      # Employee CRUD routes
│   │   │   ├── attendance.py    # Attendance routes
│   │   │   └── dashboard.py     # Dashboard summary route
│   │   └── utils/
│   │       ├── serialize.py     # MongoDB doc serializer
│   │       └── response.py      # Consistent response wrappers
│   ├── .env                     # Environment variables (not committed)
│   ├── requirements.txt
│   └── .gitignore
│
└── hrms-lite-frontend/
    ├── src/
    │   ├── api/api.ts            # Axios instance
    │   ├── components/
    │   │   ├── Navbar.tsx        # Navigation bar
    │   │   └── EmployeeForm.tsx  # Add employee modal
    │   └── pages/
    │       ├── Dashboard.tsx     # Dashboard page
    │       ├── Employees.tsx     # Employee management page
    │       └── Attendance.tsx    # Attendance management page
    ├── .env                      # Environment variables (not committed)
    ├── package.json
    └── .gitignore
```

---

## ⚙️ Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (or local MongoDB)

---

### Backend Setup

```bash
# 1. Navigate to backend folder
cd hrms-lite-backend

# 2. Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file in the backend root
```

Create a `.env` file with the following:
```env
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hrms_db?appName=Cluster0
DB_NAME=hrms_db
```

```bash
# 5. Start the backend server
uvicorn app.main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`
API Docs at: `http://127.0.0.1:8000/docs`

---

### Frontend Setup

```bash
# 1. Navigate to frontend folder
cd hrms-lite-frontend

# 2. Install dependencies
npm install

# 3. Create .env file in the frontend root
```

Create a `.env` file with:
```env
VITE_API_URL=http://127.0.0.1:8000
```

```bash
# 4. Start the development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/employees/` | Get all employees |
| `POST` | `/employees/` | Add new employee |
| `DELETE` | `/employees/{employee_id}` | Delete employee |
| `GET` | `/attendance/` | Get all attendance records |
| `GET` | `/attendance/?date=YYYY-MM-DD` | Filter attendance by date |
| `POST` | `/attendance/` | Mark attendance |
| `GET` | `/attendance/{employee_id}` | Get attendance by employee |
| `DELETE` | `/attendance/{id}` | Delete attendance record |
| `GET` | `/dashboard/` | Get dashboard summary |

---

## ✅ Bonus Features Implemented

- **Filter attendance records** — by employee via dropdown
- **Total present days per employee** — shown in dashboard summary table
- **Dashboard summary** — stat cards, overall attendance rate bar, per-employee breakdown

---

## ⚠️ Assumptions & Limitations

- **Single admin user** — no authentication or login is implemented as per assignment scope
- **No role management** — all operations are accessible without any permissions
- **Free tier cold start** — Render's free tier spins down after inactivity. The first API request may take 20–30 seconds
- **Department field is free text** — no predefined department list; admin can enter any department name
- **Attendance is not restricted by date** — admin can mark attendance for any past or future date
- **No edit functionality** — employees and attendance records can only be added or deleted, not edited, as per assignment scope
- **MongoDB Atlas free tier** — 512MB storage limit, sufficient for this use case
