import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import toast from 'react-hot-toast';
import { menuAPI, ratingsAPI } from '@/services/api';

const DishDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showAlert, showSuccess, showError } = useAlert();

  // States
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Refs
  const instructionsRef = useRef(null);
  const commentRef = useRef(null);

  // Fetch dish details
  const fetchDishDetails = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch dish and reviews in parallel
      const [dishData, reviewsData] = await Promise.all([
        menuAPI.getDish(id),
        menuAPI.getDishRatings(id)
      ]);
      setDish(dishData);
      setReviews(reviewsData || []);
    } catch (err) {
      setError(err);
      showError('Failed to load dish details.');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchDishDetails();
  }, [fetchDishDetails]);

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    try {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          specialInstructions: specialInstructions.trim() || null
        });
      }
      toast.success(`${dish.name} x${quantity} added to cart! 🛒`);
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  }, [addToCart, dish, quantity, specialInstructions]);

  // Handle review submission
  const handleSubmitReview = useCallback(async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showError('You must be logged in to write a review.', 'Login Required');
      return;
    }
    setSubmittingReview(true);
    try {
      const reviewData = {
        dish_id: id,
        rating: newReview.rating,
        comment: newReview.comment,
      };
      const createdReview = await ratingsAPI.submitRating(reviewData);
      setReviews([createdReview, ...reviews]);
      showSuccess('Thank you for your review!', 'Review Submitted');
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        showError('Your session has expired. Please log in again to submit a review.', 'Authentication Error');
      } else {
        showError('Failed to submit review. Please try again.', 'Submission Failed');
      }
    } finally {
      setSubmittingReview(false);
    }
  }, [id, isAuthenticated, newReview, reviews, showError, showSuccess]);

  // Render stars utility function
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">⭐</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">🌟</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">⭐</span>);
    }

    return stars;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading dish details...</h2>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !dish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dish not found</h2>
          <p className="text-gray-600 mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <motion.button
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            onClick={() => navigate('/menu')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Menu
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const dishImages = dish.images && dish.images.length > 0 ? dish.images : [dish.image].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <motion.div 
        className="bg-white border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <motion.button
              className="hover:text-orange-600 transition-colors"
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
            >
              🏠 Home
            </motion.button>
            <span>→</span>
            <motion.button
              className="hover:text-orange-600 transition-colors"
              onClick={() => navigate('/menu')}
              whileHover={{ scale: 1.05 }}
            >
              📋 Menu
            </motion.button>
            <span>→</span>
            <span className="text-orange-600 font-medium">{dish.name}</span>
          </nav>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Dish Image */}
            <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="relative">
                <img 
                  src={dish.image && dish.image.startsWith('http') 
                    ? dish.image 
                    : dish.image 
                    ? `http://127.0.0.1:8000${dish.image}` 
                    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                  }
                    alt={dish.name}
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                    onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                  ${parseFloat(dish.price).toFixed(2)}
                </div>
                
                {/* Availability Badge */}
                {dish.is_available === false && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full font-medium text-sm">
                    Unavailable
                  </div>
                )}
              </div>
            </div>
            </motion.div>

          {/* Details Section */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{dish.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {renderStars(dish.average_rating || 0)}
                  <span className="ml-2 text-gray-600">
                    ({dish.rating_count || reviews.length || 0} reviews)
                  </span>
                </div>
                {dish.category && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {dish.category.name}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-orange-600">
              ${parseFloat(dish.price).toFixed(2)}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{dish.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {dish.is_vegetarian && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  🌱 Vegetarian
                </span>
              )}
              {dish.is_spicy && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  🌶️ Spicy
                </span>
              )}
              {dish.preparation_time && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  ⏱️ {dish.preparation_time} min
                </span>
              )}
              {dish.calories && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  🔥 {dish.calories} cal
                </span>
              )}
            </div>

            {/* Ingredients */}
            {dish.ingredients && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingredients</h3>
                <p className="text-gray-600">{dish.ingredients}</p>
              </div>
            )}

            {/* Order Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
              
              {/* Quantity */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center space-x-3">
                  <motion.button
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    -
                  </motion.button>
                  <span className="font-semibold text-xl text-gray-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <motion.button
                    className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.button>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  ref={instructionsRef}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  rows={3}
                  placeholder="Any special requests for this dish..."
                />
              </div>

              {/* Total and Add to Cart */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">Total:</span>
                <span className="text-2xl font-bold text-orange-600">
                  ${(parseFloat(dish.price) * quantity).toFixed(2)}
                </span>
              </div>

              <motion.button
                className={`w-full py-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                  dish.is_available !== false
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700'
                    : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                }`}
                onClick={handleAddToCart}
                disabled={dish.is_available === false}
                whileHover={dish.is_available !== false ? { scale: 1.02 } : {}}
                whileTap={dish.is_available !== false ? { scale: 0.98 } : {}}
              >
                {dish.is_available !== false ? '🛒 Add to Cart' : 'Currently Unavailable'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div 
          className="mt-12 bg-white rounded-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            {isAuthenticated && (
              <motion.button
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                onClick={() => setShowReviewForm(!showReviewForm)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showReviewForm ? '❌ Cancel' : '✏️ Write Review'}
              </motion.button>
            )}
          </div>

          {/* Review Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.form
                className="mb-8 p-6 bg-gray-50 rounded-lg"
                onSubmit={handleSubmitReview}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        className={`text-2xl ${
                          star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        onClick={() => setNewReview({...newReview, rating: star})}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        ⭐
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {newReview.rating === 1 && '⭐ Poor'}
                    {newReview.rating === 2 && '⭐⭐ Fair'}
                    {newReview.rating === 3 && '⭐⭐⭐ Good'}
                    {newReview.rating === 4 && '⭐⭐⭐⭐ Very Good'}
                    {newReview.rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                  <textarea
                    ref={commentRef}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    rows={3}
                    placeholder="Share your experience with this dish..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <motion.button
                    type="submit"
                    disabled={submittingReview}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      submittingReview
                        ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                    whileHover={!submittingReview ? { scale: 1.05 } : {}}
                    whileTap={!submittingReview ? { scale: 0.95 } : {}}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    onClick={() => setShowReviewForm(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <motion.div
                  key={review.id || index}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-medium">
                          {review.user_name ? review.user_name.charAt(0).toUpperCase() : review.customer?.user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {review.user_name || `${review.customer?.user?.first_name || 'Anonymous'} ${review.customer?.user?.last_name || ''}`}
                        </div>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
                <p className="text-gray-500">
                  Be the first to review this delicious dish!
                </p>
                {!isAuthenticated && (
                  <motion.button
                    className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login to Write Review
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DishDetail;