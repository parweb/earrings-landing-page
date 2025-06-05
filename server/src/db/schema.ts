
import { serial, text, pgTable, timestamp, numeric, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const collectionsTable = pgTable('collections', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  image_url: text('image_url').notNull(),
  is_featured: boolean('is_featured').notNull().default(false),
  display_order: integer('display_order').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  image_url: text('image_url').notNull(),
  alt_image_url: text('alt_image_url'),
  collection_id: integer('collection_id').references(() => collectionsTable.id),
  is_featured: boolean('is_featured').notNull().default(false),
  stock_quantity: integer('stock_quantity').notNull().default(0),
  material: text('material'),
  display_order: integer('display_order').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const testimonialsTable = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  customer_name: text('customer_name').notNull(),
  review_text: text('review_text').notNull(),
  rating: integer('rating').notNull(),
  is_featured: boolean('is_featured').notNull().default(false),
  display_order: integer('display_order').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const newsletterSubscriptionsTable = pgTable('newsletter_subscriptions', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  subscribed_at: timestamp('subscribed_at').defaultNow().notNull(),
  is_active: boolean('is_active').notNull().default(true),
});

// Relations
export const collectionsRelations = relations(collectionsTable, ({ many }) => ({
  products: many(productsTable),
}));

export const productsRelations = relations(productsTable, ({ one }) => ({
  collection: one(collectionsTable, {
    fields: [productsTable.collection_id],
    references: [collectionsTable.id],
  }),
}));

// Export all tables for proper query building
export const tables = {
  collections: collectionsTable,
  products: productsTable,
  testimonials: testimonialsTable,
  newsletterSubscriptions: newsletterSubscriptionsTable,
};
