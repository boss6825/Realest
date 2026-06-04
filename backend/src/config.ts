import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const port = Number(process.env.PORT ?? 4000);

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port,

  // Neon Postgres — use the POOLED connection string.
  databaseUrl: required('DATABASE_URL'),

  // Secret used to sign JWTs. Generate with: openssl rand -hex 32
  jwtSecret: required('JWT_SECRET'),

  // Vercel frontend origin(s). Comma-separate to allow more than one
  // (e.g. "https://realest.vercel.app,http://localhost:3000").
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',

  // This API's own public URL — used to build the email verification link.
  backendUrl: process.env.BACKEND_URL ?? `http://localhost:${port}`,

  // Resend — leave empty in dev to log verification links to the console.
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'Realest <onboarding@resend.dev>',

  cookieName: process.env.COOKIE_NAME ?? 'realest_token',
} as const;
