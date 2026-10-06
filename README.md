# 🚀 Alwinyah (Gizmo Alternative)

**Alwinyah** is a free, open-source, AI-powered gamified study app inspired by **Gizmo**. It features automated flashcard and quiz generation from notes, active recall study modes, spaced repetition (SM-2 algorithm), and an interactive AI tutor.

---

## ⚡ 100% Free Stack

| Layer | Service | Cost |
| :--- | :--- | :--- |
| **Frontend & API** | Next.js (App Router) on **Vercel** | **$0** (Hobby Tier) |
| **Database & Auth** | **Supabase** (PostgreSQL) | **$0** (Free Tier - 500MB DB, 50k MAU) |
| **AI Generation** | **Google Gemini API** (`gemini-2.5-flash`) | **$0** (15 RPM, 1,500 RPD on Google AI Studio) |
| **SRS Engine** | SM-2 Algorithm (Built-in) | **$0** (Runs client & server-side) |

---

## 🏃 Getting Started Locally

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Free Services Setup

### 1. Supabase (Free Database)
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Open [`supabase-schema.sql`](./supabase-schema.sql) in this repository, copy its contents, and run it.
4. Go to **Project Settings > API** and copy:
   - `Project URL`
   - `anon public key`
5. Paste them into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 2. Google Gemini API (Free Flashcard Generation & AI Tutor)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a free API key.
2. Add it to `.env.local`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

*(Note: Even without API keys configured, Alwinyah includes an offline smart card generator and sample decks so you can immediately play and test!)*

---

## 🚀 Deploying to Vercel ($0)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit for Alwinyah"
   # Create a repo on GitHub, then:
   git remote add origin https://github.com/your-username/alwinyah.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `alwinyah` GitHub repository.
4. Add your Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`).
5. Click **Deploy**! Your site will be live at `https://alwinyah.vercel.app`.
