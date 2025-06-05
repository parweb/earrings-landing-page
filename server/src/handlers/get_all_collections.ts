
import { db } from '../db';
import { collectionsTable } from '../db/schema';
import { type Collection } from '../schema';
import { asc } from 'drizzle-orm';

export const getAllCollections = async (): Promise<Collection[]> => {
  try {
    const results = await db.select()
      .from(collectionsTable)
      .orderBy(asc(collectionsTable.display_order), asc(collectionsTable.name))
      .execute();

    return results;
  } catch (error) {
    console.error('Get all collections failed:', error);
    throw error;
  }
};
