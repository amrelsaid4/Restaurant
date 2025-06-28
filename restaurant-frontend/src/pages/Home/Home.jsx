import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAlert } from '../../contexts/AlertContext';
import { useCart } from '../../contexts/CartContext';
import './Home.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess } = useAlert();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, dishesRes, infoRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/categories/'),
        axios.get('http://127.0.0.1:8000/api/dishes/'),
        axios.get('http://127.0.0.1:8000/api/restaurant-info/')
      ]);
      
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setFeaturedDishes((dishesRes.data.results || dishesRes.data).slice(0, 6));
      setRestaurantInfo(infoRes.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (dish) => {
    addToCart(dish);
    showSuccess(`${dish.name} added to cart!`, 'Cart Updated');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading delicious options...</p>
      </div>
    );
  }

  return (
    <div className="restaurant-app">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-image-container">
          <img 
            src={restaurantInfo?.hero_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'} 
            alt="Restaurant interior"
            className="hero-img"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1>{restaurantInfo?.name || 'Premium Dining'}</h1>
          <p className="hero-subtext">{restaurantInfo?.tagline || 'Exceptional culinary experiences'}</p>
          <Link to="/menu" className="main-cta">
            Explore Our Menu
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-container">
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon">🍽️</div>
              <h3>Fresh Ingredients</h3>
              <p>Locally sourced, always fresh</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">⏱️</div>
              <h3>Quick Service</h3>
              <p>Fast and efficient</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">👨‍🍳</div>
              <h3>Expert Chefs</h3>
              <p>Professional culinary team</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">⭐</div>
              <h3>Premium Quality</h3>
              <p>Uncompromising standards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Food Categories */}
      <section className="categories-section">
        <div className="section-container">
          <h2 className="section-title">Our Categories</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link 
                to={`/menu?category=${category.id}`} 
                key={category.id} 
                className="category-card"
              >
                <div className="category-img-container">
                  <img 
                    src={category.image || 'https://images.unsplash.com/photo-1544025162-d76694265947'} 
                    alt={category.name}
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947'}
                  />
                  <div className="category-overlay"></div>
                </div>
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="menu featured-section">
  <div className="container">
    <h1 className="section-title">Featured Dishes</h1>

    <div className="dishes-grid">
      {featuredDishes.map((dish) => (
        <div key={dish.id} className="dish-card">
          {dish.image && (
            <img 
              src={dish.image.startsWith('http') ? dish.image : `http://127.0.0.1:8000${dish.image}`} 
              alt={dish.name}
              className="dish-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-dish.jpg';
              }}
            />
          )}

          <div className="dish-info">
            <h3>{dish.name}</h3>
            <p className="dish-description">
              {dish.description || 'Delicious dish prepared with care'}
            </p>
            <div className="dish-details">
              <span className="price">${dish.price}</span>
              <span className="prep-time">⏱️ {dish.preparation_time} min</span>
              {dish.calories && <span className="calories">🔥 {dish.calories} cal</span>}
            </div>

            <div className="dish-tags">
              {dish.is_vegetarian && <span className="tag vegetarian">🌱 Vegetarian</span>}
              {dish.is_spicy && <span className="tag spicy">🌶️ Spicy</span>}
            </div>

            <div className="dish-actions">
              <Link to={`/dish/${dish.id}`} className="view-details-btn">
                View Details
              </Link>
              <button 
                onClick={() => handleAddToCart(dish)}
                className="add-to-cart-btn"
              >
                + Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="view-all-container">
      <Link to="/menu" className="view-all-btn">
        View Full Menu →
      </Link>
    </div>
  </div>
</section>


      {/* Restaurant Info */}
      <section className="info-section">
        <div className="section-container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-image">
                <img 
                  src={restaurantInfo?.interior_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'} 
                  alt="Restaurant interior"
                />
              </div>
              <div className="info-content">
                <h3>Our Atmosphere</h3>
                <p>Elegant dining experience with comfortable seating</p>
                <div className="contact-details">
                  <p><span>📍</span> {restaurantInfo?.address || '123 Main Street'}</p>
                  <p><span>📞</span> {restaurantInfo?.phone || '+1 234 567 8900'}</p>
                  <p><span>🕒</span> {restaurantInfo?.opening_time || '10:00 AM'} - {restaurantInfo?.closing_time || '10:00 PM'}</p>
                </div>
              </div>
            </div>
            <div className="info-card">
              <div className="info-image">
                <img 
                  src={restaurantInfo?.chef_image || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c'} 
                  alt="Our chef"
                />
              </div>
              <div className="info-content">
                <h3>Our Kitchen</h3>
                <p>Professional chefs creating culinary masterpieces</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;