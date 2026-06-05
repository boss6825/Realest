import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './index';

/**
 * Applies generated SQL migrations from ./drizzle.
 * Run `npm run db:generate` first to create them, then `npm run db:migrate`.
 * For a quick MVP setup you can instead use `npm run db:push`.
 */
async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations complete.');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
