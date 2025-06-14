import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';

const DishDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning } = useAlert();
  
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

  useEffect(() => {
    fetchDishDetails();
  }, [id]);

  const fetchDishDetails = async () => {
    try {
      setLoading(true);
      const [dishResponse, ratingsResponse] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/dishes/${id}/`),
        axios.get(`http://127.0.0.1:8000/api/dishes/${id}/ratings/`)
      ]);
      
      setDish(dishResponse.data);
      setRatings(ratingsResponse.data);
    } catch (error) {
      console.error('Error fetching dish details:', error);
      showError('Failed to load dish details. Please try again.', 'Loading Error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    try {
      addToCart(dish, quantity, specialInstructions);
      showSuccess(`${dish.name} (${quantity}x) has been added to your cart successfully.`, 'Added to Cart!');
    } catch (error) {
      showError('Failed to add item to cart. Please try again.', 'Cart Error');
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showWarning('Please login to submit a rating.', 'Login Required');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setSubmittingRating(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/ratings/', {
        dish_id: dish.id,
        rating: newRating.rating,
        comment: newRating.comment
      });
      
      setNewRating({ rating: 5, comment: '' });
      fetchDishDetails(); // Refresh to show new rating
      showSuccess('Your review has been submitted successfully. Thank you for your feedback!', 'Review Submitted!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      showError('Failed to submit rating. Please try again.', 'Submission Error');
    } finally {
      setSubmittingRating(false);
    }
  };



  const pageStyles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      background: '#f8f9fa',
      minHeight: '100vh'
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.8rem 1.5rem',
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#333',
      textDecoration: 'none',
      borderRadius: '12px',
      marginBottom: '2rem',
      transition: 'all 0.3s ease',
      border: '1px solid #ddd',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    mainCard: {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      marginBottom: '2rem'
    },
    imageSection: {
      position: 'relative',
      height: '500px',
      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    dishImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      transition: 'transform 0.3s ease'
    },
    imageOverlay: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
      padding: '2rem',
      color: 'white'
    },
    content: {
      padding: '2rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '2rem',
      alignItems: 'start'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#333'
    },
    price: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#ff6b35',
      background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem'
    },
    description: {
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#666',
      marginBottom: '2rem'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    detailCard: {
      background: '#f8f9fa',
      padding: '1.5rem',
      borderRadius: '12px',
      textAlign: 'center'
    },
    orderSection: {
      background: '#f8f9fa',
      padding: '2rem',
      borderRadius: '16px',
      position: 'sticky',
      top: '2rem'
    },
    quantityControl: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    quantityButton: {
      width: '40px',
      height: '40px',
      border: '2px solid #ff6b35',
      background: 'white',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      color: '#ff6b35'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '2px solid #dee2e6',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      minHeight: '80px',
      resize: 'vertical',
      fontSize: '14px'
    },
    addToCartButton: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #28a745, #20c997)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '1rem'
    },
    ratingsSection: {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
      padding: '2rem'
    },
    ratingForm: {
      background: '#f8f9fa',
      padding: '2rem',
      borderRadius: '12px',
      marginBottom: '2rem'
    },
    ratingStars: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    star: {
      fontSize: '1.5rem',
      cursor: 'pointer',
      transition: 'color 0.2s ease'
    },
    ratingCard: {
      background: '#f8f9fa',
      padding: '1.5rem',
      borderRadius: '12px',
      marginBottom: '1rem'
    },
    tag: {
      display: 'inline-block',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: '500',
      margin: '0.25rem'
    },
    vegetarianTag: {
      background: 'linear-gradient(135deg, #28a745, #20c997)'
    },
    spicyTag: {
      background: 'linear-gradient(135deg, #dc3545, #fd7e14)'
    }
  };

  if (loading) {
    return (
      <div style={{ ...pageStyles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍽️</div>
          <p>Loading dish details...</p>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div style={{ ...pageStyles.container, textAlign: 'center' }}>
        <h1>Dish not found</h1>
        <button onClick={() => navigate('/menu')} style={pageStyles.backButton}>
          ← Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div style={pageStyles.container}>
      <button 
        onClick={() => navigate('/menu')} 
        style={pageStyles.backButton}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        }}
      >
        ← Back to Menu
      </button>

      <div style={pageStyles.mainCard}>
        <div style={pageStyles.imageSection}>
          {dish.image && (
            <img 
              src={dish.image.startsWith('http') ? dish.image : `http://127.0.0.1:8000${dish.image}`}
              alt={dish.name}
              style={pageStyles.dishImage}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div style={pageStyles.imageOverlay}>
            <h1 style={{...pageStyles.title, color: 'white', marginBottom: '0.5rem'}}>{dish.name}</h1>
            <p style={{fontSize: '1.2rem', margin: 0}}>Category: {dish.category?.name}</p>
          </div>
        </div>

        <div style={pageStyles.content}>
          <div style={pageStyles.grid}>
            <div>
              <div style={pageStyles.price}>${dish.price}</div>
              
              <p style={pageStyles.description}>{dish.description}</p>

              <div style={pageStyles.detailsGrid}>
                <div style={pageStyles.detailCard}>
                  <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>⏱️</div>
                  <div style={{fontWeight: '600'}}>Prep Time</div>
                  <div>{dish.preparation_time} min</div>
                </div>
                
                {dish.calories && (
                  <div style={pageStyles.detailCard}>
                    <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🔥</div>
                    <div style={{fontWeight: '600'}}>Calories</div>
                    <div>{dish.calories} cal</div>
                  </div>
                )}

                {dish.average_rating > 0 && (
                  <div style={pageStyles.detailCard}>
                    <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>⭐</div>
                    <div style={{fontWeight: '600'}}>Rating</div>
                    <div>{dish.average_rating.toFixed(1)} stars</div>
                  </div>
                )}
              </div>

              <div style={{marginBottom: '1rem'}}>
                {dish.is_vegetarian && (
                  <span style={{...pageStyles.tag, ...pageStyles.vegetarianTag}}>
                    🌱 Vegetarian
                  </span>
                )}
                {dish.is_spicy && (
                  <span style={{...pageStyles.tag, ...pageStyles.spicyTag}}>
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

            <div style={pageStyles.orderSection}>
              <h3 style={{marginBottom: '1.5rem', textAlign: 'center'}}>Order This Dish</h3>
              
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                  Quantity:
                </label>
                <div style={pageStyles.quantityControl}>
                  <button 
                    style={pageStyles.quantityButton}
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  >
                    -
                  </button>
                  <span style={{fontSize: '1.2rem', fontWeight: '600', minWidth: '2rem', textAlign: 'center'}}>
                    {quantity}
                  </span>
                  <button 
                    style={pageStyles.quantityButton}
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                  Special Instructions:
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests..."
                  style={pageStyles.textarea}
                />
              </div>

              <div style={{fontSize: '1.3rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem'}}>
                Total: ${(dish.price * quantity).toFixed(2)}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!dish.is_available}
                style={{
                  ...pageStyles.addToCartButton,
                  opacity: dish.is_available ? 1 : 0.6,
                  cursor: dish.is_available ? 'pointer' : 'not-allowed'
                }}
              >
                {dish.is_available ? 'Add to Cart' : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      <div style={pageStyles.ratingsSection}>
        <h2 style={{marginBottom: '2rem'}}>Customer Reviews</h2>
        
        {isAuthenticated && (
          <form onSubmit={handleSubmitRating} style={pageStyles.ratingForm}>
            <h3 style={{marginBottom: '1rem'}}>Leave a Review</h3>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Rating:
              </label>
              <div style={pageStyles.ratingStars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    style={{
                      ...pageStyles.star,
                      color: star <= newRating.rating ? '#ffc107' : '#dee2e6'
                    }}
                    onClick={() => setNewRating({...newRating, rating: star})}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>

            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Comment:
              </label>
              <textarea
                value={newRating.comment}
                onChange={(e) => setNewRating({...newRating, comment: e.target.value})}
                placeholder="Share your experience..."
                style={pageStyles.textarea}
              />
            </div>

            <button
              type="submit"
              disabled={submittingRating}
              style={{
                ...pageStyles.addToCartButton,
                background: 'linear-gradient(135deg, #ff6b35, #f7931e)'
              }}
            >
              {submittingRating ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        <div>
          {ratings.length > 0 ? (
            ratings.map((rating, index) => (
              <div key={index} style={pageStyles.ratingCard}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                  <strong>{rating.customer?.user?.first_name} {rating.customer?.user?.last_name}</strong>
                  <div style={{color: '#ffc107'}}>
                    {'⭐'.repeat(rating.rating)}
                  </div>
                </div>
                {rating.comment && <p style={{margin: 0, color: '#666'}}>{rating.comment}</p>}
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