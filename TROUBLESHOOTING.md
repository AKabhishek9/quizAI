# OpenRouter Integration - Troubleshooting Guide

## 🔍 Diagnostic Checklist

Before troubleshooting, run this to check system status:

```bash
cd server

# 1. Check environment
echo "=== Environment ==="
cat .env | grep OPENROUTER_API_KEY

# 2. Check dependencies
echo "=== Dependencies ==="
npm list openai zod

# 3. Run integration test
echo "=== Testing ==="
npm run test-ai

# 4. Check logs
echo "=== Logs ==="
grep "\[ai\]" error.log 2>/dev/null || echo "No errors"
```

---

## ❌ Common Issues & Solutions

### Issue 1: "OPENROUTER_API_KEY is not set"

**Symptoms:**
```
Error: [ai] OPENROUTER_API_KEY is not set. Cannot generate questions.
```

**Causes:**
- `.env` file missing
- `OPENROUTER_API_KEY` not in `.env`
- Wrong format
- Environment not reloaded

**Solutions:**

**Step 1:** Create `.env` if missing
```bash
cd server
cat .env  # Check file exists
```

**Step 2:** Add key
```bash
# Get key from https://openrouter.ai/keys
echo "OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE" >> server/.env
```

**Step 3:** Verify format
```bash
cat server/.env | grep OPENROUTER
# Should output: OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
```

**Step 4:** Restart server
```bash
npm run dev
```

**Check:**
```bash
npm run test-ai
```

---

### Issue 2: "401 Unauthorized"

**Symptoms:**
```
Error: 401 Unauthorized
OpenRouter error: Invalid API key
```

**Causes:**
- Invalid API key format
- Key has expired
- Key deleted from OpenRouter
- Typo in key

**Solutions:**

**Step 1:** Verify key format
```bash
cat server/.env | grep OPENROUTER_API_KEY
# MUST start with: sk-or-v1-
# NOT sk- or nvapi-
```

**Step 2:** Check on OpenRouter
```
Visit: https://openrouter.ai/keys
1. List your keys
2. Check if key is listed
3. If missing, create new key
```

**Step 3:** Copy exact key
```bash
# From OpenRouter website, copy key exactly
# Edit server/.env
OPENROUTER_API_KEY=sk-or-v1-copy-paste-exact-key
```

**Step 4:** No spaces or quotes
```bash
# ❌ WRONG
OPENROUTER_API_KEY="sk-or-v1-xxx"

# ✅ RIGHT
OPENROUTER_API_KEY=sk-or-v1-xxx
```

**Step 5:** Restart and test
```bash
npm run dev
# Wait 5 seconds, then:
npm run test-ai
```

---

### Issue 3: "429 Too Many Requests"

**Symptoms:**
```
Error: 429 Too Many Requests
Rate limit exceeded
```

**Causes:**
- Too many requests in short time
- Account rate limit exceeded
- Multiple servers hitting same key

**Solutions:**

**Quick Fix:**
```bash
# System automatically retries with fallback model
# Then falls back to database cache
# No action needed - it will recover automatically
```

**Permanent Fix:**

**Option 1:** Use database cache
- Database fallback automatically used
- Questions returned from cache
- No rate limit impact

**Option 2:** Increase request spacing
- System already spaces requests internally
- Idempotent queue prevents duplicates

**Option 3:** Check OpenRouter account
```
Visit: https://openrouter.ai/account
Check: Rate limit status
Check: Tokens used today
```

**Option 4:** Contact OpenRouter support
```
https://openrouter.ai/support
Explain: Need higher rate limit
```

---

### Issue 4: "Timeout after 8s"

**Symptoms:**
```
Error: OpenRouter API timeout after 8s (mistralai/mistral-7b-instruct)
```

**Causes:**
- OpenRouter API is slow
- Network latency
- Model overloaded
- Large batch request

**Solutions:**

**Automatic Handling:**
```
System automatically:
1. Retries once with same model
2. Tries fallback model (Llama)
3. Falls back to database cache
4. Returns cached questions
```

**Monitor:**
```bash
LOG_LEVEL=debug npm run dev
# Will show which fallback was used
```

**Check OpenRouter Status:**
```
https://status.openrouter.io
Check: System status
Check: Incident notifications
```

**Reduce Batch Size:**
```typescript
// In controllers, reduce question count
count: 5  // Instead of 20
```

**Increase Timeout (Not Recommended):**
```typescript
// Only if absolutely necessary
// In server/src/services/ai.service.ts
setTimeout(() => reject(...), 10000)  // 10s instead of 8s
```

---

### Issue 5: "Validation Error: Zod Error"

**Symptoms:**
```
[ai] Mistral attempt 1 failed: Zod validation error
```

**Causes:**
- AI returned malformed JSON
- Missing required fields
- Invalid answer index
- Wrong data types

**Solutions:**

**Automatic Recovery:**
```bash
System automatically:
1. Retries with same model
2. Tries fallback model
3. Falls back to database
```

**Debug:**
```bash
LOG_LEVEL=debug npm run test-ai
# Shows which fields failed validation
```

**Check System Prompt:**
```typescript
// In server/src/services/ai.service.ts
// Verify SYSTEM_PROMPT includes:
// - Exact JSON structure
// - "answer" must be 0-indexed integer
// - No markdown in output
```

**Fallback Strategy:**
```
If validation fails:
1. Try again (same model) - usually succeeds
2. Try Llama (more reliable)
3. Return database cache
```

---

### Issue 6: "Database Fallback Failed"

**Symptoms:**
```
[ai] Database fallback also failed: MongoNetworkError
```

**Causes:**
- MongoDB not running
- Connection string invalid
- Database unreachable
- No questions in database

**Solutions:**

**Step 1:** Check MongoDB
```bash
# On Windows
mongod --version
# Should show MongoDB version

# Start MongoDB
mongod
# Should show: waiting for connections
```

**Step 2:** Check connection string
```bash
cat server/.env | grep MONGODB_URI
# Should be valid connection string
```

**Step 3:** Verify questions exist
```bash
# Using MongoDB CLI
mongo
> use quizai
> db.questions.countDocuments()
# Should show > 0
```

**Step 4:** Add test questions
```bash
# If no questions, generate some first
npm run dev
# Use the quiz endpoints to generate
```

---

### Issue 7: "Cannot find module 'openai'"

**Symptoms:**
```
Error: Cannot find module 'openai'
```

**Causes:**
- Dependencies not installed
- package.json not updated
- node_modules corrupted

**Solutions:**

**Step 1:** Install dependencies
```bash
cd server
npm install
```

**Step 2:** Verify openai is installed
```bash
npm list openai
# Should show: openai@^6.34.0 or similar
```

**Step 3:** Clear and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

**Step 4:** Rebuild if needed
```bash
npm run build
```

---

### Issue 8: "Cannot read property 'content'"

**Symptoms:**
```
Error: Cannot read property 'content' of undefined
```

**Causes:**
- API response format unexpected
- No message in response
- API returned error instead of content

**Solutions:**

**Check Response Format:**
```typescript
// In ai.service.ts, line ~115
const response = await openai.chat.completions.create({...});
console.log("Full response:", JSON.stringify(response, null, 2));
```

**Run with Debug:**
```bash
LOG_LEVEL=debug npm run test-ai
```

**Check OpenRouter Models:**
```
https://openrouter.ai/models
Verify: Mistral 7B exists
Verify: Llama 3 8B exists
Verify: Both are available
```

---

### Issue 9: "Invalid JSON from AI"

**Symptoms:**
```
SyntaxError: Unexpected token } in JSON at position 123
```

**Causes:**
- AI returned incomplete JSON
- Trailing commas in JSON
- Unescaped quotes
- Extra markdown markers

**Solutions:**

**Automatic Cleanup:**
```typescript
// In ai.service.ts, lines ~137-142
content = content
  .replace(/^```json\s*/m, "")
  .replace(/^```\s*/m, "")
  .replace(/```\s*$/m, "")
  .trim();
