import { Router } from 'express';
import { and, eq, or, asc } from 'drizzle-orm';
import { db } from '../db';
import { messages, listings, users } from '../db/schema';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { messageSchema } from '../lib/validation';

export const messagesRouter = Router();

// GET /messages/:listingId — the current dealer's thread on a listing (auth).
// Returns messages where the current user is either sender or receiver, so each
// interested dealer sees their own conversation with the listing owner.
messagesRouter.get('/:listingId', requireAuth, async (req: AuthRequest, res) => {
  const listingId = Number(req.params.listingId);
  if (!Number.isInteger(listingId)) {
    return res.status(400).json({ error: 'Invalid listing id' });
  }
  const me = req.user!.userId;

  const rows = await db
    .select({
      id: messages.id,
      listingId: messages.listingId,
      senderId: messages.senderId,
      receiverId: messages.receiverId,
      text: messages.text,
      createdAt: messages.createdAt,
      senderName: users.name,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(
      and(
        eq(messages.listingId, listingId),
        or(eq(messages.senderId, me), eq(messages.receiverId, me)),
      ),
    )
    .orderBy(asc(messages.createdAt));

  return res.json({ messages: rows });
});

// POST /messages — send a message about a listing (auth).
// Receiver defaults to the listing owner. If the owner is replying, they must
// pass receiverId (the interested dealer they're responding to).
messagesRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
  }
  const me = req.user!.userId;
  const { listingId, text } = parsed.data;

  const listing = await db.query.listings.findFirst({ where: eq(listings.id, listingId) });
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const iAmOwner = listing.userId === me;
  let receiverId = parsed.data.receiverId ?? (iAmOwner ? undefined : listing.userId);

  if (iAmOwner && !receiverId) {
    return res
      .status(400)
      .json({ error: 'receiverId is required when replying about your own listing' });
  }
  if (!receiverId || receiverId === me) {
    return res.status(400).json({ error: 'Invalid recipient' });
  }

  const [created] = await db
    .insert(messages)
    .values({ listingId, senderId: me, receiverId, text })
    .returning();

  return res.status(201).json({ message: created });
});
