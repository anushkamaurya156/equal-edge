# SakshamHire (सक्षम Hire)

**An AI-powered, accessibility-first job portal connecting differently-abled job seekers with inclusive employers.**

🔗 Live app: [sakshamhire.vercel.app](https://sakshamhire.vercel.app)

"Saksham" (सक्षम) means *capable* in Hindi — the platform is built around ability, not disability.

---

## The Problem

Job seekers with disabilities face two barriers that mainstream job portals rarely solve:

1. **Discovery** — no way to filter jobs by what actually matters: screen-reader compatibility, wheelchair access, sign-language support, flexible hours, remote options.
2. **Access** — the portals themselves are often unusable with assistive technology.

SakshamHire solves both: it's a job board built *for* accessibility, and built *with* accessibility as a first-class feature, not an afterthought.

---

## Features

### For Job Seekers
- Profile builder capturing disability type, severity, assistive tech in use, and accommodation needs as structured data
- Resume and disability-certificate upload
- Job search filterable by work type, job type, and individual accessibility features
- AI-powered resume checker with actionable, accessibility-aware feedback
- Government scheme matcher — real Indian PwD support schemes (NHFDC, PMKVY, ADIP, and more) matched to your profile
- Application tracking (`Applied → Reviewing → Shortlisted → Rejected/Hired`)

### For Employers
- Job posting with a dedicated, structured accessibility-features section (wheelchair access, screen-reader compatibility, sign language, WFH, assistive tech provided)
- Applicant dashboard showing each candidate's accessibility profile alongside their application
- AI-powered candidate matching with plain-English match reasons

### Built-in Accessibility Infrastructure
- **Read-Aloud** — reads any page aloud via the Web Speech API, adjustable rate/pitch
- **Focus Reader** — hover or keyboard-focus any element to hear its label spoken
- **Keyboard navigation** — visible focus outlines for keyboard users, skip-to-content link, focus trapping in modals, arrow-key navigation between interactive elements
- All of the above re-applies automatically to dynamically rendered content (via `MutationObserver`), not just on initial page load

### AI Layer
Job matching, resume review, and scheme matching all call OpenAI (`gpt-3.5-turbo`) when configured, and **gracefully fall back to deterministic rule-based logic** if no API key is set or the request fails — so the app never breaks in production or during a demo.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Vite 5 |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas + Mongoose 8 |
| Auth | JWT + bcryptjs |
| File uploads | Multer |
| AI | OpenAI API (with rule-based fallback) |
| Deployment | Backend → Render, Frontend → Vercel |

---

## Architecture

```
React SPA (Vercel)  ──HTTPS/JWT──▶  Express API (Render)  ──Mongoose──▶  MongoDB Atlas
                                            │
                                            └──▶  OpenAI API (optional, with local fallback)
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas connection string
- (Optional) OpenAI API key

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key   # optional — app falls back to rule-based logic without it
```

Run:
```bash
node server.js
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```
VITE_API_URL=http://localhost:5000/api
```

Run:
```bash
npm run dev
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register (jobseeker/employer) |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/profile/me` | ✓ | Get own profile |
| POST/PUT | `/api/profile/` | ✓ | Create/update profile |
| POST | `/api/profile/upload` | ✓ | Upload resume |
| POST | `/api/profile/upload-certificate` | ✓ | Upload disability certificate |
| GET | `/api/jobs/` | — | List jobs (filterable, searchable) |
| POST | `/api/jobs/` | ✓ (employer) | Create job |
| GET | `/api/jobs/employer` | ✓ (employer) | List own jobs |
| GET | `/api/jobs/:id` | — | Job detail |
| PUT / DELETE | `/api/jobs/:id` | ✓ (owner) | Update/delete job |
| POST | `/api/applications/` | ✓ (jobseeker) | Apply to a job |
| GET | `/api/applications/me` | ✓ (jobseeker) | Own applications |
| GET | `/api/applications/job/:jobId` | ✓ (employer, owner) | Applicants for a job |
| PATCH | `/api/applications/:id/status` | ✓ (employer, owner) | Update application status |
| POST | `/api/ai/match-jobs` | ✓ | AI/rule-based job matching |
| POST | `/api/ai/check-resume` | ✓ | AI/rule-based resume review |
| POST | `/api/ai/match-schemes` | ✓ | AI/rule-based scheme matching |
| GET | `/api/health` | — | Health check |

---

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- Stateless JWT auth (7-day expiry)
- Role-based access control (jobseeker/employer + ownership checks on jobs/applications)
- File upload validation (`.pdf/.doc/.docx/.jpg/.jpeg/.png`, 10MB limit)

---

## Roadmap

- [ ] Admin panel (manage users/jobs/applications, verify employers)
- [ ] Third-party verification of employer accessibility claims
- [ ] Migrate file storage from local disk to durable object storage

---

## License

Add your license here.
