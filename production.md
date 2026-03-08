# 🚀 VC Dashboard Production Guide

This project has been migrated to **Next.js** for seamless deployment on Vercel.

## 📦 Deployment on Vercel

1.  **Push to GitHub**: Ensure all changes are pushed to your repository.
2.  **Import to Vercel**:
    - Go to [Vercel Dashboard](https://vercel.com/new).
    - Import your `VC-DASHBOARD-THAM79` repository.
3.  **Configure Environment Variables**:
    In the Vercel project settings, add the following variables:
    
    | Variable | Description |
    | :--- | :--- |
    | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
    | `NEXT_PUBLIC_GEMINI_API_KEY` | Your Google Gemini API Key |

4.  **Deploy**: Click "Deploy". Vercel will automatically build and host your application.

## 🛠️ Local Development (Next.js)

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🔌 API Routes
- `GET /api/data`: Fetches sales data from Supabase.

---
*Created for EUGENE-THAM*
