import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { authRouter } from './routes/auth';
import { listingsRouter } from './routes/listings';
import { messagesRouter } from './routes/messages';

const app = express();

// Railway terminates TLS at a proxy. `trust proxy` lets Express know the
// original request was HTTPS so `Secure` cookies are actually set.
app.set('trust proxy', 1);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// CORS — must reflect the exact frontend origin (not "*") and allow
// credentials, otherwise the browser drops the cross-domain auth cookie.
const allowedOrigins = config.frontendUrl.split(',').map((s) => s.trim());
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / tools with no Origin header (curl, health checks).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);

app.get('/', (_req, res) => {
  res.json({ name: 'Realest API', status: 'ok' });
});
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/listings', listingsRouter);
app.use('/messages', messagesRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  if (message.includes('not allowed by CORS')) {
    return res.status(403).json({ error: message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Realest API listening on :${config.port} (${config.nodeEnv})`);
});
