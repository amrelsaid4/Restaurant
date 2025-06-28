import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '@/contexts/CartContext';
import { useAlert } from '@/contexts/AlertContext';
import './Menu.css';

// Fixed Modal import issue - using AlertContext instead

// 🚀 Memoized Dish Card Component for better performance
const DishCard = memo(({ dish, onAddToCart }) => {
  const handleAddToCart = useCallback(() => {
    onAddToCart(dish);
  }, [dish, onAddToCart]);

  return (
    <div className="dish-card">
      {dish.image && (
        <div className="dish-image-container">
          <img 
            src={dish.image.startsWith('http') ? dish.image : `http://127.0.0.1:8000${dish.image}`} 
            alt={dish.name}
            className="dish-image"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-dish.jpg';
            }}
          />
          {!dish.is_available && <div className="unavailable-overlay">Unavailable</div>}
        </div>
      )}
      <div className="dish-info">
        <h3>{dish.name}</h3>
        <p className="dish-description">{dish.description}</p>
        <p className="category-name">{dish.category?.name}</p>
        
        <div className="dish-details">
          <span className="price">${dish.price}</span>
          <div className="dish-meta">
            <span className="prep-time">⏱️ {dish.preparation_time}min</span>
            {dish.calories && (
              <span className="calories">🔥 {dish.calories}cal</span>
            )}
          </div>
        </div>

        <div className="dish-tags">
          {dish.is_vegetarian && <span className="tag vegetarian">🌱 Vegetarian</span>}
          {dish.is_spicy && <span className="tag spicy">🌶️ Spicy</span>}
        </div>

        {dish.average_rating > 0 && (
          <div className="rating">
            ⭐ {dish.average_rating.toFixed(1)} ({dish.rating_count || 0} reviews)
          </div>
        )}

        <div className="dish-actions">
                          <Link to={`/dish/${dish.id}`} className="view-details-btn">
            View Details
          </Link>
          <button 
            onClick={handleAddToCart}
            className="add-to-cart-btn"
            disabled={!dish.is_available}
          >
            {dish.is_available ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
});

DishCard.displayName = 'DishCard';

// 🎯 Memoized Filter Component
const FilterSection = memo(({ 
  categories, 
  selectedCategory, 
  vegetarianFilter, 
  spicyFilter, 
  onFilterChange 
}) => {
  return (
    <div className="filters">
      <div className="filter-group">
        <label className="filter-label">🍽️ Category</label>
        <select
          value={selectedCategory || ''}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="filter-select"
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
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={vegetarianFilter === 'true'}
            onChange={(e) => 
              onFilterChange('vegetarian', e.target.checked ? 'true' : '')
            }
          />
          <span className="checkmark"></span>
          🌱 Vegetarian Only
        </label>
      </div>

      <div className="filter-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={spicyFilter === 'true'}
            onChange={(e) => 
              onFilterChange('spicy', e.target.checked ? 'true' : '')
            }
          />
          <span className="checkmark"></span>
          🌶️ Spicy Only
        </label>
      </div>
    </div>
  );
});

FilterSection.displayName = 'FilterSection';

const Menu = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useAlert();

  const selectedCategory = searchParams.get('category');
  const vegetarianFilter = searchParams.get('vegetarian');
  const spicyFilter = searchParams.get('spicy');

  // 🚀 Memoized filtered dishes for performance
  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      if (selectedCategory && dish.category?.id !== parseInt(selectedCategory)) return false;
      if (vegetarianFilter === 'true' && !dish.is_vegetarian) return false;
      if (spicyFilter === 'true' && !dish.is_spicy) return false;
      return true;
    });
  }, [dishes, selectedCategory, vegetarianFilter, spicyFilter]);

  // 🎯 Memoized handlers
  const handleFilterChange = useCallback((filterType, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleAddToCart = useCallback((dish) => {
    try {
      addToCart(dish, 1);
      showSuccess(`${dish.name} added to cart! 🛒`, 'Success');
    } catch (error) {
      showError('Failed to add item to cart. Please try again.', 'Error');
    }
  }, [addToCart, showSuccess, showError]);

  // 🚀 Optimized data fetching
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [dishesResponse, categoriesResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/dishes/'),
          axios.get('http://127.0.0.1:8000/api/categories/')
        ]);

        if (isMounted) {
          setDishes(dishesResponse.data.results || dishesResponse.data);
          setCategories(categoriesResponse.data.results || categoriesResponse.data);
        }
      } catch (error) {
        if (isMounted) {
          showError('Failed to load menu. Please refresh the page.', 'Loading Error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [showError]);

  if (loading) {
    return (
      <div className="menu">
        <div className="container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <h2>✨ Preparing our delicious menu...</h2>
            <p>Get ready for an amazing culinary experience! 🍽️</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu">
      <div className="container">
        <div className="menu-header">
          <h1>🍽️ Our Exquisite Menu</h1>
          <p className="menu-subtitle">Discover flavors that will delight your senses ✨</p>
        </div>
        
        <FilterSection
          categories={categories}
          selectedCategory={selectedCategory}
          vegetarianFilter={vegetarianFilter}
          spicyFilter={spicyFilter}
          onFilterChange={handleFilterChange}
        />

        <div className="dishes-section">
          <div className="dishes-header">
            <h2>🌟 Featured Dishes</h2>
            <span className="dishes-count">{filteredDishes.length} delicious options</span>
          </div>

          <div className="dishes-grid">
            {filteredDishes.length > 0 ? (
              filteredDishes.map(dish => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onAddToCart={handleAddToCart}
                />
              ))
            ) : (
              <div className="no-dishes">
                <div className="no-dishes-icon">🔍</div>
                <h3>No dishes found</h3>
                <p>Try adjusting your filters to discover more delicious options!</p>
                <button 
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="clear-filters-btn"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu; 