# 🚀 Alwinyah

**Alwinyah** is a free, fast, gamified flashcards and active recall study web app. It uses the **SM-2 Spaced Repetition algorithm** to help you memorize content efficiently with multiple choice quizzes, 3D flip cards, fill-in-the-blank modes, study streaks, and XP points.

---

## ⚡ 100% Free Stack

| Layer | Service | Cost |
| :--- | :--- | :--- |
| **Frontend** | Next.js (React + Tailwind CSS) on **Vercel** | **$0** (Hobby Tier) |
| **Database & Auth** | **Supabase** (PostgreSQL) | **$0** (Free Tier - 500MB DB, 50k MAU) |
| **SRS Engine** | SM-2 Spaced Repetition (Built-in) | **$0** (Client-side / zero external APIs) |

---

## 🏃 Getting Started Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Free Supabase Setup (Optional Cloud Sync)

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

---

## 🚀 Deploying to Vercel ($0)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Update Alwinyah study app"
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `alwinyah` GitHub repository.
4. Add your Supabase environment variables if using cloud sync.
5. Click **Deploy**!
