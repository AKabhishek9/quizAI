# OpenRouter AI Integration Setup Guide

## ✅ Quick Start (5 minutes)

### 1. Get OpenRouter API Key

```bash
# Visit https://openrouter.ai
# 1. Sign up or log in
# 2. Go to https://openrouter.ai/keys
# 3. Create a new API key
# 4. Copy the key (starts with sk-or-v1)
```

### 2. Add to Environment

Edit `server/.env`:
```bash
OPENROUTER_API_KEY=sk-or-v1-your_key_here_xxxxxxxxxxxx
```

### 3. Test Integration

```bash
cd server
npm run test-ai  # Runs the integration test
```

Expected output:
```
🧪 Starting OpenRouter AI Integration Tests

Test 1: ✓ Environment Variable Check
   ✓ Found API Key (hidden): sk-or-v1...xxxxx

Test 2: 🚀 Testing OpenRouter API Connectivity
   📝 Generating sample questions...
   ✓ Response received in 2345ms

✅ All tests passed!
```

---

## 🏗️ Architecture

### Models Used

| Model | Purpose | Speed | Cost |
|-------|---------|-------|------|
| **Mistral 7B** (PRIMARY) | Fast, efficient question generation | ⚡ Fast | 💰 Cheap |
| **Llama 3 8B** (FALLBACK) | Reliable backup if Mistral fails | ⚡ Fast | 💰 Cheap |
| **Database** (LAST RESORT) | Fallback to cached questions | ⚡ Instant | 🆓 Free |

### Request Flow

```
User requests quiz
  ↓
Check AI Cache (in-memory queue)
  ↓
Generate via OpenRouter (PRIMARY: Mistral 7B)
  ├─ Success? → Store in DB → Return to user ✓
  ├─ Timeout/Error? → Retry once (same model)
  │   ├─ Success? → Return ✓
  │   └─ Fail? → Try Fallback Model
  │       ├─ Success? → Return ✓
  │       └─ Fail? → Query Database cache
  │           ├─ Found? → Return cached ✓
  │           └─ Not found? → Error 🚫
```

---

## ⚙️ Configuration

### API Timeout

- **Primary model (Mistral)**: 8 seconds (fast)
- **Fallback model (Llama)**: 8 seconds (fast)
- **Database query**: 5 seconds

### Generation Parameters

Edit `server/src/services/ai.service.ts`:

```typescript
const PRIMARY_MODEL = "mistralai/mistral-7b-instruct";     // ← Change here
const FALLBACK_MODEL = "meta-llama/llama-3-8b-instruct";  // ← or here
```

Supported models on OpenRouter:
- `mistralai/mistral-7b-instruct` (recommended - cheap & fast)
- `meta-llama/llama-3-8b-instruct` (reliable fallback)
- `meta-llama/llama-3-70b-instruct` (more powerful, slower)
- `openai/gpt-4o-mini` (expensive, very good)

View all models: https://openrouter.ai/models

### Response Format

```typescript
temperature: 0.7  // Creativity (0=deterministic, 1=creative)
max_tokens: 2048  // Maximum response length
```

---

## 🔒 Security

### ✅ What's Protected

- API key stored in `.env` (NOT committed to git)
- OpenRouter calls only from **server** (never from browser)
- API key never exposed in logs or error messages

### ✅ Best Practices

1. **Never** commit `.env` to git
   ```bash
   # Check: server/.gitignore includes .env
   cat server/.gitignore | grep .env
   ```

2. **Never** hardcode API keys
   ```typescript
   // ❌ WRONG
   const key = "sk-or-v1-xxx";
   
   // ✅ RIGHT
   const key = process.env.OPENROUTER_API_KEY;
   ```

3. **Rotate keys** regularly
   - Old key → https://openrouter.ai/keys → Delete
   - Create new key
   - Update `.env`

4. **Monitor usage** at https://openrouter.ai/account

---

## 🚀 Performance

### Expected Response Times

```
Small batch (5 questions):   1-3 seconds
Medium batch (10 questions): 2-4 seconds
Large batch (20 questions):  3-6 seconds
```

### Cost Estimation

**Mistral 7B (PRIMARY)**:
- ~$0.0001 per 1K input tokens
- ~$0.0003 per 1K output tokens
- Typical quiz: ~$0.001-0.002

**Llama 3 8B (FALLBACK)**:
- ~$0.00025 per 1K input tokens
- ~$0.001 per 1K output tokens

View pricing: https://openrouter.ai/pricing

---

## 🧪 Testing

