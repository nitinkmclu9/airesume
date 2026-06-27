# ResumeIQ AI

**Analyze, Optimize, and Get Hired Faster.**

A production-ready AI-powered Resume Analyzer SaaS platform built with Next.js, Node.js, MongoDB, OpenAI API, JWT Authentication, Cloudinary, and Tailwind CSS.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## Features

- **ATS Resume Analysis** — Score your resume's compatibility with Applicant Tracking Systems
- **Skill Gap Detection** — Compare skills against target roles (Frontend, Backend, Full Stack, Data Analyst)
- **AI Resume Optimization** — Improved summaries, experience bullets, and ATS keywords
- **Interview Preparation** — Technical, behavioral, and HR questions with answers
- **AI Job Matcher** — Find suitable roles with match percentages and salary ranges
- **PDF & Excel Reports** — Downloadable analysis reports
- **Cover Letter Generator** — AI-generated tailored cover letters
- **LinkedIn Profile Analyzer** — Optimize your LinkedIn presence
- **Resume Templates** — Professional ATS-friendly templates
- **Admin Dashboard** — User management, analytics, revenue tracking
- **Dark/Light Mode** — Premium glassmorphism UI with smooth animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion, ShadCN UI |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcrypt, Google OAuth ready |
| Storage | Cloudinary |
| AI | OpenAI GPT-4o-mini |
| Charts | Recharts |

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (optional — mock data used without it)

### Installation

```bash
# Clone and install
npm run install:all

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit backend/.env with your credentials
```

### Run Development

```bash
# Start both frontend and backend
npm install concurrently
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Create Admin User

Register normally, then in MongoDB set the user's role to `admin`:

```javascript
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

## Project Structure

```
resumeiq-ai/
├── frontend/          # Next.js 15 app
│   ├── src/app/     # Pages (landing, auth, dashboard, admin)
│   ├── src/components/
│   ├── src/lib/     # API client, utilities
│   └── src/contexts/ # Auth context
├── backend/         # Express.js API
│   └── src/
│       ├── routes/  # API routes
│       ├── models/  # MongoDB schemas
│       ├── services/ # OpenAI, email, PDF, Excel
│       └── middleware/ # Auth, rate limiting, validation
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/resumes/upload` | Upload resume |
| POST | `/api/resumes/:id/analyze` | AI analysis |
| POST | `/api/resumes/:id/skill-gap` | Skill gap analysis |
| POST | `/api/resumes/:id/optimize` | Resume optimization |
| POST | `/api/resumes/:id/interview` | Interview questions |
| POST | `/api/resumes/:id/job-match` | Job matching |
| POST | `/api/reports/generate` | Generate report |
| GET | `/api/admin/stats` | Admin statistics |

## Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel deploy
```

Set `NEXT_PUBLIC_API_URL` to your backend URL.

### Backend (Render)

```bash
cd backend
npm run build
npm start
```

Set environment variables from `.env.example`.

### Database (MongoDB Atlas)

Create a free cluster and set `MONGODB_URI` in backend env.

## Security

- JWT authentication with bcrypt password hashing
- Rate limiting on auth and AI endpoints
- Helmet.js security headers
- Input validation with express-validator
- CORS configured for frontend origin

## Resume-Worthy Description

> Built a production-ready AI-powered Resume Analyzer SaaS platform using Next.js, Node.js, MongoDB, OpenAI API, JWT Authentication, Cloudinary, and Tailwind CSS. Implemented ATS scoring, skill-gap analysis, interview preparation, AI-powered resume optimization, PDF report generation, and an enterprise admin dashboard with responsive modern UI and advanced security practices.

## License

MIT
