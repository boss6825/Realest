import type { Response } from 'express';
import { config } from '../config';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Cross-domain auth gotcha lives here. The Vercel frontend and Railway API
 * are on different domains, so for the browser to send the cookie on
 * credentialed requests it must be `SameSite=None; Secure` in production.
 * Locally (http) we fall back to `Lax` since `Secure` cookies need HTTPS.
 */
function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? ('none' as const) : ('lax' as const),
    path: '/',
  };
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(config.cookieName, token, {
    ...cookieOptions(),
    maxAge: SEVEN_DAYS_MS,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(config.cookieName, cookieOptions());
}
