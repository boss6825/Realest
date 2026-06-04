import { z } from 'zod';

const optionalText = z
  .string()
  .trim()
  .max(280)
  .optional()
  .transform((v) => (v === '' ? undefined : v));

export const signupSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(1, 'Name is required').max(120),
  phone: optionalText,
  city: optionalText,
  operatingArea: optionalText,
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const listingSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  areaText: optionalText,
  size: optionalText,
  price: z.number().int().nonnegative().optional(),
  type: z.enum(['agricultural', 'residential', 'commercial']),
  roadFacing: z.boolean().optional(),
  notes: z.string().trim().max(2000).optional(),
  photoUrls: z.array(z.string().url('Photo URLs must be valid URLs')).max(12).optional(),
});

export const listingUpdateSchema = listingSchema.partial();

export const messageSchema = z.object({
  listingId: z.number().int().positive(),
  text: z.string().trim().min(1, 'Message cannot be empty').max(2000),
  receiverId: z.number().int().positive().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
