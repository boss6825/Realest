import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, type User } from '../db/schema';
import { signToken } from '../lib/jwt';
import { setAuthCookie, clearAuthCookie } from '../lib/cookies';
import { sendVerificationEmail } from '../lib/email';
import { signupSchema, loginSchema } from '../lib/validation';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { config } from '../config';

export const authRouter = Router();

/** Strip sensitive columns before returning a user over the wire. */
function publicUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    city: u.city,
    operatingArea: u.operatingArea,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
  };
}

// POST /auth/signup — create unverified user, email a verification link.
authRouter.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
  }
  const { email, password, name, phone, city, operatingArea } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.insert(users).values({
    email: normalizedEmail,
    passwordHash,
    name,
    phone,
    city,
    operatingArea,
    verificationToken,
    tokenExpiresAt,
  });

  try {
    await sendVerificationEmail(normalizedEmail, name, verificationToken);
  } catch (err) {
    // Don't fail signup if email delivery hiccups — link can be re-sent later.
    console.error('Failed to send verification email:', err);
  }

  return res.status(201).json({
    message: 'Account created. Check your email to verify your account.',
  });
});

// GET /auth/verify?token= — mark verified, then bounce back to the frontend.
authRouter.get('/verify', async (req, res) => {
  const token = String(req.query.token ?? '');
  const redirect = (status: string) =>
    res.redirect(`${config.frontendUrl.split(',')[0]}/verify-email?status=${status}`);

  if (!token) return redirect('invalid');

  const user = await db.query.users.findFirst({
    where: eq(users.verificationToken, token),
  });
  if (!user) return redirect('invalid');
  if (user.emailVerified) return redirect('already');
  if (user.tokenExpiresAt && user.tokenExpiresAt.getTime() < Date.now()) {
    return redirect('expired');
  }

  await db
    .update(users)
    .set({ emailVerified: true, verificationToken: null, tokenExpiresAt: null })
    .where(eq(users.id, user.id));

  return redirect('success');
});

// POST /auth/login — verify credentials + email, issue JWT cookie.
authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
  }
  const email = parsed.data.email.toLowerCase().trim();

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.emailVerified) {
    return res
      .status(403)
      .json({ error: 'Please verify your email before logging in', code: 'EMAIL_NOT_VERIFIED' });
  }

  const token = signToken({ userId: user.id, email: user.email });
  setAuthCookie(res, token);

  return res.json({ user: publicUser(user) });
});

// POST /auth/logout — clear the cookie.
authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out' });
});

// GET /auth/me — current user from the cookie.
authRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.userId) });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user: publicUser(user) });
});
