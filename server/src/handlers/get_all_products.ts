
import { db } from '../db';
import { productsTable, collectionsTable } from '../db/schema';
import { type ProductWithCollection } from '../schema';
import { desc, eq } from 'drizzle-orm';

export const getAllProducts = async (): Promise<ProductWithCollection[]> => {
  try {
    const results = await db.select()
      .from(productsTable)
      .leftJoin(collectionsTable, eq(productsTable.collection_id, collectionsTable.id))
      .orderBy(desc(productsTable.display_order), desc(productsTable.created_at))
      .execute();

    return results.map(result => ({
      id: result.products.id,
      name: result.products.name,
      description: result.products.description,
      price: parseFloat(result.products.price), // Convert numeric to number
      image_url: result.products.image_url,
      alt_image_url: result.products.alt_image_url,
      collection_id: result.products.collection_id,
      is_featured: result.products.is_featured,
      stock_quantity: result.products.stock_quantity,
      material: result.products.material,
      display_order: result.products.display_order,
      created_at: result.products.created_at,
      collection: result.collections ? {
        id: result.collections.id,
        name: result.collections.name,
        description: result.collections.description,
        image_url: result.collections.image_url,
        is_featured: result.collections.is_featured,
        display_order: result.collections.display_order,
        created_at: result.collections.created_at
      } : null
    }));
  } catch (error) {
    console.error('Failed to get all products:', error);
    throw error;
  }
};
