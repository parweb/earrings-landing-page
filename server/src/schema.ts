
import { z } from 'zod';

// Collection schema
export const collectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  image_url: z.string(),
  is_featured: z.boolean(),
  display_order: z.number().int(),
  created_at: z.coerce.date()
});

export type Collection = z.infer<typeof collectionSchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  image_url: z.string(),
  alt_image_url: z.string().nullable(),
  collection_id: z.number().nullable(),
  is_featured: z.boolean(),
  stock_quantity: z.number().int(),
  material: z.string().nullable(),
  display_order: z.number().int(),
  created_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

// Product with collection info
export const productWithCollectionSchema = productSchema.extend({
  collection: collectionSchema.nullable()
});

export type ProductWithCollection = z.infer<typeof productWithCollectionSchema>;

// Testimonial schema
export const testimonialSchema = z.object({
  id: z.number(),
  customer_name: z.string(),
  review_text: z.string(),
  rating: z.number().int().min(1).max(5),
  is_featured: z.boolean(),
  display_order: z.number().int(),
  created_at: z.coerce.date()
});

export type Testimonial = z.infer<typeof testimonialSchema>;

// Newsletter subscription schema
export const newsletterSubscriptionSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  subscribed_at: z.coerce.date(),
  is_active: z.boolean()
});

export type NewsletterSubscription = z.infer<typeof newsletterSubscriptionSchema>;

// Input schemas
export const createNewsletterSubscriptionInputSchema = z.object({
  email: z.string().email()
});

export type CreateNewsletterSubscriptionInput = z.infer<typeof createNewsletterSubscriptionInputSchema>;

export const getFeaturedProductsInputSchema = z.object({
  limit: z.number().int().positive().optional().default(8)
});

export type GetFeaturedProductsInput = z.infer<typeof getFeaturedProductsInputSchema>;

export const getFeaturedCollectionsInputSchema = z.object({
  limit: z.number().int().positive().optional().default(4)
});

export type GetFeaturedCollectionsInput = z.infer<typeof getFeaturedCollectionsInputSchema>;

export const getFeaturedTestimonialsInputSchema = z.object({
  limit: z.number().int().positive().optional().default(6)
});

export type GetFeaturedTestimonialsInput = z.infer<typeof getFeaturedTestimonialsInputSchema>;
