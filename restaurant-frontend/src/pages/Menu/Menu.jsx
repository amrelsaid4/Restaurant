import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '@/contexts/CartContext';
import { useAlert } from '@/contexts/AlertContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Utility function for rendering stars
const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={i} className="text-yellow-400">★</span>);
  }

  if (hasHalfStar) {
    stars.push(<span key="half" className="text-yellow-400">☆</span>);
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
  }

  return stars;
};

// Memoized Dish Card Component
const DishCard = memo(({ dish, onAddToCart }) => {
  const handleAddToCart = useCallback(() => {
    onAddToCart(dish);
  }, [dish, onAddToCart]);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
      whileHover={{ y: -2 }}
      layout
    >
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {dish.image ? (
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl text-gray-400">🍽️</span>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white bg-opacity-95 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-orange-600 font-bold">${parseFloat(dish.price).toFixed(2)}</span>
        </div>

        {/* Rating Badge */}
        {dish.average_rating && (
          <div className="absolute top-3 left-3 bg-white bg-opacity-95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-medium">{dish.average_rating.toFixed(1)}</span>
          </div>
        )}

        {/* Category Badge */}
        {dish.category && (
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {dish.category.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {dish.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {dish.description}
          </p>
        </div>

        {/* Rating */}
        {dish.average_rating && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex">
              {renderStars(dish.average_rating || 0)}
            </div>
            {dish.rating_count > 0 && (
              <span className="text-sm text-gray-500">
                ({dish.rating_count})
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/dish/${dish.id}`}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-center text-sm"
          >
            View Details
          </Link>
          <motion.button
            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors text-sm"
            onClick={handleAddToCart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

DishCard.displayName = 'DishCard';

const Menu = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { showAlert } = useAlert();

  const selectedCategory = searchParams.get('category');
  const sortBy = searchParams.get('sort') || 'name';

  // Memoized filtered and sorted dishes
  const filteredDishes = useMemo(() => {
    let filtered = dishes.filter(dish => {
      // Search filter
      if (searchTerm && !dish.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !dish.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (selectedCategory && selectedCategory !== 'all' && 
          dish.category?.id !== parseInt(selectedCategory)) {
        return false;
      }
      
      return true;
    });

    // Sort dishes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price_high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [dishes, searchTerm, selectedCategory, sortBy]);

  const handleAddToCart = useCallback((dish) => {
    try {
      addToCart(dish);
      toast.success(`${dish.name} added to cart!`);
    } catch (error) {
      showAlert('Failed to add item to cart. Please try again.', 'error');
    }
  }, [addToCart, showAlert]);

  const handleCategoryChange = useCallback((categoryId) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId && categoryId !== 'all') {
      newParams.set('category', categoryId);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSortChange = useCallback((sortValue) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortValue && sortValue !== 'name') {
      newParams.set('sort', sortValue);
    } else {
      newParams.delete('sort');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Data fetching
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
          showAlert('Failed to load menu. Please refresh the page.', 'error');
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
  }, [showAlert]);

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
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Menu...</h2>
          <p className="text-gray-500">Preparing delicious dishes for you</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section 
        className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Our Menu
          </motion.h1>
          <motion.p 
            className="text-xl text-orange-100 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Discover our carefully crafted dishes made with the finest ingredients
          </motion.p>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Section */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <motion.button
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  !selectedCategory || selectedCategory === 'all'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleCategoryChange('all')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                All
              </motion.button>
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.id.toString()
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleCategoryChange(category.id.toString())}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="name">Sort by Name</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </motion.div>

        {/* Results Info */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-gray-600">
            Showing {filteredDishes.length} of {dishes.length} dishes
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </motion.div>

        {/* Dishes Grid */}
        <AnimatePresence mode="wait">
          {filteredDishes.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No dishes found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
            >
              {filteredDishes.map((dish) => (
                <DishCard 
                  key={dish.id} 
                  dish={dish} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Menu; 