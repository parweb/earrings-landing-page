
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { collectionsTable } from '../db/schema';
import { type GetFeaturedCollectionsInput } from '../schema';
import { getFeaturedCollections } from '../handlers/get_featured_collections';

describe('getFeaturedCollections', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return featured collections ordered by display_order desc', async () => {
    // Create test collections with different display orders
    await db.insert(collectionsTable).values([
      {
        name: 'Featured Collection 1',
        description: 'First featured collection',
        image_url: 'https://example.com/image1.jpg',
        is_featured: true,
        display_order: 10
      },
      {
        name: 'Featured Collection 2',
        description: 'Second featured collection',
        image_url: 'https://example.com/image2.jpg',
        is_featured: true,
        display_order: 20
      },
      {
        name: 'Non-Featured Collection',
        description: 'Not featured',
        image_url: 'https://example.com/image3.jpg',
        is_featured: false,
        display_order: 30
      }
    ]).execute();

    const input: GetFeaturedCollectionsInput = { limit: 4 };
    const result = await getFeaturedCollections(input);

    // Should only return featured collections
    expect(result).toHaveLength(2);
    
    // Should be ordered by display_order descending
    expect(result[0].name).toEqual('Featured Collection 2');
    expect(result[0].display_order).toEqual(20);
    expect(result[1].name).toEqual('Featured Collection 1');
    expect(result[1].display_order).toEqual(10);

    // Verify all returned collections are featured
    result.forEach(collection => {
      expect(collection.is_featured).toBe(true);
      expect(collection.id).toBeDefined();
      expect(collection.created_at).toBeInstanceOf(Date);
    });
  });

  it('should respect the limit parameter', async () => {
    // Create more featured collections than the limit
    await db.insert(collectionsTable).values([
      {
        name: 'Collection 1',
        description: 'Description 1',
        image_url: 'https://example.com/image1.jpg',
        is_featured: true,
        display_order: 10
      },
      {
        name: 'Collection 2',
        description: 'Description 2',
        image_url: 'https://example.com/image2.jpg',
        is_featured: true,
        display_order: 20
      },
      {
        name: 'Collection 3',
        description: 'Description 3',
        image_url: 'https://example.com/image3.jpg',
        is_featured: true,
        display_order: 30
      }
    ]).execute();

    const input: GetFeaturedCollectionsInput = { limit: 2 };
    const result = await getFeaturedCollections(input);

    expect(result).toHaveLength(2);
    // Should return the highest display_order collections first
    expect(result[0].display_order).toEqual(30);
    expect(result[1].display_order).toEqual(20);
  });

  it('should return empty array when no featured collections exist', async () => {
    // Create only non-featured collections
    await db.insert(collectionsTable).values([
      {
        name: 'Non-Featured Collection 1',
        description: 'Not featured',
        image_url: 'https://example.com/image1.jpg',
        is_featured: false,
        display_order: 10
      },
      {
        name: 'Non-Featured Collection 2',
        description: 'Also not featured',
        image_url: 'https://example.com/image2.jpg',
        is_featured: false,
        display_order: 20
      }
    ]).execute();

    const input: GetFeaturedCollectionsInput = { limit: 4 };
    const result = await getFeaturedCollections(input);

    expect(result).toHaveLength(0);
  });

  it('should handle collections with null descriptions', async () => {
    await db.insert(collectionsTable).values([
      {
        name: 'Collection with null description',
        description: null,
        image_url: 'https://example.com/image1.jpg',
        is_featured: true,
        display_order: 5
      }
    ]).execute();

    const input: GetFeaturedCollectionsInput = { limit: 4 };
    const result = await getFeaturedCollections(input);

    expect(result).toHaveLength(1);
    expect(result[0].description).toBeNull();
    expect(result[0].name).toEqual('Collection with null description');
  });
});
