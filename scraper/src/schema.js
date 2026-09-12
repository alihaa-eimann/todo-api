import { z } from 'zod';

export const BookSchema = z.object({
  title:             z.string().min(1),
  product_url:       z.string().url(),
  price_text:        z.string(),
  price_gbp:         z.number().positive(),
  availability_text: z.string(),
  rating_text:       z.string(),
  description:       z.string().nullable(),
  source_page:       z.string().url(),
  fetched_at:        z.string()
});

export function normalize(raw) {
  const price_gbp = parseFloat(raw.price_text.replace(/[^0-9.]/g, ''));
  return { ...raw, price_gbp };
}