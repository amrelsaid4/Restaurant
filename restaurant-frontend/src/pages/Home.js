import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [menuData, setMenuData] = useState(null);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuResponse, restaurantResponse] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/menu-overview/'),
        axios.get('http://127.0.0.1:8000/api/restaurant-info/')
      ]);
      
      setMenuData(menuResponse.data);
      setRestaurantInfo(restaurantResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">🍽️ Loading...</div>;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to {restaurantInfo?.name || 'Our Restaurant'}</h1>
          <p>Delicious food delivered to your doorstep</p>
          <Link to="/menu" className="cta-button">
            Browse Menu
          </Link>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* Categories Section */}
      {menuData?.categories && menuData.categories.length > 0 && (
        <section className="categories">
          <div className="container">
            <h2>Food Categories</h2>
            <div className="categories-grid">
              {menuData.categories.map(category => (
                <Link
                  key={category.id}
                  to={`/menu?category=${category.id}`}
                  className="category-card"
                >
                  {category.image && (
                    <img 
                      src={category.image.startsWith('http') ? category.image : `http://127.0.0.1:8000${category.image}`} 
                      alt={category.name}
                      className="category-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-category.jpg';
                      }}
                    />
                  )}
                  <div className="category-content">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Dishes */}
      {menuData?.featured_dishes && menuData.featured_dishes.length > 0 && (
        <section className="featured-dishes">
          <div className="container">
            <h2>Featured Dishes</h2>
            <div className="dishes-grid">
              {menuData.featured_dishes.map(dish => (
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
                    <p className="dish-description">{dish.description}</p>
                    <div className="dish-details">
                      <span className="price">${dish.price}</span>
                      <span className="prep-time">⏱️ {dish.preparation_time} min</span>
                    </div>
                    <div className="dish-tags">
                      {dish.is_vegetarian && <span className="tag vegetarian">🌱 Vegetarian</span>}
                      {dish.is_spicy && <span className="tag spicy">🌶️ Spicy</span>}
                    </div>
                    <Link to={`/dish/${dish.id}`} className="view-dish-btn">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Restaurant Info */}
      {restaurantInfo && (
        <section className="restaurant-info">
          <div className="container">
            <h2>Restaurant Information</h2>
            <div className="info-content">
              <p>{restaurantInfo.description || 'Welcome to our restaurant!'}</p>
              <div className="contact-info">
                <div className="info-item">
                  <span className="icon">📍</span>
                  <span>{restaurantInfo.address}</span>
                </div>
                <div className="info-item">
                  <span className="icon">📞</span>
                  <span>{restaurantInfo.phone}</span>
                </div>
                <div className="info-item">
                  <span className="icon">📧</span>
                  <span>{restaurantInfo.email}</span>
                </div>
                <div className="info-item">
                  <span className="icon">🕒</span>
                  <span>Hours: {restaurantInfo.opening_time} - {restaurantInfo.closing_time}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home; 