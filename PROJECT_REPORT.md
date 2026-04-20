# QuizAI: Project Intelligence Report

## 1. Project Overview
**QuizAI** is a high-performance, AI-driven learning platform designed to transform technical education into an engaging, gamified experience. Built for students, developers, and lifelong learners, the platform leverages advanced Large Language Models (LLMs) to generate dynamic, up-to-date assessments across diverse categories like Technology, Aptitude, Maths, and Current Affairs.

### Core Value Proposition
- **Dynamic Content**: Unlike static platforms, QuizAI generates fresh quizzes daily using real-time AI logic.
- **Progression-First Design**: A deep XP and leveling system that tracks skill evolution.
- **Superior Aesthetics**: Implements the "Technical Atelier" design system for a premium, professional user experience.

---

## 2. Technology Stack & Infrastructure

### Frontend Architecture
- **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom OKLCH tokens.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid state transitions and Level-Up feedback.
- **Data Visualization**: [Recharts](https://recharts.org/) for performance telemetry.
- **State Management**: [TanStack Query](https://tanstack.com/query) for efficient server-state synchronization.

### Backend & Service Layer
- **Environment**: Node.js / Express (TypeScript)
- **Database/Auth**: [Firebase](https://firebase.google.com/) for authentication and real-time data storage.
- **AI Integration**: [Google Gemini Pro](https://ai.google.dev/) used for semantic question generation and grading.
- **API Protocol**: RESTful API integrated via a centralized `api-client` in the frontend.

---

## 3. Core Systems

### A. AI Generation Engine
The platform features an autonomous `daily-quiz.service.ts` that:
1.  **Schedules**: Generates 4 unique quizzes every 24 hours.
2.  **Semantic Synthesis**: Crafts MCQs with varying difficulty levels and contextual relevance.
3.  **Overwrite Logic**: Maintains a lean database by cycling content daily.

### B. Progression & Leveling (The "Synergy" System)
The XP system is the backbone of user engagement:
- **XP Calculation**: Awarded based on accuracy, speed, and difficulty.
- **Leveling Logic**: Discrete level tiers with exponential scales.
- **Real-time Feedback**: The `LevelUpToast` system provides immediate psychological rewards upon milestone achievement.

### C. Dashboard Telemetry (Technical Atelier)
The dashboard serves as the central command center for learners:
- **Generalized Mode**: Aggregated performance metrics (Total XP, Global Rank).
- **Specialized Mode**: Category-specific deep dives into Tech, Maths, and Aptitude scores.
- **Weekly Evolution**: A 7-day scoring trend visualization to track consistency and growth.

---

## 4. Design Philosophy: "Technical Atelier"
The UI/UX is built on the **Technical Atelier** principle: *Beauty through Information Density.*

- **Glassmorphism**: Subtle backdrop blurs and translucent card layouts.
- **OKLCH Colors**: High-fidelity, perceptually uniform color palettes (e.g., deep indigos, emerald accents).
- **Typography**: Modern, sans-serif fonts (Inter/Outfit) with strict hierarchy.
- **Responsive Fluidity**: Fully optimized for mobile-first interactions without sacrificing desktop power-user features.

---

## 5. Recent Technical Achievements (2026-04-20)
- ✅ **Synchronized Progression**: Successfully mapped Quiz completions to XP updates across the API and Dashboard.
- ✅ **Telemetry Innovation**: Introduced the Performance View Toggle (Generalized vs Specialized).
- ✅ **Mobile Stability**: Resolved critical Sheet component issues to ensure 100% navigation reliability on touch devices.
- ✅ **Build Optimization**: Eliminated syntax debt and optimized Framer Motion usage for faster bundle times.

---

## 6. Future Roadmap
- **Social Integration**: Competitive clans and shared learning streaks.
- **Multi-Modal Quizzes**: Image-based questions and code-completion challenges.
- **Custom Topic AI**: Allowing users to generate quizzes from their own PDFs or lecture notes.

---

> **Note**: This project is currently in a "Production-Ready" state with all core micro-services and UI components fully integrated and verified.
