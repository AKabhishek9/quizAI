# QuizAI — Adaptive Learning Platform

QuizAI is a modern, AI-powered learning platform that generates personalized quizzes based on your knowledge level and technical focus areas.

## 🚀 Key Features

- **AI-Generated Quizzes**: Real-time quiz generation using Google Gemini 2.5 Flash.
- **Adaptive Difficulty**: Quizzes adjust based on your past performance and concept mastery.
- **Unified Analytics**: A high-performance dashboard showing your recent activity, performance trends, and XP levels.
- **Leaderboard**: Compete globally and track your ranking across different subjects.
- **Smooth UX**: Built with Next.js 15, Framer Motion, and Shadcn UI for a premium, responsive experience.

## 🛠 Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS 4, Framer Motion, Radix UI.
- **Backend**: Node.js/Express (ES Modules), TypeScript.
- **Database**: MongoDB Atlas with Mongoose.
- **Auth & Logic**: Firebase Authentication & Google AI (Gemini).

## 💻 Local Development

1. **Clone the repo**:
   ```bash
   git clone <your-repo-url>
   ```

2. **Frontend Setup**:
   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```

3. **Backend Setup**:
   ```bash
   cd server
   npm install
   cp .env.example .env
   npm run dev
   ```

## 📄 License
MIT
