import { Router } from 'express';
import { and, eq, gte, lte, desc, type SQL } from 'drizzle-orm';
import { db } from '../db';
import { listings, users } from '../db/schema';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { listingSchema, listingUpdateSchema } from '../lib/validation';

export const listingsRouter = Router();

const LISTING_TYPES = ['agricultural', 'residential', 'commercial'] as const;
type ListingType = (typeof LISTING_TYPES)[number];

/** Columns returned for map pins / cards (dealer name only, no contact). */
const listingCardColumns = {
  id: listings.id,
  userId: listings.userId,
  title: listings.title,
  lat: listings.lat,
  lng: listings.lng,
  areaText: listings.areaText,
  size: listings.size,
  price: listings.price,
  type: listings.type,
  roadFacing: listings.roadFacing,
  notes: listings.notes,
  photoUrls: listings.photoUrls,
  createdAt: listings.createdAt,
  dealerName: users.name,
  dealerCity: users.city,
};

// GET /listings — all listings, with optional filters. Public (powers the map).
//   ?minPrice= &maxPrice= &type=agricultural|residential|commercial &roadFacing=true
listingsRouter.get('/', async (req, res) => {
  const conditions: SQL[] = [];

  const minPrice = Number(req.query.minPrice);
  if (req.query.minPrice !== undefined && Number.isFinite(minPrice)) {
    conditions.push(gte(listings.price, minPrice));
  }
  const maxPrice = Number(req.query.maxPrice);
  if (req.query.maxPrice !== undefined && Number.isFinite(maxPrice)) {
    conditions.push(lte(listings.price, maxPrice));
  }
  const type = String(req.query.type ?? '');
  if (LISTING_TYPES.includes(type as ListingType)) {
    conditions.push(eq(listings.type, type as ListingType));
  }
  if (req.query.roadFacing === 'true') {
    conditions.push(eq(listings.roadFacing, true));
  }

  const rows = await db
    .select(listingCardColumns)
    .from(listings)
    .leftJoin(users, eq(listings.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(listings.createdAt));

  return res.json({ listings: rows });
});

// GET /listings/mine — the current dealer's own listings (dashboard).
listingsRouter.get('/mine', requireAuth, async (req: AuthRequest, res) => {
  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.userId, req.user!.userId))
    .orderBy(desc(listings.createdAt));

  return res.json({ listings: rows });
});

// GET /listings/:id — detail + the listing dealer's contact info. Public.
listingsRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid listing id' });
  }

  const [row] = await db
    .select({
      ...listingCardColumns,
      dealerId: users.id,
      dealerPhone: users.phone,
      dealerEmail: users.email,
      dealerOperatingArea: users.operatingArea,
    })
    .from(listings)
    .leftJoin(users, eq(listings.userId, users.id))
    .where(eq(listings.id, id))
    .limit(1);

  if (!row) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  return res.json({ listing: row });
});

// POST /listings — create a listing (auth).
listingsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = listingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
  }

  const [created] = await db
    .insert(listings)
    .values({ ...parsed.data, userId: req.user!.userId })
    .returning();

  return res.status(201).json({ listing: created });
});

// PATCH /listings/:id — update (auth, owner only).
listingsRouter.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid listing id' });
  }

  const existing = await db.query.listings.findFirst({ where: eq(listings.id, id) });
  if (!existing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (existing.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'You can only edit your own listings' });
  }

  const parsed = listingUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
  }

  const [updated] = await db
    .update(listings)
    .set(parsed.data)
    .where(eq(listings.id, id))
    .returning();

  return res.json({ listing: updated });
});

// DELETE /listings/:id — delete (auth, owner only).
listingsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid listing id' });
  }

  const existing = await db.query.listings.findFirst({ where: eq(listings.id, id) });
  if (!existing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (existing.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'You can only delete your own listings' });
  }

  await db.delete(listings).where(eq(listings.id, id));
  return res.json({ message: 'Listing deleted' });
});
