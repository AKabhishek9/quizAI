# QuizAI — Deployment Manual

This guide describes how to deploy QuizAI for free using **Render** (Backend) and **Vercel** (Frontend).

## 1. Prerequisites
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account.
- A [Google AI Studio](https://aistudio.google.com/) account (for Gemini API).
- A [Firebase Project](https://console.firebase.google.com/).

---

## 2. Backend Deployment (Render)

1. **Dashboard**: Go to [Render.com](https://render.com) and create a **New Web Service**.
2. **Root Directory**: Set this to `server`.
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   | Key | Example / Source |
   |-----|------------------|
   | `MONGODB_URI` | From MongoDB Atlas (Cluster -> Connect -> Drivers) |
   | `GEMINI_API_KEY` | From Google AI Studio |
   | `FIREBASE_SERVICE_ACCOUNT` | Your Firebase Service Account JSON (as a single-line string) |
   | `CORS_ORIGINS` | `https://your-app.vercel.app` (Add localhost for testing) |

---

## 3. Frontend Deployment (Vercel)

1. **Dashboard**: Create a new project on [Vercel](https://vercel.com).
2. **Framework**: Vercel will auto-detect "Next.js".
3. **Root Directory**: Leave as the root of the repository.
4. **Environment Variables**:
   | Key | Description |
   |-----|-------------|
   | `NEXT_PUBLIC_API_URL` | `https://your-render-app.onrender.com/api` |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase Project Settings |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | From Firebase Project Settings |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | From Firebase Project Settings |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | From Firebase Project Settings |

---

## 4. Database Setup (MongoDB Atlas)
1. Create a **Shared Cluster** (Free).
2. Go to **Network Access** and select **Allow Access from Anywhere** (0.0.0.0/0) so Render can connect.
3. In **Database Access**, create a user with "Read and write to any database" permissions.

---

## 5. Security & Secrets Check
- **Never** prefix your `GEMINI_API_KEY` or `MONGODB_URI` with `NEXT_PUBLIC_`.
- Ensure your `FIREBASE_SERVICE_ACCOUNT` is kept private on the Render dashboard.
