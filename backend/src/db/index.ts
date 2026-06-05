import pkg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from '../config';
import * as schema from './schema';

const { Pool } = pkg;

const isLocal =
  config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1');

/**
 * A single shared connection pool for the whole process. Neon enforces
 * connection limits, so we never open a client per request — every query
 * borrows from this pool. Use the POOLED Neon connection string.
 */
export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
