import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  FireIcon, 
  HeartIcon, 
  StarIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

import { Card, Button, Badge } from '../ui';
import { useCart } from '../../contexts/CartContext';

const DishCard = ({ dish, className = '', showCategory = false }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(dish);
    toast.success(`تم إضافة ${dish.name} إلى السلة!`);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement favorites functionality
    toast.success('تم إضافة الطبق إلى المفضلة!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Link to={`/dish/${dish.id}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden">
            <img 
              src={dish.image?.startsWith('http') ? dish.image : `http://127.0.0.1:8000${dish.image}`} 
              alt={dish.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
              }}
            />
            
            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="flex flex-col gap-2">
                {dish.is_vegetarian && (
                  <Badge variant="vegetarian" className="bg-green-500 text-white shadow-lg">
                    🌱 نباتي
                  </Badge>
                )}
                {dish.is_spicy && (
                  <Badge variant="spicy" className="bg-red-500 text-white shadow-lg">
                    🌶️ حار
                  </Badge>
                )}
                {!dish.is_in_stock && (
                  <Badge variant="danger" className="bg-gray-500 text-white shadow-lg">
                    غير متوفر
                  </Badge>
                )}
              </div>
              
              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <HeartIcon className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
              </button>
            </div>

            {/* Stock Status Overlay */}
            {!dish.is_in_stock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">غير متوفر</span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Category */}
            {showCategory && dish.category && (
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs">
                  {dish.category.name}
                </Badge>
              </div>
            )}

            {/* Title & Rating */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                {dish.name}
              </h3>
              {dish.average_rating > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-gray-600">{dish.average_rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
              {dish.description || 'طبق لذيذ محضر بعناية من أفضل المكونات'}
            </p>
            
            {/* Details */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{dish.preparation_time} دقيقة</span>
              </div>
              {dish.calories && (
                <div className="flex items-center gap-1">
                  <FireIcon className="w-4 h-4" />
                  <span>{dish.calories} سعرة</span>
                </div>
              )}
            </div>

            {/* Price & Actions */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-primary-600">
                  {dish.price}
                </span>
                <span className="text-gray-500 mr-1">جنيه</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="group/btn"
                  onClick={(e) => e.preventDefault()}
                >
                  التفاصيل
                </Button>
                <Button 
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!dish.is_in_stock}
                  className="group/btn"
                >
                  <ShoppingCartIcon className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
                  إضافة
                </Button>
              </div>
            </div>

            {/* Stock Indicator */}
            {dish.is_low_stock && dish.is_in_stock && (
              <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700 text-center">
                  ⚠️ كمية محدودة متبقية
                </p>
              </div>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default DishCard; 