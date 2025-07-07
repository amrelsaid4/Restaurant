import { motion } from 'framer-motion';

/**
 * مكون LoadingSpinner متطور
 * - 6 أنواع مختلفة من الـ spinners
 * - أحجام متعددة
 * - ألوان مختلفة
 * - دعم النص الاختياري
 */
const LoadingSpinner = ({
  // الخصائص الأساسية
  type = 'spinner',
  size = 'md',
  color = 'primary',
  
  // النص والمحتوى
  text = '',
  showText = false,
  
  // الخصائص الإضافية
  className = '',
  style = {},
  
  // التخصيص
  fullScreen = false,
  overlay = false,
  
  ...rest
}) => {
  // 🎨 تعريف الأحجام
  const sizes = {
    xs: {
      spinner: 'w-3 h-3',
      text: 'text-xs',
      gap: 'gap-1'
    },
    sm: {
      spinner: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-1.5'
    },
    md: {
      spinner: 'w-6 h-6',
      text: 'text-base',
      gap: 'gap-2'
    },
    lg: {
      spinner: 'w-8 h-8',
      text: 'text-lg',
      gap: 'gap-2.5'
    },
    xl: {
      spinner: 'w-12 h-12',
      text: 'text-xl',
      gap: 'gap-3'
    },
    '2xl': {
      spinner: 'w-16 h-16',
      text: 'text-2xl',
      gap: 'gap-4'
    }
  };

  // 🎨 تعريف الألوان
  const colors = {
    primary: 'text-orange-500',
    secondary: 'text-red-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-600',
    info: 'text-blue-500',
    gray: 'text-gray-500',
    white: 'text-white'
  };

  // 🎯 تحديد الأنماط المطلوبة
  const sizeStyles = sizes[size] || sizes.md;
  const colorClass = colors[color] || colors.primary;

  // 🎬 تأثيرات الحركة
  const spinAnimation = {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: "linear" }
  };

  const pulseAnimation = {
    animate: { scale: [1, 1.2, 1] },
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
  };

  const bounceAnimation = {
    animate: { y: [0, -10, 0] },
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
  };

  // 🔄 أنواع الـ Spinners
  const spinnerTypes = {
    // 1. Spinner تقليدي
    spinner: (
      <motion.svg
        className={`${sizeStyles.spinner} ${colorClass}`}
        fill="none"
        viewBox="0 0 24 24"
        {...spinAnimation}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </motion.svg>
    ),

    // 2. Dots متحركة
    dots: (
      <div className={`flex ${sizeStyles.gap}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full ${colorClass.replace('text-', 'bg-')}`}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    ),

    // 3. Bars متحركة
    bars: (
      <div className={`flex ${sizeStyles.gap} items-end`}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`w-1 bg-current ${colorClass}`}
            style={{ height: '16px' }}
            animate={{ scaleY: [1, 2, 1] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    ),

    // 4. Pulse
    pulse: (
      <motion.div
        className={`${sizeStyles.spinner} rounded-full ${colorClass.replace('text-', 'bg-')} opacity-75`}
        {...pulseAnimation}
      />
    ),

    // 5. Ring
    ring: (
      <motion.div
        className={`${sizeStyles.spinner} rounded-full border-2 ${colorClass.replace('text-', 'border-')} border-t-transparent`}
        {...spinAnimation}
      />
    ),

    // 6. Bounce
    bounce: (
      <motion.div
        className={`${sizeStyles.spinner} rounded-full ${colorClass.replace('text-', 'bg-')}`}
        {...bounceAnimation}
      />
    )
  };

  // 📱 تجميع الكلاسات
  const containerClasses = [
    'flex items-center justify-center',
    showText && sizeStyles.gap,
    fullScreen && 'fixed inset-0 z-50',
    overlay && 'bg-black bg-opacity-50',
    className
  ].filter(Boolean).join(' ');

  // 🎭 المكون النهائي
  const LoaderComponent = () => (
    <div className={containerClasses} style={style} {...rest}>
      {spinnerTypes[type] || spinnerTypes.spinner}
      
      {(showText || text) && (
        <motion.span
          className={`${sizeStyles.text} ${colorClass} font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text || 'جاري التحميل...'}
        </motion.span>
      )}
    </div>
  );

  return <LoaderComponent />;
};

// 🎨 أنواع الـ Spinners الجاهزة
export const SpinnerLoader = (props) => <LoadingSpinner type="spinner" {...props} />;
export const DotsLoader = (props) => <LoadingSpinner type="dots" {...props} />;
export const BarsLoader = (props) => <LoadingSpinner type="bars" {...props} />;
export const PulseLoader = (props) => <LoadingSpinner type="pulse" {...props} />;
export const RingLoader = (props) => <LoadingSpinner type="ring" {...props} />;
export const BounceLoader = (props) => <LoadingSpinner type="bounce" {...props} />;

// 🎯 محملات خاصة بالمطعم
export const PageLoader = (props) => (
  <LoadingSpinner 
    type="spinner" 
    size="xl" 
    color="primary" 
    text="جاري تحميل الصفحة..."
    showText={true}
    fullScreen={true}
    overlay={true}
    {...props}
  />
);

export const MenuLoader = (props) => (
  <LoadingSpinner 
    type="dots" 
    size="lg" 
    color="primary" 
    text="جاري تحميل القائمة..."
    showText={true}
    {...props}
  />
);

export const OrderLoader = (props) => (
  <LoadingSpinner 
    type="bars" 
    size="md" 
    color="success" 
    text="جاري معالجة الطلب..."
    showText={true}
    {...props}
  />
);

export const SearchLoader = (props) => (
  <LoadingSpinner 
    type="pulse" 
    size="sm" 
    color="primary" 
    {...props}
  />
);

export const ButtonLoader = (props) => (
  <LoadingSpinner 
    type="spinner" 
    size="sm" 
    color="white" 
    {...props}
  />
);

export const CardLoader = (props) => (
  <LoadingSpinner 
    type="ring" 
    size="md" 
    color="primary" 
    {...props}
  />
);

export const InlineLoader = (props) => (
  <LoadingSpinner 
    type="dots" 
    size="xs" 
    color="gray" 
    {...props}
  />
);

export const FullScreenLoader = (props) => (
  <LoadingSpinner 
    type="spinner" 
    size="2xl" 
    color="primary" 
    text="جاري التحميل..."
    showText={true}
    fullScreen={true}
    overlay={true}
    {...props}
  />
);

export const OverlayLoader = (props) => (
  <LoadingSpinner 
    type="pulse" 
    size="xl" 
    color="primary" 
    overlay={true}
    {...props}
  />
);

export const ImageLoader = (props) => (
  <LoadingSpinner 
    type="bounce" 
    size="md" 
    color="gray" 
    {...props}
  />
);

export const SubmitLoader = (props) => (
  <LoadingSpinner 
    type="spinner" 
    size="sm" 
    color="white" 
    text="جاري الإرسال..."
    showText={true}
    {...props}
  />
);

export const DataLoader = (props) => (
  <LoadingSpinner 
    type="bars" 
    size="lg" 
    color="info" 
    text="جاري جلب البيانات..."
    showText={true}
    {...props}
  />
);

export default LoadingSpinner; 