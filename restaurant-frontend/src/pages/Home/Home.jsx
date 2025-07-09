import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { menuAPI, restaurantAPI } from '@/services/api';

const Home = () => {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [specialDishes, setSpecialDishes] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [homepageStats, setHomepageStats] = useState({
    total_customers: 0,
    dishes_served_today: 0,
    menu_items: 0,
    average_rating: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Hero background images
  const heroImages = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1970&q=80',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1965&q=80'
  ];

  // Fetch popular dishes
  useEffect(() => {
    const fetchPopularDishes = async () => {
      try {
        setLoadingDishes(true);
        const response = await menuAPI.getMostOrderedDishes();
        setSpecialDishes(response || []);
      } catch (error) {
        console.error('Error fetching dishes for homepage:', error);
        // Fallback to static data if API fails
        setSpecialDishes([
          {
            id: 1,
            name: "Grilled Salmon",
            price: "$24.99",
            image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=387&q=80",
            description: "Fresh Atlantic salmon with herbs and lemon"
          },
          {
            id: 2,
            name: "Beef Steak",
            price: "$32.99",
            image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            description: "Premium cut beef with garlic butter"
          },
          {
            id: 3,
            name: "Pasta Carbonara",
            price: "$18.99",
            image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            description: "Creamy pasta with bacon and parmesan"
          }
        ]);
      } finally {
        setLoadingDishes(false);
      }
    };

    fetchPopularDishes();
  }, []);

  // Fetch homepage statistics
  useEffect(() => {
    const fetchHomepageStats = async () => {
      try {
        setLoadingStats(true);
        const response = await restaurantAPI.getHomepageStats();
        setHomepageStats(response);
      } catch (error) {
        console.error('Error fetching homepage stats:', error);
        // Keep default values on error
      } finally {
        setLoadingStats(false);
      }
    };

    fetchHomepageStats();
  }, []);

  // Change background image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const features = [
    {
      icon: "🍽️",
      title: "Fresh Ingredients",
      description: "We use only the freshest, locally-sourced ingredients in all our dishes"
    },
    {
      icon: "👨‍🍳",
      title: "Expert Chefs",
      description: "Our experienced chefs create culinary masterpieces with passion and skill"
    },
    {
      icon: "🚚",
      title: "Fast Delivery",
      description: "Quick and reliable delivery service to bring your meal straight to your door"
    },
    {
      icon: "⭐",
      title: "5-Star Quality",
      description: "Consistently rated 5 stars by our satisfied customers worldwide"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: index === currentImageIndex ? 1 : 0,
                scale: index === currentImageIndex ? 1.05 : 1
              }}
              transition={{ duration: 1.5 }}
            />
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-20 text-center text-white max-w-4xl mx-auto px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            variants={itemVariants}
          >
            Welcome to <span className="text-orange-400">Fine Dining</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-gray-200"
            variants={itemVariants}
          >
            Experience culinary excellence with our carefully crafted dishes
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <Link to="/menu">
              <motion.button
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                 View Menu
              </motion.button>
            </Link>
            
            {!user && (
              <Link to="/register">
                <motion.button
                  className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold rounded-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                   Join Us
                </motion.button>
              </Link>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing an exceptional dining experience with every order
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Dishes Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Chef's Special</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular dishes, carefully prepared by our expert chefs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingDishes ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="h-48 bg-gray-300 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse mb-4"></div>
                    <div className="h-10 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </motion.div>
              ))
            ) : (
              specialDishes.map((dish, index) => (
                <motion.div
                  key={dish.id}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={dish.image && dish.image.startsWith('http') 
                        ? dish.image 
                        : dish.image 
                        ? `http://127.0.0.1:8000${dish.image}` 
                        : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&q=80'
                      } 
                      alt={dish.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&q=80';
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full font-semibold">
                      ${typeof dish.price === 'number' ? dish.price.toFixed(2) : parseFloat(dish.price).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{dish.name}</h3>
                    <p className="text-gray-600 mb-4">{dish.description}</p>
                    <Link to={`/dish/${dish.id}`}>
                      <motion.button
                        className="w-full px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View in Menu
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* View Full Menu Button */}
          <div className="mt-16 text-center">
            <Link to="/menu">
              <motion.button
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                View Full Menu
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section 
        className="py-20 bg-cover bg-center bg-fixed relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience Fine Dining?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Join thousands of satisfied customers and order your perfect meal today
            </p>
            <Link to="/menu">
              <motion.button
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg text-lg transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                 Order Now
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {loadingStats ? (
              // Loading skeletons for stats
              [...Array(4)].map((_, index) => (
                <motion.div
                  key={index}
                  className="text-center text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    <div className="h-12 bg-orange-500 rounded animate-pulse"></div>
                  </div>
                  <div className="text-orange-100">
                    <div className="h-4 bg-orange-500 rounded animate-pulse"></div>
                  </div>
                </motion.div>
              ))
            ) : (
              [
                { 
                  number: homepageStats.total_customers > 1000 ? `${Math.floor(homepageStats.total_customers / 1000)}K+` : `${homepageStats.total_customers}+`, 
                  label: "Happy Customers" 
                },
                { 
                  number: `${homepageStats.dishes_served_today}+`, 
                  label: "Dishes Served Today" 
                },
                { 
                  number: `${homepageStats.menu_items}+`, 
                  label: "Menu Items" 
                },
                { 
                  number: homepageStats.average_rating.toFixed(1), 
                  label: "Average Rating" 
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-orange-100">{stat.label}</div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;