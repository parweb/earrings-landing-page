
import { db } from '../db';
import { newsletterSubscriptionsTable } from '../db/schema';
import { type CreateNewsletterSubscriptionInput, type NewsletterSubscription } from '../schema';

export const createNewsletterSubscription = async (input: CreateNewsletterSubscriptionInput): Promise<NewsletterSubscription> => {
  try {
    // Insert newsletter subscription record
    const result = await db.insert(newsletterSubscriptionsTable)
      .values({
        email: input.email
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Newsletter subscription creation failed:', error);
    throw error;
  }
};
