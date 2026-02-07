"use client";

import { useState, useEffect } from "react";
import { Star, Send, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useLang } from "@/context/lang-context";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/utils/price";
import { showError, showSuccess } from "@/utils/toast";
import { reviewsService } from "@/services/supabase/reviews";
import { authService } from "@/services/supabase/auth";

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  created_at: string;
  user_name?: string;
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  productPrice: number;
}

const ProductReviews = ({ productId, productName, productPrice }: ProductReviewsProps) => {
  const { theme } = useTheme();
  const { lang } = useLang();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState<"helpful" | "newest">("newest");

  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: ""
  });

  useEffect(() => {
    fetchReviews();
  }, [productId, filterRating, sortBy, lang]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      const [reviewsData, statsData] = await Promise.all([
        reviewsService.getProductReviews(productId),
        reviewsService.getReviewStats(productId)
      ]);

      // Fetch user names for reviews (optional, depending on RLS setup)
      const reviewsWithNames = await Promise.all(reviewsData.map(async (review: any) => {
        // In a real app, we'd join this in the DB query, but for simplicity here:
        const { data: profile } = await authService.getUserProfile(review.user_id);
        return {
          ...review,
          user_name: profile?.name || "Anonymous User"
        } as Review;
      }));

      const filtered = filterRating > 0 
        ? reviewsWithNames.filter(r => r.rating === filterRating)
        : reviewsWithNames;

      const sorted = filtered.sort((a, b) => {
        if (sortBy === "helpful") {
          return b.helpful_count - a.helpful_count;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setReviews(sorted);
      setStats(statsData);

    } catch (err) {
      console.error("Error fetching reviews:", err);
      showError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showError(lang === "ar" ? "يرجى تسجيل الدخول" : "Please log in");
      return;
    }

    if (!formData.title.trim() || !formData.comment.trim() || formData.rating < 1) {
      showError(lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      
      await reviewsService.createReview({
        user_id: user.id,
        product_id: productId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
      });

      // Refresh reviews to include the new one
      await fetchReviews();
      
      setFormData({ rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
      showSuccess(lang === "ar" ? "شكراً على تقييمك!" : "Thank you for your review!");
    } catch (err) {
      console.error("Error submitting review:", err);
      showError(lang === "ar" ? "فشل إرسال التقييم" : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const RatingStars = ({ rating, size = "md", interactive = false, onChange }: any) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => interactive && onChange(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`transition-all ${interactive ? "cursor-pointer" : "cursor-default"}`}
          >
            <Star
              className={`${
                size === "lg" ? "h-8 w-8" : "h-5 w-5"
              } ${
                star <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Reviews Header */}
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold mb-6">
          {lang === "ar" ? "التقييمات والآراء" : "Reviews & Ratings"}
        </h2>

        {/* Rating Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-yellow-400">
                    {stats.average_rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {lang === "ar" ? "من 5" : "out of 5"}
                  </div>
                </div>
                <div className="flex-1">
                  <RatingStars rating={Math.round(stats.average_rating)} />
                  <p className="text-sm text-muted-foreground mt-2">
                    {stats.total_reviews} {lang === "ar" ? "تقييم" : "reviews"}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">
                    {rating} <Star className="h-3 w-3 inline fill-yellow-400 text-yellow-400" />
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full transition-all"
                      style={{
                        width: `${
                          stats.total_reviews > 0
                            ? (stats.rating_distribution[rating] / stats.total_reviews) * 100
                            : 0
                        }%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {stats.rating_distribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Write Review Button */}
        {user && !showReviewForm && (
          <Button
            onClick={() => setShowReviewForm(true)}
            className="mt-6 gap-2"
          >
            <Send className="h-4 w-4" />
            {lang === "ar" ? "اكتب تقييماً" : "Write a Review"}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold">
            {lang === "ar" ? "شارك رأيك" : "Share Your Review"}
          </h3>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {lang === "ar" ? "التقييم" : "Rating"}
              </label>
              <RatingStars
                rating={formData.rating}
                size="lg"
                interactive={true}
                onChange={(rating: number) =>
                  setFormData({ ...formData, rating })
                }
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {lang === "ar" ? "عنوان التقييم" : "Review Title"}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={lang === "ar" ? "مثلاً: منتج رائع جداً" : "e.g., Excellent product"}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {lang === "ar" ? "تعليقك" : "Your Comment"}
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder={lang === "ar" 
                  ? "شارك تفاصيل تجربتك مع هذا المنتج..."
                  : "Share details about your experience..."}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReviewForm(false)}
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="emoji-spin mr-2">⏳</span>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {lang === "ar" ? "إرسال التقييم" : "Submit Review"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      {stats && stats.total_reviews > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterRating === 0 ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(0)}
            >
              {lang === "ar" ? "الكل" : "All"}
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={filterRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRating(rating)}
              >
                {rating} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />
              </Button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "helpful" | "newest")}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="newest">
              {lang === "ar" ? "الأحدث أولاً" : "Newest First"}
            </option>
            <option value="helpful">
              {lang === "ar" ? "الأكثر فائدة" : "Most Helpful"}
            </option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card border border-border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between">
                <div>
                  <RatingStars rating={review.rating} />
                  <h4 className="font-bold text-lg mt-2">{review.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {review.user_name} • {new Date(review.created_at).toLocaleDateString(lang)}
                  </p>
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-sm leading-relaxed">{review.comment}</p>

              {/* Helpful Button */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => reviewsService.markReviewHelpful(review.id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {lang === "ar" ? "مفيد" : "Helpful"} ({review.helpful_count})
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-5xl emoji-bounce mb-4">📝</div>
          <p className="text-muted-foreground">
            {filterRating > 0
              ? (lang === "ar" 
                ? `لا توجد تقييمات بـ ${filterRating} نجوم"` 
                : `No ${filterRating}-star reviews`)
              : (lang === "ar" 
                ? "لا توجد تقييمات حتى الآن"
                : "No reviews yet")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;