import rateLimit from "express-rate-limit";

// Global rate limiter: 100 requests per minute per IP
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  validate: { ip: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

// Stricter rate limiter for AI-heavy endpoints (applied per route)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 quiz generation requests per minute per IP
  validate: { ip: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Quiz generation rate limit reached. Please wait a moment." },
});
