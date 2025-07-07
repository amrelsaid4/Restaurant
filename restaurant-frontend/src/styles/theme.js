/**
 * Unified Design System for Restaurant Theme
 * Contains all colors, dimensions, fonts, and effects
 */

// 🎨 Primary Color Palette
export const colors = {
  // Primary restaurant colors
  primary: {
    50: '#fef7f0',
    100: '#fdeee0',
    200: '#fbd9c0',
    300: '#f8b896',
    400: '#f4906a',
    500: '#ff6b35', // Primary orange color
    600: '#e55a2e',
    700: '#c04a27',
    800: '#9c3d23',
    900: '#7e3022',
    950: '#461c12'
  },
  
  // Secondary colors (Red)
  secondary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#e6394a', // Secondary red color
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },
  
  // Accent colors
  accent: {
    cream: '#fff8dc',
    gold: '#ffd700',
    lightGold: '#ffed4a',
    darkGold: '#b8860b',
    green: '#2d5a27',
    lightGreen: '#10b981',
    darkGreen: '#047857'
  },
  
  // Semantic colors
  semantic: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    
    // Light semantic colors
    successLight: '#d1fae5',
    errorLight: '#fee2e2',
    warningLight: '#fef3c7',
    infoLight: '#dbeafe',
    
    // Dark semantic colors
    successDark: '#047857',
    errorDark: '#dc2626',
    warningDark: '#d97706',
    infoDark: '#1d4ed8'
  },
  
  // Gray colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  }
};

// 📏 Dimensions and Spacing
export const spacing = {
  // Basic spacing
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
  
  // Custom spacing
  section: '5rem',   // Between sections
  card: '1.5rem',    // Inside cards
  button: '1rem',    // Inside buttons
  input: '0.75rem',  // Inside inputs
  
  // Margins
  container: '1rem',
  content: '2rem',
  page: '3rem'
};

// 🔤 Typography System
export const typography = {
  // Font families
  fontFamily: {
    primary: ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
    secondary: ['Poppins', 'Arial', 'sans-serif'],
    mono: ['Fira Code', 'monospace']
  },
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem'      // 128px
  },
  
  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },
  
  // Line height
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  }
};

// 🔲 Borders and Corners
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px'
};

// 📦 Shadows
export const boxShadow = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Custom shadows
  card: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  button: '0 2px 4px -2px rgb(0 0 0 / 0.1)',
  modal: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
};

// 🎭 Effects and Transitions
export const transitions = {
  // Duration times
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms'
  },
  
  // Timing functions
  timing: {
    ease: 'ease',
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  },
  
  // Ready-made transitions
  common: {
    all: 'all 300ms ease-in-out',
    color: 'color 200ms ease-in-out',
    background: 'background-color 200ms ease-in-out',
    transform: 'transform 300ms ease-in-out',
    shadow: 'box-shadow 300ms ease-in-out',
    opacity: 'opacity 200ms ease-in-out'
  }
};

// 📐 Breakpoints for Different Screens
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// 🌊 Motion Effects
export const animations = {
  // Basic motions
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' }
    },
    
    slideUp: {
      from: { transform: 'translateY(10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' }
    },
    
    slideDown: {
      from: { transform: 'translateY(-10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' }
    },
    
    slideLeft: {
      from: { transform: 'translateX(10px)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' }
    },
    
    slideRight: {
      from: { transform: 'translateX(-10px)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' }
    },
    
    scaleUp: {
      from: { transform: 'scale(0.95)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' }
    },
    
    bounceIn: {
      '0%': { transform: 'scale(0.3)', opacity: '0' },
      '50%': { transform: 'scale(1.05)' },
      '70%': { transform: 'scale(0.9)' },
      '100%': { transform: 'scale(1)', opacity: '1' }
    },
    
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' }
    },
    
    spin: {
      to: { transform: 'rotate(360deg)' }
    }
  },
  
  // Predefined motion classes
  classes: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down',
    slideLeft: 'animate-slide-left',
    slideRight: 'animate-slide-right',
    scaleUp: 'animate-scale-up',
    bounceIn: 'animate-bounce-in',
    pulse: 'animate-pulse',
    spin: 'animate-spin'
  }
};

