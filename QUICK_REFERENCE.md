# OpenRouter Integration - Quick Reference Card

## ⚡ Quick Commands

```bash
# Get API Key
Visit: https://openrouter.ai/keys

# Setup
echo "OPENROUTER_API_KEY=sk-or-v1-your_key" >> server/.env

# Test
cd server && npm run test-ai

# Run
npm run dev
```

---

## 🔑 Environment Variables

```bash
# REQUIRED
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx

# OPTIONAL (kept for backwards compatibility)
NVIDIA_API_KEY=
NVIDIA_BASE_URL=
NVIDIA_MODEL=
```

---

## 📊 API Endpoints

| Endpoint | Purpose | AI Service |
|----------|---------|-----------|
| `POST /api/get-quiz` | Generate adaptive quiz | generateQuestions() |
| `POST /api/submit-quiz` | Grade quiz | validateAnswers() |
| `GET /api/quiz/daily` | Get daily quizzes | Uses cached questions |

All unchanged - no frontend modifications needed!

---

## 🏃 One-Line Test

```bash
cd server && npm run test-ai
```

---

## 🎯 Models

**Primary**: `mistralai/mistral-7b-instruct` (fast, cheap)
**Fallback**: `meta-llama/llama-3-8b-instruct` (reliable)
**Last Resort**: Database cache (instant)

---

## ⏱️ Timeouts

- Per request: 8 seconds
- Automatic retry: Once per model
- Database fallback: Instant

---

## 💰 Cost

- Per question: ~$0.0001-0.0002
- Per quiz (10 Q): ~$0.001-0.002
- Monthly free: Check OpenRouter account

---

## 🔒 Security Checklist

- [x] API key in .env (not code)
- [x] .env in .gitignore
- [x] Server-side only (no browser calls)
- [x] Never logged or displayed
- [x] Validated with Zod

---

## 🐛 If It Fails

1. Check key in `server/.env`
2. Run `npm run test-ai`
3. Check OpenRouter status: https://status.openrouter.io
4. View logs: `LOG_LEVEL=debug npm run dev`

---

## 📖 Full Guides

- Setup: [server/OPENROUTER_SETUP.md](server/OPENROUTER_SETUP.md)
- Implementation: [OPENROUTER_IMPLEMENTATION.md](OPENROUTER_IMPLEMENTATION.md)

---

## 🎉 You're All Set!

1. Add your API key to `server/.env`
2. Run `npm run test-ai`
3. Start server: `npm run dev`
4. Deploy with confidence! 🚀
