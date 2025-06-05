
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { collectionsTable } from '../db/schema';
import { getAllCollections } from '../handlers/get_all_collections';

describe('getAllCollections', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no collections exist', async () => {
    const result = await getAllCollections();
    
    expect(result).toEqual([]);
  });

  it('should return all collections', async () => {
    // Insert test collections
    await db.insert(collectionsTable).values([
      {
        name: 'Collection A',
        description: 'First collection',
        image_url: 'https://example.com/image1.jpg',
        is_featured: true,
        display_order: 2
      },
      {
        name: 'Collection B',
        description: 'Second collection',
        image_url: 'https://example.com/image2.jpg',
        is_featured: false,
        display_order: 1
      }
    ]).execute();

    const result = await getAllCollections();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('Collection B'); // Should be first due to display_order 1
    expect(result[1].name).toEqual('Collection A'); // Should be second due to display_order 2
  });

  it('should return collections ordered by display_order then name', async () => {
    // Insert collections with same display_order but different names
    await db.insert(collectionsTable).values([
      {
        name: 'Z Collection',
        description: 'Last alphabetically',
        image_url: 'https://example.com/image1.jpg',
        is_featured: false,
        display_order: 1
      },
      {
        name: 'A Collection',
        description: 'First alphabetically',
        image_url: 'https://example.com/image2.jpg',
        is_featured: true,
        display_order: 1
      },
      {
        name: 'B Collection',
        description: 'Middle collection',
        image_url: 'https://example.com/image3.jpg',
        is_featured: false,
        display_order: 0
      }
    ]).execute();

    const result = await getAllCollections();

    expect(result).toHaveLength(3);
    // First by display_order (0 comes first)
    expect(result[0].name).toEqual('B Collection');
    // Then by name within same display_order (A comes before Z)
    expect(result[1].name).toEqual('A Collection');
    expect(result[2].name).toEqual('Z Collection');
  });

  it('should include all collection fields', async () => {
    await db.insert(collectionsTable).values({
      name: 'Test Collection',
      description: 'Test description',
      image_url: 'https://example.com/test.jpg',
      is_featured: true,
      display_order: 5
    }).execute();

    const result = await getAllCollections();

    expect(result).toHaveLength(1);
    const collection = result[0];
    
    expect(collection.id).toBeDefined();
    expect(collection.name).toEqual('Test Collection');
    expect(collection.description).toEqual('Test description');
    expect(collection.image_url).toEqual('https://example.com/test.jpg');
    expect(collection.is_featured).toEqual(true);
    expect(collection.display_order).toEqual(5);
    expect(collection.created_at).toBeInstanceOf(Date);
  });
});
