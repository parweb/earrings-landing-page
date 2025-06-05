
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsletterSubscriptionsTable } from '../db/schema';
import { type CreateNewsletterSubscriptionInput } from '../schema';
import { createNewsletterSubscription } from '../handlers/create_newsletter_subscription';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateNewsletterSubscriptionInput = {
  email: 'test@example.com'
};

describe('createNewsletterSubscription', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a newsletter subscription', async () => {
    const result = await createNewsletterSubscription(testInput);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.id).toBeDefined();
    expect(result.subscribed_at).toBeInstanceOf(Date);
    expect(result.is_active).toBe(true);
  });

  it('should save newsletter subscription to database', async () => {
    const result = await createNewsletterSubscription(testInput);

    // Query using proper drizzle syntax
    const subscriptions = await db.select()
      .from(newsletterSubscriptionsTable)
      .where(eq(newsletterSubscriptionsTable.id, result.id))
      .execute();

    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0].email).toEqual('test@example.com');
    expect(subscriptions[0].subscribed_at).toBeInstanceOf(Date);
    expect(subscriptions[0].is_active).toBe(true);
  });

  it('should reject duplicate email addresses', async () => {
    // Create first subscription
    await createNewsletterSubscription(testInput);

    // Attempt to create duplicate should fail
    await expect(createNewsletterSubscription(testInput))
      .rejects.toThrow(/unique/i);
  });

  it('should set default values correctly', async () => {
    const result = await createNewsletterSubscription(testInput);

    // Verify default values are applied
    expect(result.is_active).toBe(true);
    expect(result.subscribed_at).toBeInstanceOf(Date);
    
    // Verify subscription timestamp is recent
    const now = new Date();
    const timeDiff = now.getTime() - result.subscribed_at.getTime();
    expect(timeDiff).toBeLessThan(1000); // Within 1 second
  });
});
