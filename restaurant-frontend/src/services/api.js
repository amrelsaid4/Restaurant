const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Get CSRF token from cookies
const getCSRFToken = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return null;
};

const apiService = async (url, method = 'GET', data = null) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    const config = {
        method,
        headers,
        credentials: 'include', // Include cookies for session auth
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { detail: 'An unknown error occurred.' };
            }
            throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        if (response.status === 204) { // No Content
            return null;
        }
        
        const result = await response.json();
        
        // If the response is paginated (has 'results' field), return the results array
        // Otherwise return the full response
        if (result && typeof result === 'object' && result.results && Array.isArray(result.results)) {
            return result.results;
        }
        
        return result;
    } catch (error) {
        console.error('API service error:', error);
        throw error;
    }
};

// Admin Dishes (using admin endpoints)
export const getDishes = () => apiService('/admin/dishes/');
export const getDish = (id) => apiService(`/admin/dishes/${id}/`);
export const createDish = (dishData) => apiService('/admin/dishes/', 'POST', dishData);
export const updateDish = (id, dishData) => apiService(`/admin/dishes/${id}/`, 'PATCH', dishData);
export const patchDish = (id, dishData) => apiService(`/admin/dishes/${id}/`, 'PATCH', dishData);
export const deleteDish = (id) => apiService(`/admin/dishes/${id}/`, 'DELETE');

// Admin Categories (using admin endpoints)
export const getCategories = () => apiService('/admin/categories/');
export const createCategory = (categoryData) => apiService('/admin/categories/', 'POST', categoryData);
export const updateCategory = (id, categoryData) => apiService(`/admin/categories/${id}/`, 'PATCH', categoryData);
export const patchCategory = (id, categoryData) => apiService(`/admin/categories/${id}/`, 'PATCH', categoryData);
export const deleteCategory = (id) => apiService(`/admin/categories/${id}/`, 'DELETE');

// Admin Orders (using admin endpoints)
export const getOrders = () => apiService('/admin/orders/');
export const updateOrderStatus = (id, status) => apiService(`/admin/orders/${id}/update_status/`, 'PATCH', { status });

// Admin Customers (using admin endpoints)
export const getCustomers = () => apiService('/admin/customers/');

// Dashboard Stats (using admin endpoint)
export const getDashboardStats = () => apiService('/admin/dashboard/');

// Auth endpoints
export const loginAdmin = async (email, password) => {
    return apiService('/admin/login/', 'POST', { email, password });
};

export const checkUserType = async () => {
    return apiService('/check-user-type/', 'GET');
};

export const logoutUser = async () => {
    return apiService('/logout/', 'POST');
}; 