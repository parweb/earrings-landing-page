
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type GetFeaturedTestimonialsInput, type Testimonial } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getFeaturedTestimonials = async (input: GetFeaturedTestimonialsInput): Promise<Testimonial[]> => {
  try {
    const results = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.is_featured, true))
      .orderBy(asc(testimonialsTable.display_order))
      .limit(input.limit)
      .execute();

    return results;
  } catch (error) {
    console.error('Featured testimonials retrieval failed:', error);
    throw error;
  }
};
