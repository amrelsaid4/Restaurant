import { motion } from 'framer-motion';
import { Icons } from '../icons/IconLibrary';

/**
 * مكون Badge متطور
 * - 8 أنواع مختلفة من الـ badges
 * - أحجام متعددة
 * - دعم الأيقونات
 * - تأثيرات حركية
 * - خاص بالمطعم
 */
const Badge = ({
  // الخصائص الأساسية
  variant = 'primary',
  size = 'md',
  
  // الأيقونات
  icon,
  iconPosition = 'left',
  
  // النص والمحتوى
  children,
  
  // التأثيرات الحركية
  animate = false,
  pulse = false,
  
  // الخصائص الإضافية
  className = '',
  style = {},
  
  // التخصيص
  rounded = true,
  removable = false,
  onRemove,
  
  ...rest
}) => {
  // 🎨 تعريف الأنماط
  const variants = {
    primary: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200',
      hover: 'hover:bg-orange-200'
    },
    secondary: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      hover: 'hover:bg-red-200'
    },
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      hover: 'hover:bg-green-200'
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      hover: 'hover:bg-yellow-200'
    },
    danger: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      hover: 'hover:bg-red-200'
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-200'
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-200'
    },
    dark: {
      bg: 'bg-gray-800',
      text: 'text-gray-100',
      border: 'border-gray-700',
      hover: 'hover:bg-gray-700'
    }
  };

  // 🎨 تعريف الأحجام
  const sizes = {
    xs: {
      padding: 'px-1.5 py-0.5',
      text: 'text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1'
    },
    sm: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1'
    },
    md: {
      padding: 'px-2.5 py-1.5',
      text: 'text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1.5'
    },
    lg: {
      padding: 'px-3 py-2',
      text: 'text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2'
    },
    xl: {
      padding: 'px-4 py-2.5',
      text: 'text-lg',
      icon: 'w-6 h-6',
      gap: 'gap-2'
    }
  };

  // 🎯 تحديد الأنماط المطلوبة
  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  // 📱 تجميع الكلاسات
  const baseClasses = [
    // الأساسيات
    'inline-flex items-center justify-center font-medium border transition-all duration-200',
    
    // الأنماط المتغيرة
    variantStyles.bg,
    variantStyles.text,
    variantStyles.border,
    variantStyles.hover,
    
    // الأحجام
    sizeStyles.padding,
    sizeStyles.text,
    sizeStyles.gap,
    
    // الشكل
    rounded ? 'rounded-full' : 'rounded-md',
    
    // التفاعل
    removable && 'cursor-pointer',
    
    // التخصيص
    className
  ].filter(Boolean).join(' ');

  // 🎬 تأثيرات الحركة
  const motionProps = animate ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 }
  } : {};

  const pulseProps = pulse ? {
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 2, repeat: Infinity }
  } : {};

  // 🎯 الحصول على الأيقونة
  const IconComponent = Icons[icon];

  // 🗑️ أيقونة الحذف
  const RemoveIcon = Icons.close;

  // 🏷️ المكون النهائي
  const BadgeComponent = animate || pulse ? motion.span : 'span';

  return (
    <BadgeComponent
      className={baseClasses}
      style={style}
      onClick={removable ? onRemove : undefined}
      {...(animate && motionProps)}
      {...(pulse && pulseProps)}
      {...rest}
    >
      {/* الأيقونة اليسرى */}
      {IconComponent && iconPosition === 'left' && (
        <IconComponent className={sizeStyles.icon} />
      )}
      
      {/* النص */}
      {children}
      
      {/* الأيقونة اليمنى */}
      {IconComponent && iconPosition === 'right' && (
        <IconComponent className={sizeStyles.icon} />
      )}
      
      {/* أيقونة الحذف */}
      {removable && (
        <RemoveIcon className={`${sizeStyles.icon} ml-1 hover:bg-black hover:bg-opacity-10 rounded-full cursor-pointer`} />
      )}
    </BadgeComponent>
  );
};

// 🎨 أنواع الـ Badges الجاهزة
export const PrimaryBadge = (props) => <Badge variant="primary" {...props} />;
export const SecondaryBadge = (props) => <Badge variant="secondary" {...props} />;
export const SuccessBadge = (props) => <Badge variant="success" {...props} />;
export const WarningBadge = (props) => <Badge variant="warning" {...props} />;
export const DangerBadge = (props) => <Badge variant="danger" {...props} />;
export const InfoBadge = (props) => <Badge variant="info" {...props} />;
export const GrayBadge = (props) => <Badge variant="gray" {...props} />;
export const DarkBadge = (props) => <Badge variant="dark" {...props} />;

// 🎯 شارات خاصة بالمطعم
export const VegetarianBadge = (props) => (
  <Badge 
    variant="success" 
    icon="vegetarian" 
    size="sm" 
    {...props}
  >
    نباتي
  </Badge>
);

export const SpicyBadge = (props) => (
  <Badge 
    variant="danger" 
    icon="spicy" 
    size="sm" 
    pulse={true}
    {...props}
  >
    حار
  </Badge>
);

