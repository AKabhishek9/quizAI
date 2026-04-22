import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
import { AppError } from "../lib/AppError.js";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: (err as ZodError).issues,
    });

    return;
  }

  // Known application error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Unknown error
  logger.error({ err: err.message || String(err) }, "[error] Unhandled error");

  const status = err.statusCode || err.status || 500;

  res.status(status).json({
    success: false,
    error: err.message || "Internal server error",
    code: "INTERNAL_ERROR",
  });
}

