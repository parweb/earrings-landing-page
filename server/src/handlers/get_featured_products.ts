
import { db } from '../db';
import { productsTable, collectionsTable } from '../db/schema';
import { type GetFeaturedProductsInput, type ProductWithCollection } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getFeaturedProducts = async (input: GetFeaturedProductsInput): Promise<ProductWithCollection[]> => {
  try {
    // Query featured products with their collections using left join
    const results = await db.select()
      .from(productsTable)
      .leftJoin(collectionsTable, eq(productsTable.collection_id, collectionsTable.id))
      .where(eq(productsTable.is_featured, true))
      .orderBy(desc(productsTable.display_order))
      .limit(input.limit)
      .execute();

    // Transform the joined results to match ProductWithCollection type
    return results.map(result => {
      const product = result.products;
      const collection = result.collections;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price), // Convert numeric to number
        image_url: product.image_url,
        alt_image_url: product.alt_image_url,
        collection_id: product.collection_id,
        is_featured: product.is_featured,
        stock_quantity: product.stock_quantity,
        material: product.material,
        display_order: product.display_order,
        created_at: product.created_at,
        collection: collection ? {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          image_url: collection.image_url,
          is_featured: collection.is_featured,
          display_order: collection.display_order,
          created_at: collection.created_at
        } : null
      };
    });
  } catch (error) {
    console.error('Get featured products failed:', error);
    throw error;
  }
};
