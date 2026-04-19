import type { Request, Response, NextFunction } from "express";
import { auth as firebaseAuth } from "../services/firebase.service.js";

// Extend Express Request to include user payload securely
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      uid: string;
      email?: string;
      name?: string;
    };
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid token." });
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    if (!firebaseAuth) {
      res.status(500).json({ error: "Firebase Service not initialized on backend." });
      return;
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token);
    
    // Inject verified user into Request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };
    
    next();
  } catch (error) {
    console.error("[Auth] Verify token failed:", error);
    res.status(401).json({ error: "Unauthorized: Token verification failed." });
  }
};
