const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Get CSRF token from cookies
const getCSRFToken = () => {
    const name = 'csrftoken';
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
};

// Get CSRF token from backend
export const fetchCSRFToken = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/csrf-token/`, {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json();
        return data.csrf_token;
    } catch (error) {
        return null;
    }
};

export const apiService = async (endpoint, method = 'GET', data = null) => {
    try {
        const url = `${API_BASE_URL}/${endpoint}`;
        const options = {
            method,
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include', // Important for session cookies
        };

        // Check if data is FormData
        const isFormData = data instanceof FormData;
        
        // Only set Content-Type for non-FormData requests
        if (!isFormData) {
            options.headers['Content-Type'] = 'application/json';
        }

        // Add CSRF token for POST requests
        if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
            const csrfToken = getCSRFToken() || await fetchCSRFToken();
            if (csrfToken) {
                options.headers['X-CSRFToken'] = csrfToken;
            }
        }

        // Add session key if available
        const sessionKey = localStorage.getItem('session_key');
        if (sessionKey) {
            options.headers['X-Session-Key'] = sessionKey;
        }

        if (data) {
            // Use FormData directly or JSON stringify
            options.body = isFormData ? data : JSON.stringify(data);
        }

        const response = await fetch(url, options);

        // Store session key if returned in headers
        if (response.headers.get('X-Session-Key')) {
            localStorage.setItem('session_key', response.headers.get('X-Session-Key'));
        }

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `HTTP error! status: ${response.status}` };
            }
            throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
        }

        // Handle empty responses
        if (response.status === 204) {
            return null;
        }

        const result = await response.json();

        // Store session key if in response data
        if (result.session_key) {
            localStorage.setItem('session_key', result.session_key);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

// Specific API functions
export const loginUser = (credentials) => apiService('login/', 'POST', credentials);

export const checkUserType = async () => {
    return await apiService('check-user-type/', 'GET');
};

export const getUserProfile = () => apiService('profile/', 'GET');

export const logoutUser = () => apiService('logout/', 'POST');

// Admin functions
export const loginAdmin = (credentials) => apiService('admin/login/', 'POST', credentials);

export const getDashboardStats = () => apiService('admin/dashboard/', 'GET');

// Admin Dishes
export const getDishes = () => apiService('admin/dishes/', 'GET');
export const getDish = (id) => apiService(`admin/dishes/${id}/`, 'GET');
export const createDish = (dishData) => apiService('admin/dishes/', 'POST', dishData);
export const updateDish = (id, dishData) => apiService(`admin/dishes/${id}/`, 'PATCH', dishData);
export const patchDish = (id, dishData) => apiService(`admin/dishes/${id}/`, 'PATCH', dishData);
export const deleteDish = (id) => apiService(`admin/dishes/${id}/`, 'DELETE');

// Admin Categories
export const getCategories = () => apiService('admin/categories/', 'GET');
export const createCategory = (categoryData) => apiService('admin/categories/', 'POST', categoryData);
export const updateCategory = (id, categoryData) => apiService(`admin/categories/${id}/`, 'PATCH', categoryData);
export const patchCategory = (id, categoryData) => apiService(`admin/categories/${id}/`, 'PATCH', categoryData);
export const deleteCategory = (id) => apiService(`admin/categories/${id}/`, 'DELETE');

// Admin Orders
export const getOrders = () => apiService('admin/orders/', 'GET');
export const updateOrderStatus = (id, status) => apiService(`admin/orders/${id}/update_status/`, 'PATCH', { status });

// Admin Customers
export const getCustomers = () => apiService('admin/customers/', 'GET');

 