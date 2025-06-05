
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  getFeaturedCollectionsInputSchema,
  getFeaturedProductsInputSchema,
  getFeaturedTestimonialsInputSchema,
  createNewsletterSubscriptionInputSchema
} from './schema';

import { getFeaturedCollections } from './handlers/get_featured_collections';
import { getFeaturedProducts } from './handlers/get_featured_products';
import { getFeaturedTestimonials } from './handlers/get_featured_testimonials';
import { createNewsletterSubscription } from './handlers/create_newsletter_subscription';
import { getAllCollections } from './handlers/get_all_collections';
import { getAllProducts } from './handlers/get_all_products';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Collections
  getFeaturedCollections: publicProcedure
    .input(getFeaturedCollectionsInputSchema)
    .query(({ input }) => getFeaturedCollections(input)),
  
  getAllCollections: publicProcedure
    .query(() => getAllCollections()),

  // Products
  getFeaturedProducts: publicProcedure
    .input(getFeaturedProductsInputSchema)
    .query(({ input }) => getFeaturedProducts(input)),
  
  getAllProducts: publicProcedure
    .query(() => getAllProducts()),

  // Testimonials
  getFeaturedTestimonials: publicProcedure
    .input(getFeaturedTestimonialsInputSchema)
    .query(({ input }) => getFeaturedTestimonials(input)),

  // Newsletter
  createNewsletterSubscription: publicProcedure
    .input(createNewsletterSubscriptionInputSchema)
    .mutation(({ input }) => createNewsletterSubscription(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