```

**System Retries:**
```
1. Strip markdown
2. Try parse
3. If fails, retry
4. If still fails, try other model
5. Finally fallback to database
```

**Check Prompt:**
```typescript
// Ensure prompt emphasizes:
// "Output ONLY the JSON object"
// "No markdown, no code fences"
```

---

### Issue 10: "No questions generated"

**Symptoms:**
```
[ai] Generation returned 0 questions
Error: AI returned 0 valid questions
```

**Causes:**
- AI didn't understand prompt
- Topics don't exist
- Difficulty level invalid
- Empty response

**Solutions:**

**Verify Parameters:**
```typescript
// Check if parameters are valid
stream: "Technology"        // Valid
difficulty: 2              // 1-5
topics: ["Arrays"]         // Non-empty
count: 10                  // > 0
```

**Check Prompt:**
```typescript
// In ai.service.ts, verify:
// - Stream is set
// - Topics are listed
// - Difficulty is 1-5
// - Count is > 0
```

**Test with Debug:**
```bash
npm run test-ai 2>&1 | grep -A 5 -B 5 "returned"
```

---

## 🧪 Testing & Verification

### Full System Test
```bash
cd server
npm run test-ai
```

### Quick Connectivity Test
```bash
npx tsx -e "
import { OpenAI } from 'openai';
const oi = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});
console.log('✓ OpenRouter configured');
"
```

### Model Availability Test
```bash
npx tsx -e "
import { OpenAI } from 'openai';
const oi = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});
const models = ['mistralai/mistral-7b-instruct', 'meta-llama/llama-3-8b-instruct'];
console.log('Checking models:', models);
"
```

---

## 📊 Monitoring & Debugging

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm run dev
```

### Check Logs for [ai] Messages
```bash
grep "\[ai\]" server.log
```

### Monitor OpenRouter Dashboard
```
https://openrouter.ai/account
View: Requests, tokens, costs
```

### Request Tracking
```bash
# Each request logs:
# [ai] Attempt (model/attempt/maxAttempts) | topics: ...
# [ai] Inserted X questions into the library
# [ai] Database fallback succeeded: returned X questions
```

---

## 🆘 Still Having Issues?

### 1. Check Logs First
```bash
LOG_LEVEL=debug npm run dev 2>&1 | tee debug.log
npm run test-ai
```

### 2. Verify All Environment Variables
```bash
cd server
cat .env
# Check: OPENROUTER_API_KEY present and correct format
```

### 3. Test Each Component
```bash
# Test MongoDB
mongod --version

# Test Node.js
node --version

# Test npm packages
npm list openai zod

# Test OpenRouter connectivity
npm run test-ai
```

### 4. Check Documentation
- Full setup: [server/OPENROUTER_SETUP.md](server/OPENROUTER_SETUP.md)
- Implementation: [OPENROUTER_IMPLEMENTATION.md](OPENROUTER_IMPLEMENTATION.md)
- Quick reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### 5. Get Help
- OpenRouter Docs: https://openrouter.ai/docs
- OpenRouter Support: https://openrouter.ai/support
- Check status: https://status.openrouter.io

---

## 📞 Emergency Checklist

If nothing works:

```bash
# 1. Kill server
Ctrl+C

# 2. Stop MongoDB
# Kill MongoDB process or mongod window

# 3. Clear caches
rm -rf node_modules package-lock.json .next dist

# 4. Reinstall
npm install

# 5. Verify environment
cat server/.env | grep OPENROUTER

# 6. Start MongoDB
mongod

# 7. Start fresh
npm run dev

# 8. Test again
npm run test-ai
```

---

## ✅ Success Indicators

When everything works, you should see:

```
✓ npm run test-ai passes
✓ No [ai] ERROR messages
✓ Questions generate in 2-4 seconds
✓ Quiz endpoints return questions
✓ Logs show "Inserted X questions"
```

---

## 📝 Still Need Help?

1. Check this guide first
2. Review logs with `LOG_LEVEL=debug`
3. Run `npm run test-ai`
4. Visit OpenRouter docs
5. Create detailed error report with logs

**You've got this!** 💪
