
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, collectionsTable } from '../db/schema';
import { getAllProducts } from '../handlers/get_all_products';

describe('getAllProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no products exist', async () => {
    const result = await getAllProducts();
    expect(result).toEqual([]);
  });

  it('should return products without collections', async () => {
    // Create a product without collection
    await db.insert(productsTable).values({
      name: 'Standalone Product',
      description: 'A product without collection',
      price: '29.99',
      image_url: 'https://example.com/product.jpg',
      is_featured: false,
      stock_quantity: 50,
      display_order: 1
    }).execute();

    const result = await getAllProducts();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Standalone Product');
    expect(result[0].description).toEqual('A product without collection');
    expect(result[0].price).toEqual(29.99);
    expect(typeof result[0].price).toEqual('number');
    expect(result[0].image_url).toEqual('https://example.com/product.jpg');
    expect(result[0].collection_id).toBeNull();
    expect(result[0].collection).toBeNull();
    expect(result[0].stock_quantity).toEqual(50);
    expect(result[0].display_order).toEqual(1);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return products with collections', async () => {
    // Create a collection first
    const collectionResult = await db.insert(collectionsTable).values({
      name: 'Test Collection',
      description: 'A test collection',
      image_url: 'https://example.com/collection.jpg',
      is_featured: true,
      display_order: 1
    }).returning().execute();

    const collection = collectionResult[0];

    // Create a product with collection
    await db.insert(productsTable).values({
      name: 'Collection Product',
      description: 'A product with collection',
      price: '49.99',
      image_url: 'https://example.com/product2.jpg',
      collection_id: collection.id,
      is_featured: true,
      stock_quantity: 25,
      material: 'Cotton',
      display_order: 2
    }).execute();

    const result = await getAllProducts();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Collection Product');
    expect(result[0].price).toEqual(49.99);
    expect(typeof result[0].price).toEqual('number');
    expect(result[0].collection_id).toEqual(collection.id);
    expect(result[0].material).toEqual('Cotton');
    expect(result[0].collection).not.toBeNull();
    expect(result[0].collection!.name).toEqual('Test Collection');
    expect(result[0].collection!.description).toEqual('A test collection');
    expect(result[0].collection!.is_featured).toEqual(true);
    expect(result[0].collection!.created_at).toBeInstanceOf(Date);
  });

  it('should return products ordered by display_order and created_at descending', async () => {
    // Create products with different display orders
    await db.insert(productsTable).values([
      {
        name: 'Product A',
        description: 'First product',
        price: '10.00',
        image_url: 'https://example.com/a.jpg',
        display_order: 1,
        stock_quantity: 10
      },
      {
        name: 'Product B',
        description: 'Second product',
        price: '20.00',
        image_url: 'https://example.com/b.jpg',
        display_order: 3,
        stock_quantity: 20
      },
      {
        name: 'Product C',
        description: 'Third product',
        price: '30.00',
        image_url: 'https://example.com/c.jpg',
        display_order: 2,
        stock_quantity: 30
      }
    ]).execute();

    const result = await getAllProducts();

    expect(result).toHaveLength(3);
    // Should be ordered by display_order descending: 3, 2, 1
    expect(result[0].name).toEqual('Product B'); // display_order: 3
    expect(result[1].name).toEqual('Product C'); // display_order: 2
    expect(result[2].name).toEqual('Product A'); // display_order: 1
  });

  it('should handle products with all optional fields', async () => {
    await db.insert(productsTable).values({
      name: 'Full Product',
      description: 'Product with all fields',
      price: '99.99',
      image_url: 'https://example.com/full.jpg',
      alt_image_url: 'https://example.com/full-alt.jpg',
      is_featured: true,
      stock_quantity: 100,
      material: 'Premium Leather',
      display_order: 5
    }).execute();

    const result = await getAllProducts();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Full Product');
    expect(result[0].description).toEqual('Product with all fields');
    expect(result[0].alt_image_url).toEqual('https://example.com/full-alt.jpg');
    expect(result[0].is_featured).toEqual(true);
    expect(result[0].material).toEqual('Premium Leather');
    expect(result[0].display_order).toEqual(5);
  });
});