// 🎯 Interactive Buttons and Components
export const components = {
  // Button styles
  button: {
    variants: {
      primary: {
        bg: colors.primary[500],
        color: '#ffffff',
        hover: colors.primary[600],
        active: colors.primary[700],
        focus: colors.primary[500],
        disabled: colors.gray[400]
      },
      secondary: {
        bg: colors.secondary[500],
        color: '#ffffff',
        hover: colors.secondary[600],
        active: colors.secondary[700],
        focus: colors.secondary[500],
        disabled: colors.gray[400]
      },
      success: {
        bg: colors.semantic.success,
        color: '#ffffff',
        hover: colors.semantic.successDark,
        active: colors.semantic.successDark,
        focus: colors.semantic.success,
        disabled: colors.gray[400]
      },
      outline: {
        bg: 'transparent',
        color: colors.primary[500],
        border: colors.primary[500],
        hover: colors.primary[50],
        active: colors.primary[100],
        focus: colors.primary[500],
        disabled: colors.gray[400]
      },
      ghost: {
        bg: 'transparent',
        color: colors.gray[600],
        hover: colors.gray[100],
        active: colors.gray[200],
        focus: colors.gray[600],
        disabled: colors.gray[400]
      }
    },
    
    sizes: {
      xs: {
        padding: '0.25rem 0.5rem',
        fontSize: typography.fontSize.xs,
        borderRadius: borderRadius.sm
      },
      sm: {
        padding: '0.5rem 1rem',
        fontSize: typography.fontSize.sm,
        borderRadius: borderRadius.md
      },
      md: {
        padding: '0.75rem 1.5rem',
        fontSize: typography.fontSize.base,
        borderRadius: borderRadius.lg
      },
      lg: {
        padding: '1rem 2rem',
        fontSize: typography.fontSize.lg,
        borderRadius: borderRadius.xl
      },
      xl: {
        padding: '1.25rem 2.5rem',
        fontSize: typography.fontSize.xl,
        borderRadius: borderRadius.xl
      }
    }
  },
  
  // Styles for cards
  card: {
    variants: {
      default: {
        bg: '#ffffff',
        border: colors.gray[200],
        shadow: boxShadow.card,
        borderRadius: borderRadius.lg
      },
      elevated: {
        bg: '#ffffff',
        border: 'none',
        shadow: boxShadow.lg,
        borderRadius: borderRadius.xl
      },
      outlined: {
        bg: '#ffffff',
        border: colors.gray[300],
        shadow: boxShadow.sm,
        borderRadius: borderRadius.lg
      }
    }
  },
  
  // Styles for inputs
  input: {
    variants: {
      default: {
        bg: '#ffffff',
        border: colors.gray[300],
        focus: colors.primary[500],
        error: colors.semantic.error,
        borderRadius: borderRadius.md,
        padding: '0.75rem 1rem'
      }
    }
  }
};

// 📱 Layout and Grid
export const layout = {
  // Container widths
  container: {
    xs: '100%',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Common heights
  heights: {
    navbar: '4rem',
    footer: '3rem',
    card: '20rem',
    image: '12rem'
  },
  
  // Common widths
  widths: {
    sidebar: '16rem',
    modal: '32rem',
    drawer: '20rem'
  }
};

// 🔧 Helper Functions
export const utils = {
  // Convert hex color to rgba
  rgba: (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
  
  // Get color variant based on light level
  getColorVariant: (colorScale, variant = 500) => {
    return colorScale[variant] || colorScale[500];
  },
  
  // Get appropriate shadow
  getShadow: (level = 'md') => {
    return boxShadow[level] || boxShadow.md;
  },
  
  // Get radius based on size
  getRadius: (size = 'md') => {
    return borderRadius[size] || borderRadius.md;
  }
};

// 🌟 Complete Theme
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  boxShadow,
  transitions,
  breakpoints,
  animations,
  components,
  layout,
  utils
};

export default theme; 