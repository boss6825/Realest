import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../lib/jwt';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/** Gate a route behind a valid JWT cookie. Populates req.user. */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[config.cookieName];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}
