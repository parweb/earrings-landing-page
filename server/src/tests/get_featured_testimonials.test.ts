
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type GetFeaturedTestimonialsInput } from '../schema';
import { getFeaturedTestimonials } from '../handlers/get_featured_testimonials';

// Test input with default
const testInput: GetFeaturedTestimonialsInput = {
  limit: 6
};

describe('getFeaturedTestimonials', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return featured testimonials ordered by display_order', async () => {
    // Create test testimonials
    await db.insert(testimonialsTable).values([
      {
        customer_name: 'John Doe',
        review_text: 'Great product!',
        rating: 5,
        is_featured: true,
        display_order: 2
      },
      {
        customer_name: 'Jane Smith',
        review_text: 'Amazing quality!',
        rating: 5,
        is_featured: true,
        display_order: 1
      },
      {
        customer_name: 'Bob Wilson',
        review_text: 'Not featured',
        rating: 4,
        is_featured: false,
        display_order: 0
      }
    ]).execute();

    const results = await getFeaturedTestimonials(testInput);

    // Should return only featured testimonials
    expect(results).toHaveLength(2);
    
    // Should be ordered by display_order ascending
    expect(results[0].customer_name).toEqual('Jane Smith');
    expect(results[0].display_order).toEqual(1);
    expect(results[1].customer_name).toEqual('John Doe');
    expect(results[1].display_order).toEqual(2);

    // Should not include non-featured testimonials
    const nonFeaturedExists = results.some(t => t.customer_name === 'Bob Wilson');
    expect(nonFeaturedExists).toBe(false);
  });

  it('should respect the limit parameter', async () => {
    // Create more testimonials than the limit
    const testimonials = Array.from({ length: 10 }, (_, i) => ({
      customer_name: `Customer ${i + 1}`,
      review_text: `Review ${i + 1}`,
      rating: 5,
      is_featured: true,
      display_order: i
    }));

    await db.insert(testimonialsTable).values(testimonials).execute();

    const limitedInput: GetFeaturedTestimonialsInput = { limit: 3 };
    const results = await getFeaturedTestimonials(limitedInput);

    expect(results).toHaveLength(3);
    
    // Should return first 3 based on display_order
    expect(results[0].customer_name).toEqual('Customer 1');
    expect(results[1].customer_name).toEqual('Customer 2');
    expect(results[2].customer_name).toEqual('Customer 3');
  });

  it('should return empty array when no featured testimonials exist', async () => {
    // Create only non-featured testimonials
    await db.insert(testimonialsTable).values([
      {
        customer_name: 'John Doe',
        review_text: 'Not featured',
        rating: 4,
        is_featured: false,
        display_order: 0
      }
    ]).execute();

    const results = await getFeaturedTestimonials(testInput);

    expect(results).toHaveLength(0);
  });

  it('should include all testimonial fields', async () => {
    await db.insert(testimonialsTable).values([
      {
        customer_name: 'Test Customer',
        review_text: 'Excellent product with great quality!',
        rating: 5,
        is_featured: true,
        display_order: 1
      }
    ]).execute();

    const results = await getFeaturedTestimonials(testInput);

    expect(results).toHaveLength(1);
    const testimonial = results[0];
    
    expect(testimonial.id).toBeDefined();
    expect(testimonial.customer_name).toEqual('Test Customer');
    expect(testimonial.review_text).toEqual('Excellent product with great quality!');
    expect(testimonial.rating).toEqual(5);
    expect(testimonial.is_featured).toBe(true);
    expect(testimonial.display_order).toEqual(1);
    expect(testimonial.created_at).toBeInstanceOf(Date);
  });
});
