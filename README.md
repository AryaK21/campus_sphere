# 🎓 CampusSphere — Digital Campus Portal for PCCOE

CampusSphere is a modern, full-stack digital academic platform built specifically for students and faculty of Pimpri Chinchwad College of Engineering (PCCOE). It unifies syllabus-verified course notes, interactive computer science visualizers, peer discussions with faculty-verified solutions, digital notices, placement opportunities, and administrative role management into a single, clean web application.

---

## 🌟 Key Features

### 1. 🔐 Google Authentication (@pccoer.in Only) & Granular RBAC
- **Strict Domain Validation**: Only users with official `@pccoer.in` Google accounts are permitted to authenticate.
- **Roles**: `Student`, `Faculty (Teacher)`, `Admin`.
- **1-Click Demo Evaluation Switcher**: Built-in 1-click test accounts on the landing and login pages to test all three roles (`Student`, `Teacher`, `Admin`) instantly without requiring credentials.

### 2. ☀️ Clean Light & Dark Modes
- Simple, high-contrast, accessible UI tailored for everyday academic use.
- Instant toggle between light and dark mode saved in local storage.
- Zero confusing jargon: clean, minimal, professional English across all pages.

### 3. 📚 Course Resources & Study Materials
- Filter by **Department**, **Semester** (1 to 8), **Subject Code**, and **Resource Type** (`Notes`, `PPT`, `LabManual`, `PYQ`, `Syllabus`, `ReferenceBook`, `Assignment`).
- Rating system, bookmarking, and download counter.
- Faculty & Admin upload modal for new study materials.

### 4. 🧪 Interactive Computer Science Labs
1. **Sorting Algorithms**: Bubble, Selection, Insertion, Quick, and Merge sort with real-time bar rendering, speed controls, and comparison metrics.
2. **CPU Scheduling**: Dynamic Gantt chart for FCFS, SJF, Round Robin, and Priority scheduling with TAT and WT calculations.
3. **Digital Logic Gates**: Interactive binary input switches (0/1), live truth table generator, and 1-bit half adder circuit.
4. **Computer Networks**: CIDR Subnet Calculator (network address, broadcast, wildcard mask, and usable host range).

### 5. 💬 Campus Discussion Forum
- Categorized discussions (`Placements`, `Internships`, `Coding`, `Projects`, `Exams`, `General`).
- Upvoting and nested replies.
- Faculty-verified solution badges.

### 6. 📢 Notice Board & 💼 Placement Portal
- **Notice Board**: Departmental notices with high-priority pinning and attachments.
- **Placement Hub**: Active corporate recruitment drives (Microsoft, Barclays, etc.), package CTC breakdown, min CGPA eligibility checks, direct apply links, and senior interview experiences.

### 7. 🛡️ Administrator Panel
- Real-time campus telemetry and platform statistics.
- User management table with live search and role modification (`Student` ⇄ `Faculty` ⇄ `Admin`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | Supabase (PostgreSQL with RLS policies, indexes, and auth triggers) |
| **Authentication** | Supabase Auth (Google OAuth restricted to `@pccoer.in`) + Demo Evaluation Tokens |
| **Deployment** | Vercel (Client SPA + Serverless API Functions) |

---

## ⚡ Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env` and `client/.env.example` to `client/.env`.

For Supabase integration:
1. Create a project on [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and paste the contents of `supabase/schema.sql`, then click **Run**.
3. Under **Authentication -> Providers**, enable **Google** and add your Google Cloud OAuth Client ID and Secret.
4. Under **Settings -> API**, copy your Project URL, Anon Key, and Service Role Key into `server/.env` and `client/.env`.

### 3. Run Development Servers
```bash
# Runs both backend (:5000) and frontend (:5173) concurrently:
npm run dev
```

### 4. Build for Production
```bash
# Compiles TypeScript for both server and client:
npm run build
```

---

## 🚀 Deployment on Vercel

CampusSphere is pre-configured with `vercel.json` and `api/index.ts` for instant deployment on Vercel:

1. Push your repository to GitHub.
2. In Vercel, click **Add New Project** and select the repository.
3. In **Environment Variables**, add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `ALLOWED_EMAIL_DOMAIN` = `pccoer.in`
4. Click **Deploy**. Vercel will bundle the Vite frontend to `client/dist` and deploy the Express API via serverless functions under `/api/*`.

---

## 🔑 Pre-Seeded Evaluation Accounts

You can test all flows instantly using the 1-click buttons on the Login and Landing pages:

| Role | Email | Details |
|---|---|---|
| **Student** | `aarav.patel@pccoer.in` | Computer Engineering, Semester 6 |
| **Faculty / Teacher** | `prof.sharma@pccoer.in` | Computer Engineering Professor |
| **Admin** | `admin@pccoer.in` | Institutional Dean & Administrator |
