<<<<<<< HEAD
# Errbud E-Learning Dashboard

A full-stack e-learning platform built for **Errbud** — a professional cleaning training company. The dashboard supports two roles: **Admin** and **Student**.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** Chakra UI + Tailwind CSS
- **Charts:** ApexCharts
- **Auth:** JWT (stored in `localStorage`)
- **API Client:** Axios (`src/lib/api.ts`) — points to a separate REST backend
- **Rich Text:** TipTap
- **Calendar:** FullCalendar
- **PDF/Certs:** html2canvas + html-to-image
=======
# Errbud LMS — Backend API

A Node.js/Express REST API powering the Errbud Learning Management System. It handles user authentication, course delivery, quiz assessments, progress tracking, and certificate issuance.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Roles & Permissions](#roles--permissions)
- [Data Models](#data-models)
- [Scripts](#scripts)
- [Deployment](#deployment)
>>>>>>> 6c203a7d3c6940cb92d5035bf01a6482a489b148

---

## Features

<<<<<<< HEAD
### Admin Portal (`/admin`)
- Dashboard with stats: total students, active modules, certificates issued, completion rate
- User management (invite, verify email, manage roles)
- Course/module management
- Certificate management
- Exam management
- Student request review

### Student Portal (`/dashboard`)
- Course browser & individual course view
- Quiz & final exam flow
- Certificate download
- Profile page

---

## Getting Started

### Prerequisites
- Node.js 18+
- A running backend API (defaults to `http://localhost:5000`)

### Installation

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend REST API | `http://localhost:5000` |
=======
- JWT-based authentication with email verification
- Role-based access control (Admin / Student)
- Course and lesson management with ordering
- Lesson-level and module-level quizzes
- Final exam with eligibility gating
- Student progress tracking
- Certificate issuance on exam completion
- Transactional emails via SendGrid (with Nodemailer fallback)
- Admin tools: create students, manage users, reset data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB (Mongoose 9) |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Passwords | bcryptjs |
| Email (primary) | SendGrid (`@sendgrid/mail`) |
| Email (fallback) | Nodemailer |
| Deployment | Render |
>>>>>>> 6c203a7d3c6940cb92d5035bf01a6482a489b148

---

## Project Structure

```
<<<<<<< HEAD
src/
├── app/
│   ├── (admin-portal)/admin/   # Admin pages
│   ├── (student)/              # Student pages
│   ├── (auth)/                 # Sign in / Register
│   └── verify-email/[token]/   # Email verification
├── components/                 # Shared UI components
├── context/                    # AuthContext
├── hooks/                      # useAuth, useModal, etc.
└── lib/
    └── api.ts                  # Axios instance with JWT interceptor
=======
errbud-backend/
├── server.js               # Entry point — connects DB and starts server
├── seed-admin.js           # One-time script to create the initial admin user
├── render.yaml             # Render deployment config
├── src/
│   ├── app.js              # Express app setup, routes, CORS, error handler
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Module.js       # A "course" in the LMS
│   │   ├── Lesson.js
│   │   ├── Progress.js     # Per-student, per-module progress
│   │   ├── FinalExam.js
│   │   └── Certificate.js
│   ├── controllers/        # Business logic (one file per resource)
│   ├── routes/             # Route definitions (one file per resource)
│   ├── middleware/
│   │   ├── auth.js         # Verifies JWT and attaches req.user
│   │   └── role.js         # Restricts routes by role
│   └── utils/
│       ├── emailService.js
│       ├── emailServiceSendGrid.js
│       └── emailServiceAPI.js
└── scripts/                # Maintenance and reset utilities
>>>>>>> 6c203a7d3c6940cb92d5035bf01a6482a489b148
```

---

<<<<<<< HEAD
## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
=======
## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- A SendGrid account (for email)

### Installation

```bash
# 1. Clone the repo
git clone <repo-url>
cd errbud-backend

# 2. Install dependencies
npm install

# 3. Configure environment variables (see below)
cp .env.example .env
# Edit .env with your values

# 4. Seed the initial admin user
node seed-admin.js

# 5. Start the development server
npm run dev
```

The API will be available at `http://localhost:5000`.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>

# Auth
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=7d

# URLs
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# SendGrid (primary email)
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=you@yourdomain.com
EMAIL_FROM_NAME=Errbud Platform

# Support info shown in emails
SUPPORT_EMAIL=support@yourdomain.com
SUPPORT_PHONE=+1-555-0123

# Optional: Nodemailer fallback (Gmail or Ethereal)
EMAIL_USER=
EMAIL_PASS=
ETHEREAL_USER=
ETHEREAL_PASS=
```

---

## API Reference

All routes are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/login` | Public | Login and receive a JWT |
| POST | `/send-verification-email` | Public | Resend verification email |
| GET | `/verify-email/:token` | Public | Verify email address |
| GET | `/me` | Student/Admin | Get current user profile |
| PUT | `/change-password` | Student/Admin | Change password |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create-student` | Admin | Create a student account (sends welcome email) |
| GET | `/` | Admin | List all users |
| GET | `/:id` | Admin | Get a specific user |
| PUT | `/:id` | Student/Admin | Update profile |
| PUT | `/:userId/status` | Admin | Activate or deactivate a user |
| DELETE | `/:userId` | Admin | Delete a user |

### Modules (Courses) — `/api/modules`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Student/Admin | List all modules |
| GET | `/:id` | Student/Admin | Get module details |
| POST | `/` | Admin | Create a module |
| PUT | `/:id` | Admin | Update a module |
| DELETE | `/:id` | Admin | Delete a module |
| PUT | `/:courseId/quiz` | Admin | Set module-level quiz |

### Lessons — `/api/lessons`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/module/:moduleId` | Student/Admin | List lessons in a module |
| GET | `/:id` | Student/Admin | Get lesson content |
| POST | `/` | Admin | Create a lesson |
| PUT | `/reorder` | Admin | Reorder lessons within a module |
| PUT | `/:id` | Admin | Update a lesson |
| DELETE | `/:id` | Admin | Delete a lesson |

### Progress — `/api/progress`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/me` | Student | Get my progress across all modules |
| GET | `/user/:userId` | Admin | Get a student's progress |
| POST | `/enroll/:moduleId` | Student | Enroll in a module |
| PUT | `/lesson/:lessonId/complete` | Student | Mark lesson complete and submit quiz score |
| PUT | `/course/:courseId/complete` | Student | Submit module-level quiz score |
| GET | `/can-take-exam` | Student | Check final exam eligibility |

### Exam — `/api/exam`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/student` | Student | Get exam questions (no answers) |
| GET | `/eligibility` | Student | Check if eligible to sit the exam |
| POST | `/submit` | Student | Submit exam answers |
| GET | `/` | Admin | Get exam with answer key |
| POST | `/` | Admin | Create the final exam |
| PUT | `/` | Admin | Update the final exam |

### Certificates — `/api/certificates`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/mine` | Student | Get my certificate |
| GET | `/` | Admin | List all issued certificates |
| POST | `/issue/:studentId` | Admin | Issue a certificate to a student |

---

## Roles & Permissions

| Action | Student | Admin |
|--------|---------|-------|
| Login / verify email | Yes | Yes |
| View courses & lessons | Yes | Yes |
| Enroll in courses | Yes | No |
| Complete lessons & quizzes | Yes | No |
| Take final exam | Yes (if eligible) | No |
| Manage users | No | Yes |
| Create/edit content | No | Yes |
| Issue certificates | No | Yes |

**Exam Eligibility:** A student must complete every active module AND achieve a quiz score of 60%+ on each before they can access the final exam.

---

## Data Models

### User
`name`, `email`, `password` (hashed), `role` (admin/student), `phone`, `avatar`, `isAccountActive`, `emailVerified`, `lastLogin`

### Module
`title`, `description`, `coverImage`, `status` (active/inactive), `quiz` (module-level quiz questions + passingScore)

### Lesson
`moduleId`, `title`, `description`, `content`, `visualContent`, `duration` (seconds), `order`, `quiz` (lesson-level quiz questions + passingScore)

### Progress
Tracks one student's journey through one module: per-lesson completion status, quiz scores, attempt counts, overall module status, and whether a certificate was issued.

### FinalExam
A single global exam with up to 20 questions, a time limit, and a configurable passing score (default 70%).

### Certificate
Issued once per student on exam completion. Records the student's name and score at the time of issue.

---

## Scripts

Utility scripts for database maintenance. Run with `node scripts/<file>`:

| Script | Purpose |
|--------|---------|
| `seed-admin.js` | Creates the initial admin user (run once on setup) |
| `scripts/reset-all-student-data.js` | Wipes all student progress records |
| `scripts/clear-quizzes.js` | Clears quiz data from lessons/modules |
| `scripts/clear-all-quizzes-comprehensive.js` | Full quiz data reset |
| `scripts/force-complete-reset.js` | Force-resets completion states |
| `scripts/resetQuizScores.js` | Resets quiz scores only |

> These scripts modify the database directly. Use them only in development or with a backup in production.

---

## Deployment

The project is configured for **Render** via `render.yaml`.

| Setting | Value |
|---------|-------|
| Build command | `npm install` |
| Start command | `npm start` |
| Health check | `GET /` |
| Auto-deploy | Enabled on push to `main` |

Set all required environment variables in your Render dashboard under **Environment**.

---

## npm Scripts

```bash
npm run dev    # Start with nodemon (auto-reload on file changes)
npm start      # Start for production
```
>>>>>>> 6c203a7d3c6940cb92d5035bf01a6482a489b148
