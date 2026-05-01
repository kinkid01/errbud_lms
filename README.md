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

---

## Features

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

---

## Project Structure

```
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
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
