
import { db } from '../db';
import { collectionsTable } from '../db/schema';
import { type GetFeaturedCollectionsInput, type Collection } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getFeaturedCollections = async (input: GetFeaturedCollectionsInput): Promise<Collection[]> => {
  try {
    const results = await db.select()
      .from(collectionsTable)
      .where(eq(collectionsTable.is_featured, true))
      .orderBy(desc(collectionsTable.display_order))
      .limit(input.limit)
      .execute();

    return results;
  } catch (error) {
    console.error('Get featured collections failed:', error);
    throw error;
  }
};
