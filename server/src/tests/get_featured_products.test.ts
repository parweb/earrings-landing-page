
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, collectionsTable } from '../db/schema';
import { type GetFeaturedProductsInput } from '../schema';
import { getFeaturedProducts } from '../handlers/get_featured_products';

describe('getFeaturedProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return featured products with default limit', async () => {
    // Create test collection
    const collection = await db.insert(collectionsTable)
      .values({
        name: 'Test Collection',
        description: 'Test collection description',
        image_url: 'https://example.com/collection.jpg',
        is_featured: true,
        display_order: 1
      })
      .returning()
      .execute();

    // Create featured products
    await db.insert(productsTable)
      .values([
        {
          name: 'Featured Product 1',
          description: 'First featured product',
          price: '29.99',
          image_url: 'https://example.com/product1.jpg',
          alt_image_url: 'https://example.com/product1-alt.jpg',
          collection_id: collection[0].id,
          is_featured: true,
          stock_quantity: 10,
          material: 'Cotton',
          display_order: 2
        },
        {
          name: 'Featured Product 2',
          description: 'Second featured product',
          price: '39.99',
          image_url: 'https://example.com/product2.jpg',
          alt_image_url: null,
          collection_id: null,
          is_featured: true,
          stock_quantity: 5,
          material: 'Silk',
          display_order: 1
        },
        {
          name: 'Non-Featured Product',
          description: 'This product is not featured',
          price: '19.99',
          image_url: 'https://example.com/product3.jpg',
          alt_image_url: null,
          collection_id: null,
          is_featured: false,
          stock_quantity: 15,
          material: 'Polyester',
          display_order: 0
        }
      ])
      .execute();

    const input: GetFeaturedProductsInput = { limit: 8 };
    const result = await getFeaturedProducts(input);

    // Should return only featured products
    expect(result).toHaveLength(2);
    
    // Verify all returned products are featured
    result.forEach(product => {
      expect(product.is_featured).toBe(true);
    });

    // Verify order (higher display_order first)
    expect(result[0].name).toEqual('Featured Product 1');
    expect(result[0].display_order).toEqual(2);
    expect(result[1].name).toEqual('Featured Product 2');
    expect(result[1].display_order).toEqual(1);

    // Verify numeric conversion
    expect(typeof result[0].price).toBe('number');
    expect(result[0].price).toEqual(29.99);
    expect(typeof result[1].price).toBe('number');
    expect(result[1].price).toEqual(39.99);
  });

  it('should include collection data when product has collection', async () => {
    // Create test collection
    const collection = await db.insert(collectionsTable)
      .values({
        name: 'Luxury Collection',
        description: 'Premium items',
        image_url: 'https://example.com/luxury.jpg',
        is_featured: true,
        display_order: 5
      })
      .returning()
      .execute();

    // Create featured product with collection
    await db.insert(productsTable)
      .values({
        name: 'Luxury Product',
        description: 'A luxury item',
        price: '199.99',
        image_url: 'https://example.com/luxury-product.jpg',
        alt_image_url: null,
        collection_id: collection[0].id,
        is_featured: true,
        stock_quantity: 3,
        material: 'Premium Cotton',
        display_order: 1
      })
      .execute();

    const input: GetFeaturedProductsInput = { limit: 8 };
    const result = await getFeaturedProducts(input);

    expect(result).toHaveLength(1);
    
    const product = result[0];
    expect(product.collection).not.toBeNull();
    expect(product.collection?.id).toEqual(collection[0].id);
    expect(product.collection?.name).toEqual('Luxury Collection');
    expect(product.collection?.description).toEqual('Premium items');
    expect(product.collection?.image_url).toEqual('https://example.com/luxury.jpg');
    expect(product.collection?.is_featured).toBe(true);
    expect(product.collection?.display_order).toEqual(5);
    expect(product.collection?.created_at).toBeInstanceOf(Date);
  });

  it('should return null collection for products without collection', async () => {
    // Create featured product without collection
    await db.insert(productsTable)
      .values({
        name: 'Standalone Product',
        description: 'Product without collection',
        price: '49.99',
        image_url: 'https://example.com/standalone.jpg',
        alt_image_url: null,
        collection_id: null,
        is_featured: true,
        stock_quantity: 8,
        material: 'Mixed Materials',
        display_order: 1
      })
      .execute();

    const input: GetFeaturedProductsInput = { limit: 8 };
    const result = await getFeaturedProducts(input);

    expect(result).toHaveLength(1);
    
    const product = result[0];
    expect(product.collection).toBeNull();
    expect(product.collection_id).toBeNull();
  });

  it('should respect the limit parameter', async () => {
    // Create multiple featured products
    const productData = Array.from({ length: 10 }, (_, i) => ({
      name: `Featured Product ${i + 1}`,
      description: `Description ${i + 1}`,
      price: `${(i + 1) * 10}.99`,
      image_url: `https://example.com/product${i + 1}.jpg`,
      alt_image_url: null,
      collection_id: null,
      is_featured: true,
      stock_quantity: 5,
      material: 'Test Material',
      display_order: i + 1
    }));

    await db.insert(productsTable)
      .values(productData)
      .execute();

    const input: GetFeaturedProductsInput = { limit: 3 };
    const result = await getFeaturedProducts(input);

    expect(result).toHaveLength(3);
    
    // Should be ordered by display_order descending
    expect(result[0].display_order).toEqual(10);
    expect(result[1].display_order).toEqual(9);
    expect(result[2].display_order).toEqual(8);
  });

  it('should return empty array when no featured products exist', async () => {
    // Create non-featured product
    await db.insert(productsTable)
      .values({
        name: 'Regular Product',
        description: 'Not featured',
        price: '19.99',
        image_url: 'https://example.com/regular.jpg',
        alt_image_url: null,
        collection_id: null,
        is_featured: false,
        stock_quantity: 10,
        material: 'Cotton',
        display_order: 1
      })
      .execute();

    const input: GetFeaturedProductsInput = { limit: 8 };
    const result = await getFeaturedProducts(input);

    expect(result).toHaveLength(0);
  });
});
