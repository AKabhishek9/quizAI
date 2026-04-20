import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err: err.message }, "[error] Unhandled error");

  const status =
    "statusCode" in err ? (err as Error & { statusCode: number }).statusCode : 500;

  res.status(status).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}
