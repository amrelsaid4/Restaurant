import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle session cookies
api.interceptors.response.use(
  (response) => {
    // Store session key if provided
    if (response.data && response.data.session_key) {
      localStorage.setItem('session_key', response.data.session_key);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add request interceptor to include session key
api.interceptors.request.use(
  (config) => {
    const sessionKey = localStorage.getItem('session_key');
    if (sessionKey) {
      config.headers['X-Session-Key'] = sessionKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// CSRF Token Management
let csrfToken = null;

const fetchCSRFToken = async () => {
  try {
    const response = await api.get('/api/csrf-token/');
    csrfToken = response.data.csrf_token;
    return csrfToken;
    } catch (error) {
        return null;
    }
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, url, data = null, options = {}) => {
  try {
    // Ensure we have a CSRF token for non-GET requests
    if (method !== 'GET' && !csrfToken) {
      await fetchCSRFToken();
    }

    const config = {
      method,
      url,
      withCredentials: true,
      ...options
    };

    // Add session key if available
    const sessionKey = localStorage.getItem('session_key');
    if (sessionKey) {
      config.headers = {
        ...config.headers,
        'X-Session-Key': sessionKey
      };
      console.log('🔑 Adding session key to request:', sessionKey.substring(0, 10) + '...');
    }

    // Add CSRF token for non-GET requests
    if (method !== 'GET' && csrfToken) {
      config.headers = {
        ...config.headers,
        'X-CSRFToken': csrfToken
      };
    }

    if (data) {
      config.data = data;
    }

    console.log('📡 Making authenticated request to:', url, 'with headers:', config.headers);
    const response = await api(config);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      // CSRF token might be expired, try to refresh it
      await fetchCSRFToken();
      throw error;
    }
    if (error.response?.status === 401) {
      // Session expired, clear local storage
      console.log('❌ Session expired, clearing localStorage');
      localStorage.removeItem('session_key');
      localStorage.removeItem('user_data');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      console.log('📡 Customer login API call:', { identity: credentials.identity });
      
      // Fetch CSRF token first
      await fetchCSRFToken();
      console.log('🔑 CSRF token ready for customer login');
      
      const response = await api.post('/api/login/', credentials, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Customer login API response:', response.data);
      
      // Save session key to localStorage
      if (response.data.session_key) {
        localStorage.setItem('session_key', response.data.session_key);
        console.log('💾 Session key saved to localStorage:', response.data.session_key.substring(0, 10) + '...');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Customer login API error:', error.response?.data || error.message);
      const errorData = error.response?.data || { error: 'Login failed' };
      throw new Error(errorData.error || 'Authentication failed');
    }
  },

  register: async (userData) => {
    console.log('📡 Register API call');
    return makeAuthenticatedRequest('POST', '/api/register/', userData);
  },

  logout: async () => {
    try {
      console.log('📡 Logout API call');
      await makeAuthenticatedRequest('POST', '/api/logout/');
      console.log('✅ Logout API successful');
    } catch (error) {
      // Ignore logout errors - even if backend fails, we clear local session
      console.warn('⚠️ Logout request failed, but clearing local session:', error.message);
    } finally {
      // Always clear local session data
      localStorage.removeItem('session_key');
    }
  },

  checkUserType: async () => {
    console.log('📡 Check user type API call');
    const result = await makeAuthenticatedRequest('GET', '/api/check-user-type/');
    console.log('✅ Check user type response:', result);
    return result;
  },

  getUserProfile: async () => {
    console.log('📡 Get user profile API call');
    return makeAuthenticatedRequest('GET', '/api/profile/');
  }
};

// Menu API
export const menuAPI = {
  getCategories: () => makeAuthenticatedRequest('GET', '/api/categories/'),
  getDishes: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return makeAuthenticatedRequest('GET', `/api/dishes/${queryString ? '?' + queryString : ''}`);
  },
  getDish: (id) => makeAuthenticatedRequest('GET', `/api/dishes/${id}/`),
  getDishRatings: (dishId) => makeAuthenticatedRequest('GET', `/api/dishes/${dishId}/ratings/`)
};

// Orders API
export const ordersAPI = {
  getOrders: () => makeAuthenticatedRequest('GET', '/api/orders/'),
  createOrder: (orderData) => makeAuthenticatedRequest('POST', '/api/orders/', orderData)
};

// Ratings API
export const ratingsAPI = {
  submitRating: async (ratingData) => {
    try {
      const result = await makeAuthenticatedRequest('POST', '/api/add-rating/', ratingData);
      
      return result;
    } catch (error) {
      throw error;
    }
  },

  updateRating: async (ratingId, ratingData) => {
    try {
      const result = await makeAuthenticatedRequest('PUT', `/api/update-rating/${ratingId}/`, ratingData);

        return result;
    } catch (error) {
        throw error;
    }
  }
};

// Restaurant API
export const restaurantAPI = {
  getInfo: () => makeAuthenticatedRequest('GET', '/api/restaurant-info/'),
  getMenuOverview: () => makeAuthenticatedRequest('GET', '/api/menu-overview/')
};

// Checkout API
export const checkoutAPI = {
  createCheckoutSession: (checkoutData) => makeAuthenticatedRequest('POST', '/api/stripe/create-checkout-session/', checkoutData),
  verifyPayment: (sessionId) => makeAuthenticatedRequest('GET', `/api/stripe/success/?session_id=${sessionId}`),
  getStripeConfig: () => makeAuthenticatedRequest('GET', '/api/stripe/config/')
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => makeAuthenticatedRequest('GET', '/api/admin/dashboard/'),
  
  // Orders
  getOrders: () => makeAuthenticatedRequest('GET', '/api/admin/orders/'),
  updateOrderStatus: (orderId, status) => makeAuthenticatedRequest('PATCH', `/api/admin/orders/${orderId}/update_status/`, { status }),
  
  // Dishes
  getDishes: () => makeAuthenticatedRequest('GET', '/api/admin/dishes/'),
  createDish: (dishData) => makeAuthenticatedRequest('POST', '/api/admin/dishes/', dishData),
  updateDish: (dishId, dishData) => makeAuthenticatedRequest('PUT', `/api/admin/dishes/${dishId}/`, dishData),
  deleteDish: (dishId) => makeAuthenticatedRequest('DELETE', `/api/admin/dishes/${dishId}/`),
  
  // Categories
  getCategories: () => makeAuthenticatedRequest('GET', '/api/admin/categories/'),
  createCategory: (categoryData) => makeAuthenticatedRequest('POST', '/api/admin/categories/', categoryData),
  updateCategory: (categoryId, categoryData) => makeAuthenticatedRequest('PUT', `/api/admin/categories/${categoryId}/`, categoryData),
  deleteCategory: (categoryId) => makeAuthenticatedRequest('DELETE', `/api/admin/categories/${categoryId}/`),
  
  // Customers
  getCustomers: () => makeAuthenticatedRequest('GET', '/api/admin/customers/')
};

export default api;

// Generic API service function for backward compatibility
export const apiService = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `/api/${endpoint}`,
      withCredentials: true,
    };

    // Add CSRF token for non-GET requests
    if (method !== 'GET' && !csrfToken) {
      await fetchCSRFToken();
    }

    if (method !== 'GET' && csrfToken) {
      config.headers = {
        ...config.headers,
        'X-CSRFToken': csrfToken
      };
    }

    if (data) {
      config.data = data;
    }

    const response = await api(config);
    return response.data;
    } catch (error) {
    if (error.response?.status === 403) {
      // CSRF token might be expired, try to refresh it
      await fetchCSRFToken();
      throw error;
    }
        throw error;
    }
};

// Rating functions for backward compatibility
export const submitRating = ratingsAPI.submitRating;
export const updateRating = ratingsAPI.updateRating;

// Profile functions for backward compatibility
export const getUserProfile = authAPI.getUserProfile;

// Admin functions for backward compatibility
export const getDashboardStats = adminAPI.getDashboardStats;
export const getOrders = adminAPI.getOrders;
export const updateOrderStatus = adminAPI.updateOrderStatus;
export const getDishes = adminAPI.getDishes;
export const createDish = adminAPI.createDish;
export const updateDish = adminAPI.updateDish;
export const patchDish = adminAPI.updateDish; // alias for updateDish
export const deleteDish = adminAPI.deleteDish;
export const getCategories = adminAPI.getCategories;
export const createCategory = adminAPI.createCategory;
export const updateCategory = adminAPI.updateCategory;
export const patchCategory = adminAPI.updateCategory; // alias for updateCategory
export const deleteCategory = adminAPI.deleteCategory;
export const getCustomers = adminAPI.getCustomers;

// Named exports for backward compatibility
export const checkUserType = authAPI.checkUserType;
export const loginUser = authAPI.login;
export const loginAdmin = async (credentials) => {
  try {
    console.log('📡 Admin login API call:', { email: credentials.email });
    
    // Fetch CSRF token first
    await fetchCSRFToken();
    console.log('🔑 CSRF token ready for admin login');
    
    const response = await api.post('/api/admin/login/', credentials, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Admin login API response:', response.data);
    
    // Save session key to localStorage
    if (response.data.session_key) {
      localStorage.setItem('session_key', response.data.session_key);
      console.log('💾 Admin session key saved to localStorage:', response.data.session_key.substring(0, 10) + '...');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Admin login API error:', error.response?.data || error.message);
    const errorData = error.response?.data || { error: 'Admin login failed' };
    throw new Error(errorData.error || 'Admin authentication failed');
  }
};
export const logoutUser = authAPI.logout;
export { fetchCSRFToken };

 