import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Modal from '../components/Modal';
import './Menu.css';

const Menu = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const selectedCategory = searchParams.get('category');
  const vegetarianFilter = searchParams.get('vegetarian');
  const spicyFilter = searchParams.get('spicy');

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (vegetarianFilter) params.append('vegetarian', vegetarianFilter);
      if (spicyFilter) params.append('spicy', spicyFilter);

      const [dishesResponse, categoriesResponse] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/dishes/?${params.toString()}`),
        axios.get('http://127.0.0.1:8000/api/categories/')
      ]);

      setDishes(dishesResponse.data.results || dishesResponse.data);
      setCategories(categoriesResponse.data.results || categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching menu data:', error);
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load menu. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    
    setSearchParams(newParams);
  };

  const handleAddToCart = (dish) => {
    try {
      addToCart(dish, 1);
      setModalState({
        isOpen: true,
        title: 'Added to Cart!',
        message: `${dish.name} has been added to your cart successfully.`,
        type: 'success'
      });
    } catch (error) {
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to add item to cart. Please try again.',
        type: 'error'
      });
    }
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  if (loading) {
    return <div className="loading">🍽️ Loading menu...</div>;
  }

  return (
    <div className="menu">
      <div className="container">
        <h1>Our Menu</h1>
        
        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={vegetarianFilter === 'true'}
                onChange={(e) => 
                  handleFilterChange('vegetarian', e.target.checked ? 'true' : '')
                }
              />
              Vegetarian Only
            </label>
          </div>

          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={spicyFilter === 'true'}
                onChange={(e) => 
                  handleFilterChange('spicy', e.target.checked ? 'true' : '')
                }
              />
              Spicy Only
            </label>
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="dishes-grid">
          {dishes.length > 0 ? (
            dishes.map(dish => (
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
                  <p className="category-name">Category: {dish.category?.name}</p>
                  
                  <div className="dish-details">
                    <span className="price">${dish.price}</span>
                    <span className="prep-time">⏱️ {dish.preparation_time} min</span>
                    {dish.calories && (
                      <span className="calories">🔥 {dish.calories} cal</span>
                    )}
                  </div>

                  <div className="dish-tags">
                    {dish.is_vegetarian && <span className="tag vegetarian">🌱 Vegetarian</span>}
                    {dish.is_spicy && <span className="tag spicy">🌶️ Spicy</span>}
                  </div>

                  {dish.average_rating > 0 && (
                    <div className="rating">
                      ⭐ {dish.average_rating.toFixed(1)} stars
                    </div>
                  )}

                  <div className="dish-actions">
                    <Link to={`/dish/${dish.id}`} className="view-details-btn">
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleAddToCart(dish)}
                      className="add-to-cart-btn"
                      disabled={!dish.is_available}
                    >
                      {dish.is_available ? 'Add to Cart' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-dishes">
              <p>No dishes match your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};

export default Menu; 