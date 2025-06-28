import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { apiService, submitRating, updateRating } from '@/services/api';
import './DishDetail.css';

const DishDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning } = useAlert();
  
  // Refs for autofocus
  const commentRef = useRef(null);
  const instructionsRef = useRef(null);
  
  const [dish, setDish] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [newRating, setNewRating] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingRating, setSubmittingRating] = useState(false);
  const [editingRating, setEditingRating] = useState(null);

  // Memoized fetch function for better performance
  const fetchDishDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [dishData, ratingsData] = await Promise.all([
        apiService(`dishes/${id}/`),
        apiService(`dishes/${id}/ratings/`)
      ]);
      
      setDish(dishData);
      setRatings(ratingsData);
    } catch (error) {
      showError('Failed to load dish details. Please try again.', 'Loading Error');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchDishDetails();
  }, [fetchDishDetails]);

  // Check if current user already rated this dish (we need to get current user info)
  // For now, we'll use a simple approach - checking for existing rating will be handled by backend
  
  // Remove pre-fill logic for now - backend will handle update vs create

  const handleAddToCart = useCallback(() => {
    try {
      addToCart(dish, quantity, specialInstructions);
      showSuccess(`${dish.name} (${quantity}x) has been added to your cart successfully.`, 'Added to Cart!');
    } catch (error) {
      showError('Failed to add item to cart. Please try again.', 'Cart Error');
    }
  }, [addToCart, dish, quantity, specialInstructions, showSuccess, showError]);

  const handleSubmitRating = useCallback(async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showWarning('Please login to submit a rating.', 'Login Required');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setSubmittingRating(true);
    try {
      if (editingRating) {
        // Update existing rating
        await updateRating(editingRating.id, {
          rating: newRating.rating,
          comment: newRating.comment
        });
        showSuccess('Your review has been updated successfully!', 'Review Updated!');
        setEditingRating(null);
      } else {
        // Create new rating
        await submitRating({
          dish_id: dish.id,
          rating: newRating.rating,
          comment: newRating.comment
        });
        showSuccess('Your review has been submitted successfully. Thank you for your feedback!', 'Review Submitted!');
      }
      
      setNewRating({ rating: 5, comment: '' });
      await fetchDishDetails(); // Refresh to show updated ratings
    } catch (error) {
      showError('Failed to submit rating. Please try again.', 'Submission Error');
    } finally {
      setSubmittingRating(false);
    }
  }, [isAuthenticated, dish?.id, newRating, fetchDishDetails, showWarning, showSuccess, showError, navigate]);

  const handleEditRating = useCallback((rating) => {
    setEditingRating(rating);
    setNewRating({
      rating: rating.rating,
      comment: rating.comment || ''
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingRating(null);
    setNewRating({ rating: 5, comment: '' });
  }, []);

  if (loading) {
    return (
      <div className="dish-detail-container dish-detail-loading">
        <div>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍽️</div>
          <p>Loading dish details...</p>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="dish-detail-container dish-detail-not-found">
        <h1>Dish not found</h1>
        <button onClick={() => navigate('/menu')} className="dish-detail-back-button">
          ← Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="dish-detail-container">
      <button 
        onClick={() => navigate('/menu')} 
        className="dish-detail-back-button"
      >
        ← Back to Menu
      </button>

      <div className="dish-detail-main-card">
        <div className="dish-detail-image-section">
          {dish.image && (
            <img 
              src={dish.image.startsWith('http') ? dish.image : `http://127.0.0.1:8000${dish.image}`}
              alt={dish.name}
              className="dish-detail-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="dish-detail-image-overlay">
            <h1 className="dish-detail-title" style={{color: 'white', marginBottom: '0.5rem'}}>{dish.name}</h1>
            <p style={{fontSize: '1.2rem', margin: 0}}>Category: {dish.category?.name}</p>
          </div>
        </div>

        <div className="dish-detail-content">
          <div className="dish-detail-grid">
            <div>
              <div className="dish-detail-price">${dish.price}</div>
              
              <p className="dish-detail-description">{dish.description}</p>

              <div className="dish-detail-details-grid">
                <div className="dish-detail-card">
                  <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>⏱️</div>
                  <div style={{fontWeight: '600'}}>Prep Time</div>
                  <div>{dish.preparation_time} min</div>
                </div>
                
                {dish.calories && (
                  <div className="dish-detail-card">
                    <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🔥</div>
                    <div style={{fontWeight: '600'}}>Calories</div>
                    <div>{dish.calories} cal</div>
                  </div>
                )}

                {dish.average_rating > 0 && (
                  <div className="dish-detail-card">
                    <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>⭐</div>
                    <div style={{fontWeight: '600'}}>Rating</div>
                    <div>{dish.average_rating.toFixed(1)} stars</div>
                  </div>
                )}
              </div>

              <div style={{marginBottom: '1rem'}}>
                {dish.is_vegetarian && (
                  <span className="dish-detail-tag dish-detail-tag--vegetarian">
                    🌱 Vegetarian
                  </span>
                )}
                {dish.is_spicy && (
                  <span className="dish-detail-tag dish-detail-tag--spicy">
                    🌶️ Spicy
                  </span>
                )}
              </div>

              {dish.ingredients && (
                <div>
                  <h3 style={{marginBottom: '1rem'}}>Ingredients</h3>
                  <p style={{color: '#666', lineHeight: '1.6'}}>{dish.ingredients}</p>
                </div>
              )}
            </div>

            <div className="dish-detail-order-section">
              <h3 style={{marginBottom: '1.5rem', textAlign: 'center'}}>Order This Dish</h3>
              
              <div style={{marginBottom: '1rem'}}>
                <label className="dish-detail-label">Quantity:</label>
                <div className="dish-detail-quantity-control">
                  <button 
                    className="dish-detail-quantity-button"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  >
                    -
                  </button>
                  <span className="dish-detail-quantity-display">
                    {quantity}
                  </span>
                  <button 
                    className="dish-detail-quantity-button"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{marginBottom: '1.5rem'}}>
                <label className="dish-detail-label">Special Instructions:</label>
                <textarea
                  ref={instructionsRef}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests..."
                  className="dish-detail-textarea"
                />
              </div>

              <div className="dish-detail-total">
                Total: ${(dish.price * quantity).toFixed(2)}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!dish.is_available}
                className={`dish-detail-button dish-detail-button--cart ${!dish.is_available ? 'dish-detail-button--disabled' : ''}`}
              >
                {dish.is_available ? 'Add to Cart' : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      <div className="dish-detail-ratings-section">
        <h2 style={{marginBottom: '2rem'}}>Customer Reviews</h2>
        
        {isAuthenticated && (
          <form onSubmit={handleSubmitRating} className="dish-detail-rating-form">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>
                {editingRating ? 'Edit Your Review' : 'Leave a Review'}
              </h3>
              {editingRating && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
            
            <div style={{marginBottom: '1rem'}}>
              <label className="dish-detail-label">Rating:</label>
              <div className="dish-detail-rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`dish-detail-star ${star <= newRating.rating ? 'dish-detail-star--active' : 'dish-detail-star--inactive'}`}
                    onClick={() => setNewRating({...newRating, rating: star})}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '1rem', fontWeight: '600', color: '#ff6b35' }}>
                {newRating.rating === 1 && '⭐ 1 Star - Poor'}
                {newRating.rating === 2 && '⭐⭐ 2 Stars - Fair'}
                {newRating.rating === 3 && '⭐⭐⭐ 3 Stars - Good'}
                {newRating.rating === 4 && '⭐⭐⭐⭐ 4 Stars - Excellent'}
                {newRating.rating === 5 && '⭐⭐⭐⭐⭐ 5 Stars - Amazing!'}
              </div>
            </div>

            <div style={{marginBottom: '1rem'}}>
              <label className="dish-detail-label">Comment:</label>
              <textarea
                ref={commentRef}
                value={newRating.comment}
                onChange={(e) => setNewRating({...newRating, comment: e.target.value})}
                placeholder="Share your experience..."
                className="dish-detail-textarea"
                autoFocus={isAuthenticated}
              />
            </div>

            <button
              type="submit"
              disabled={submittingRating}
              className="dish-detail-button dish-detail-button--review"
            >
              {submittingRating ? 'Submitting...' : (editingRating ? 'Update Review' : 'Submit Review')}
            </button>
          </form>
        )}

        <div>
          {ratings.length > 0 ? (
            ratings.map((rating, index) => (
              <div key={index} className="dish-detail-rating-card">
                <div className="dish-detail-rating-header">
                  <div>
                    <strong>{rating.customer?.user?.first_name} {rating.customer?.user?.last_name}</strong>
                    <div style={{color: '#ffc107', marginTop: '4px'}}>
                      {'⭐'.repeat(rating.rating)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditRating(rating)}
                    style={{
                      background: '#ff6b35',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#e55a2b'}
                    onMouseOut={(e) => e.target.style.background = '#ff6b35'}
                  >
                    Edit
                  </button>
                </div>
                {rating.comment && <p style={{margin: '8px 0 0 0', color: '#666'}}>{rating.comment}</p>}
              </div>
            ))
          ) : (
            <p style={{textAlign: 'center', color: '#666', padding: '2rem'}}>
              No reviews yet. Be the first to review this dish!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishDetail;