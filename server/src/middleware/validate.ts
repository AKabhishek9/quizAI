import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Generic Zod validation middleware factory.
 * Validates req.body against the given schema.
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }
    // Replace body with parsed/sanitized values
    req.body = result.data;
    next();
  };
}

/**
 * Validates req.params against a schema.
 */
export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({ error: "Invalid path parameters" });
      return;
    }
    next();
  };
}

/* ─── Request Schemas ─── */

export const GetQuizSchema = z.object({
  stream: z.string().min(1).max(100).trim(),
  topics: z
    .array(z.string().min(1).max(100).trim())
    .min(1, "At least one topic is required")
    .max(10, "Maximum 10 topics allowed"),
  difficulty: z.number().int().min(1).max(5).optional(),
});

export const SubmitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid question ID format"),
        selectedOption: z.number().int().min(0).max(5),
      })
    )
    .min(1, "At least one answer is required")
    .max(50, "Maximum 50 answers allowed"),
});

export const AttemptIdParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/, "Invalid attempt ID format"),
});