### Run Full Integration Test

```bash
cd server
npm run test-ai
```

### Run Manual Test

```bash
cd server
npx tsx -e "
import { generateQuestions } from './src/services/ai.service.js';
const q = await generateQuestions({
  stream: 'Technology',
  topics: ['Arrays'],
  difficulty: 2,
  count: 3,
  skipInsert: true
});
console.log(JSON.stringify(q, null, 2));
"
```

### Check API Key Validity

```bash
cd server
npx tsx -e "
const key = process.env.OPENROUTER_API_KEY;
console.log('Key present:', !!key);
console.log('Key format:', key ? key.slice(0, 10) + '...' : 'MISSING');
"
```

---

## 🐛 Troubleshooting

### Issue: "OPENROUTER_API_KEY is not set"

**Solution:**
```bash
# 1. Check file exists
cat server/.env | grep OPENROUTER

# 2. Check format
# Should be: OPENROUTER_API_KEY=sk-or-v1-xxxx

# 3. Restart server
npm run dev
```

### Issue: "401 Unauthorized"

**Possible causes:**
- Invalid API key
- Key has expired
- Key has been deleted

**Fix:**
1. Visit https://openrouter.ai/keys
2. Delete old key
3. Create new key
4. Update `.env`
5. Restart server

### Issue: "Timeout after 8s"

**Possible causes:**
- OpenRouter API is slow
- Network latency
- Model is overloaded

**Fix:**
- First attempt will retry with same model
- Second attempt will try fallback model
- If both fail, database cache is used
- Increase timeout in `ai.service.ts` if needed (not recommended)

### Issue: "429 Too Many Requests"

**Possible causes:**
- Rate limit exceeded
- Too many concurrent requests

**Fix:**
- OpenRouter should handle rate limiting gracefully
- System will retry automatically
- Check usage at https://openrouter.ai/account

### Issue: Validation Error (Zod)"

**Possible causes:**
- AI returned malformed JSON
- Missing required fields

**Fix:**
- System automatically retries
- Falls back to Llama 3
- If all fails, uses database cache
- Check logs for details

---

## 📊 Monitoring

### View Logs

```bash
# Live logs
npm run dev

# Check log level
cat server/.env | grep LOG_LEVEL

# Change log level
LOG_LEVEL=debug npm run dev
```

### API Usage Dashboard

Visit: https://openrouter.ai/account

You can see:
- Total requests
- Tokens used
- Cost breakdown by model
- Request latency

---

## 🔄 Migration from NVIDIA NIM

If you were previously using NVIDIA NIM:

### What Changed
- ✅ API endpoint: OpenRouter (faster, more reliable)
- ✅ Models: Mistral 7B → better cost/speed
- ✅ Timeout: 60s → 8s (much faster)
- ✅ Fallback logic: Improved (2-model + database)

### What Stayed the Same
- ✅ Question format (unchanged)
- ✅ Validation logic (Zod)
- ✅ Database schema (unchanged)
- ✅ API routes (unchanged)
- ✅ Frontend code (no changes needed)

### To Complete Migration

1. Keep old `NVIDIA_API_KEY` in `.env` (for now)
2. Add new `OPENROUTER_API_KEY` to `.env`
3. System automatically uses OpenRouter
4. After 1 week, remove `NVIDIA_API_KEY`

---

## 📝 System Prompt Customization

The system prompt controls AI behavior. Edit in `server/src/services/ai.service.ts`:

```typescript
const SYSTEM_PROMPT = `You are an expert technical assessor...`;
```

Key parameters:
- **Difficulty levels**: 1 (beginner) to 5 (expert)
- **Question types**: MCQ with 2-6 options
- **JSON format**: Enforced for validation

To customize:
1. Edit the prompt
2. Restart server
3. Test with `npm run test-ai`

---

## 🎯 Best Practices

### ✅ DO

- Use fallback models for reliability
- Cache questions in database
- Monitor API usage dashboard
- Rotate API keys monthly
- Set reasonable timeouts
- Validate all responses
- Log errors for debugging
- Test changes with `test-ai` script

### ❌ DON'T

- Hardcode API keys
- Commit `.env` to git
- Use browser-side API calls
- Ignore fallback errors
- Set very high timeouts
- Skip response validation
- Commit real API keys by accident
- Remove the fallback logic

---

## 🆘 Support

- OpenRouter Docs: https://openrouter.ai/docs
- OpenRouter API Status: https://status.openrouter.io
- Issues: Check logs with `LOG_LEVEL=debug npm run dev`