export const PopularBadge = (props) => (
  <Badge 
    variant="warning" 
    icon="popular" 
    size="sm" 
    animate={true}
    {...props}
  >
    الأكثر طلباً
  </Badge>
);

export const NewBadge = (props) => (
  <Badge 
    variant="info" 
    icon="sparkles" 
    size="sm" 
    pulse={true}
    {...props}
  >
    جديد
  </Badge>
);

export const FeaturedBadge = (props) => (
  <Badge 
    variant="primary" 
    icon="featured" 
    size="md" 
    animate={true}
    {...props}
  >
    مميز
  </Badge>
);

export const DiscountBadge = ({ discount, ...props }) => (
  <Badge 
    variant="danger" 
    icon="tag" 
    size="sm" 
    animate={true}
    {...props}
  >
    خصم {discount}%
  </Badge>
);

export const OutOfStockBadge = (props) => (
  <Badge 
    variant="gray" 
    icon="warning" 
    size="sm" 
    {...props}
  >
    نفدت الكمية
  </Badge>
);

export const LimitedBadge = (props) => (
  <Badge 
    variant="warning" 
    icon="clock" 
    size="sm" 
    pulse={true}
    {...props}
  >
    كمية محدودة
  </Badge>
);

export const ChefSpecialBadge = (props) => (
  <Badge 
    variant="dark" 
    icon="chef" 
    size="md" 
    animate={true}
    {...props}
  >
    اختيار الشيف
  </Badge>
);

export const FastDeliveryBadge = (props) => (
  <Badge 
    variant="success" 
    icon="truck" 
    size="sm" 
    {...props}
  >
    توصيل سريع
  </Badge>
);

export const RatingBadge = ({ rating, ...props }) => (
  <Badge 
    variant="warning" 
    icon="star" 
    size="sm" 
    {...props}
  >
    {rating}
  </Badge>
);

export const CaloriesBadge = ({ calories, ...props }) => (
  <Badge 
    variant="info" 
    icon="fire" 
    size="xs" 
    {...props}
  >
    {calories} سعرة
  </Badge>
);

export const CategoryBadge = ({ category, ...props }) => (
  <Badge 
    variant="gray" 
    icon="category" 
    size="sm" 
    {...props}
  >
    {category}
  </Badge>
);

export const PriceBadge = ({ price, ...props }) => (
  <Badge 
    variant="primary" 
    icon="currency" 
    size="md" 
    {...props}
  >
    {price} ج.م
  </Badge>
);

export const OrderStatusBadge = ({ status, ...props }) => {
  const statusConfig = {
    pending: { variant: 'warning', icon: 'clock', text: 'في الانتظار' },
    confirmed: { variant: 'info', icon: 'check', text: 'مؤكد' },
    preparing: { variant: 'primary', icon: 'chef', text: 'جاري التحضير' },
    ready: { variant: 'success', icon: 'check', text: 'جاهز' },
    delivered: { variant: 'success', icon: 'truck', text: 'تم التوصيل' },
    cancelled: { variant: 'danger', icon: 'cancel', text: 'ملغي' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge 
      variant={config.variant} 
      icon={config.icon} 
      size="sm" 
      {...props}
    >
      {config.text}
    </Badge>
  );
};

export const PaymentStatusBadge = ({ status, ...props }) => {
  const statusConfig = {
    pending: { variant: 'warning', icon: 'clock', text: 'في الانتظار' },
    paid: { variant: 'success', icon: 'check', text: 'مدفوع' },
    failed: { variant: 'danger', icon: 'error', text: 'فشل' },
    refunded: { variant: 'info', icon: 'back', text: 'مسترد' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge 
      variant={config.variant} 
      icon={config.icon} 
      size="sm" 
      {...props}
    >
      {config.text}
    </Badge>
  );
};

export const StockBadge = ({ stock, ...props }) => {
  let variant = 'success';
  let text = 'متوفر';
  let icon = 'check';
  
  if (stock === 0) {
    variant = 'danger';
    text = 'نفدت الكمية';
    icon = 'warning';
  } else if (stock <= 5) {
    variant = 'warning';
    text = `${stock} قطع متبقية`;
    icon = 'warning';
  }

  return (
    <Badge 
      variant={variant} 
      icon={icon} 
      size="xs" 
      {...props}
    >
      {text}
    </Badge>
  );
};

export const NotificationBadge = ({ count, ...props }) => (
  <Badge 
    variant="danger" 
    size="xs" 
    rounded={true}
    pulse={count > 0}
    {...props}
  >
    {count > 99 ? '99+' : count}
  </Badge>
);

export const OnlineBadge = (props) => (
  <Badge 
    variant="success" 
    size="xs" 
    pulse={true}
    {...props}
  >
    متصل
  </Badge>
);

export const OfflineBadge = (props) => (
  <Badge 
    variant="gray" 
    size="xs" 
    {...props}
  >
    غير متصل
  </Badge>
);

export default Badge; 