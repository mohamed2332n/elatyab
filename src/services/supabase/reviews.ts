import { supabase } from '@/config/supabase';

interface Review {
  id?: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all reviews for a product with pagination
 */
export const reviewsService = {
  async getProductReviews(
    productId: string,
    limit: number = 10,
    offset: number = 0
  ) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching reviews:", err);
      throw err;
    }
  },

  /**
   * Get review statistics for a product
   */
  async getReviewStats(productId: string) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", productId);

      if (error) throw error;

      const reviews = data || [];
      if (reviews.length === 0) {
        return {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      reviews.forEach((r: any) => {
        distribution[r.rating]++;
      });

      return {
        average_rating: avgRating,
        total_reviews: reviews.length,
        rating_distribution: distribution
      };
    } catch (err) {
      console.error("Error fetching review stats:", err);
      throw err;
    }
  },

  /**
   * Create a new review
   */
  async createReview(review: Review) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            user_id: review.user_id,
            product_id: review.product_id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            helpful_count: 0,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error creating review:", err);
      throw err;
    }
  },

  /**
   * Update a review (only by the review author)
   */
  async updateReview(reviewId: string, updates: Partial<Review>) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error updating review:", err);
      throw err;
    }
  },

  /**
   * Delete a review (only by the review author)
   */
  async deleteReview(reviewId: string) {
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
    } catch (err) {
      console.error("Error deleting review:", err);
      throw err;
    }
  },

  /**
   * Mark a review as helpful
   */
  async markReviewHelpful(reviewId: string) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .update({
          helpful_count: supabase.rpc('increment_helpful', { row_id: reviewId })
        })
        .eq("id", reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error marking review helpful:", err);
      throw err;
    }
  },

  /**
   * Get user's reviews
   */
  async getUserReviews(userId: string) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching user reviews:", err);
      throw err;
    }
  },

  /**
   * Check if user has reviewed a product
   */
  async hasUserReviewedProduct(userId: string, productId: string) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
      return !!data;
    } catch (err) {
      console.error("Error checking user review:", err);
      throw err;
    }
  }
};
