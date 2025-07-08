import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import { getDishes, getCategories, createDish, updateDish, patchDish, deleteDish } from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const { showSuccess, showError } = useAlert();

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    preparation_time: '',
    ingredients: '',
    calories: '',
    is_spicy: false,
    is_vegetarian: false,
    is_available: true,
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dishesData, categoriesData] = await Promise.all([
        getDishes(),
        getCategories()
      ]);
      const dishesArray = dishesData.results ? dishesData.results : (Array.isArray(dishesData) ? dishesData : []);
      const categoriesArray = categoriesData.results ? categoriesData.results : (Array.isArray(categoriesData) ? categoriesData : []);
      setDishes(dishesArray);
      setCategories(categoriesArray);
    } catch (error) {
      showError('Could not load data from the server.', 'Loading Failed');
      setDishes([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (modalState.onConfirm) {
    await modalState.onConfirm();
    }
    setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, image: file});
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setImagePreview(null);
  };

  const removeImage = () => {
    setFormData({...formData, image: null});
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const action = async () => {
      try {
        const submitData = new FormData();
        
        // Append all fields except the image
        Object.keys(formData).forEach(key => {
          if (key !== 'image' && key !== 'category_id') {
            submitData.append(key, formData[key]);
          }
        });

        // Special handling for category_id
        if (formData.category_id) {
        submitData.append('category_id', parseInt(formData.category_id, 10));
        }
        
        // Handle image update only if a new file is selected
        if (formData.image instanceof File) {
          submitData.append('image', formData.image);
        }

        if (editingDish) {
          // For updates, we use PATCH to send only changed fields.
          // Note: `updateDish` should ideally be a PATCH request for this to work perfectly with FormData.
          // Assuming `updateDish` handles FormData correctly with PUT/PATCH.
          await updateDish(editingDish.id, submitData);
          showSuccess('Dish has been updated successfully!', 'Updated!');
        } else {
          await createDish(submitData);
          showSuccess('New dish has been added successfully!', 'Dish Added!');
        }
        resetForm();
        await loadData();
      } catch (error) {
        const errorMessage = error.response?.data 
          ? Object.values(error.response.data).join(' ') 
          : error.message;
        showError(`Failed to save dish: ${errorMessage}`, 'Save Failed');
      }
    };

    setModalState({
      isOpen: true,
      title: editingDish ? 'Confirm Update' : 'Confirm Add',
      message: `Are you sure you want to ${editingDish ? 'update this' : 'add this new'} dish?`,
      onConfirm: action
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      preparation_time: '',
      ingredients: '',
      calories: '',
      is_spicy: false,
      is_vegetarian: false,
      is_available: true,
      image: null
    });
    setImagePreview(null);
    setShowAddForm(false);
    setEditingDish(null);
  };

  const handleEdit = (dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price,
      category_id: dish.category.id,
      preparation_time: dish.preparation_time,
      ingredients: dish.ingredients || '',
      calories: dish.calories,
      is_spicy: dish.is_spicy,
      is_vegetarian: dish.is_vegetarian,
      is_available: dish.is_available,
      image: null
    });
    setImagePreview(dish.image || null);
    setShowAddForm(true);
  };

  const handleDelete = (dishId) => {
    const action = async () => {
      try {
        await deleteDish(dishId);
        showSuccess('Dish has been deleted successfully!', 'Deleted!');
        await loadData();
      } catch (error) {
        showError(`Failed to delete dish: ${error.message}`, 'Delete Failed');
      }
    };

    setModalState({
      isOpen: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this dish? This action cannot be undone.',
      onConfirm: action
    });
  };

  const toggleAvailability = (dishId) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return;

    const action = async () => {
      try {
        await patchDish(dishId, { is_available: !dish.is_available });
        // Optimistic UI update
        const updatedDishes = dishes.map(d =>
          d.id === dishId ? { ...d, is_available: !d.is_available } : d
        );
        setDishes(updatedDishes);
        showSuccess('Dish availability updated successfully!');
      } catch (error) {
        showError('Failed to update availability.');
        // Revert UI on error
        loadData();
      }
    };
    
    setModalState({
        isOpen: true,
        title: 'Confirm Availability Change',
        message: `Are you sure you want to ${dish.is_available ? 'disable' : 'enable'} this dish?`,
        onConfirm: action
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        title={modalState.title}
      >
        <p>{modalState.message}</p>
      </ConfirmModal>

      <div className="min-h-screen bg-gray-50">
        {/* Admin Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold text-orange-600">
                  Restaurant Admin
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/admin/dashboard" 
                  className="text-gray-600 hover:text-orange-600 px-3 py-2 transition-colors"
                >
                Dashboard
              </Link>
                <Link 
                  to="/admin/orders" 
                  className="text-gray-600 hover:text-orange-600 px-3 py-2 transition-colors"
                >
                Orders
              </Link>
                <Link 
                  to="/admin/dishes" 
                  className="text-orange-600 border-b-2 border-orange-600 px-3 py-2"
                >
                  Menu
              </Link>
                <Link 
                  to="/admin/categories" 
                  className="text-gray-600 hover:text-orange-600 px-3 py-2 transition-colors"
                >
                Categories
              </Link>
                <Link 
                  to="/admin/customers" 
                  className="text-gray-600 hover:text-orange-600 px-3 py-2 transition-colors"
                >
                Customers
              </Link>
                <Link 
                  to="/" 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  View Website
              </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Menu Management
            </h1>
              <p className="text-gray-600 mt-2">
              Add, edit and manage restaurant dishes
            </p>
          </div>
            <button 
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                showAddForm 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : 'Add New Dish'}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {editingDish ? 'Edit Dish' : 'Add New Dish'}
                </h3>
                
                <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dish Name *
                      </label>
                      <input
                        type="text"
                      name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                      name="price"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                      name="category_id"
                        value={formData.category_id}
                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                        required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preparation Time (minutes)
                      </label>
                      <input
                        type="number"
                      name="preparation_time"
                        value={formData.preparation_time}
                        onChange={(e) => setFormData({...formData, preparation_time: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                    name="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dish Image
                    </label>
                    
                  <div className="flex gap-6">
                    {imagePreview && (
                      <div className="relative">
                            <img 
                              src={imagePreview} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                            <button
                              type="button"
                              onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                        >
                          ×
                            </button>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          className="hidden"
                          id="dish-image"
                        />
                        <label htmlFor="dish-image" className="cursor-pointer">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </label>
                      </div>
                      </div>
                    </div>
                  </div>

                <div className="flex gap-6 mb-6">
                  <label className="flex items-center">
                      <input
                        type="checkbox"
                      name="is_vegetarian"
                        checked={formData.is_vegetarian}
                        onChange={(e) => setFormData({...formData, is_vegetarian: e.target.checked})}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    <span className="ml-2 text-sm text-gray-700">Vegetarian</span>
                    </label>

                  <label className="flex items-center">
                      <input
                        type="checkbox"
                      name="is_spicy"
                        checked={formData.is_spicy}
                        onChange={(e) => setFormData({...formData, is_spicy: e.target.checked})}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    <span className="ml-2 text-sm text-gray-700">Spicy</span>
                    </label>

                  <label className="flex items-center">
                      <input
                        type="checkbox"
                      name="is_available"
                        checked={formData.is_available}
                        onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    <span className="ml-2 text-sm text-gray-700">Available</span>
                    </label>
                  </div>

                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingDish ? 'Update Dish' : 'Add Dish'}
                    </button>
                  <button 
                    type="button" 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors" 
                    onClick={resetForm}
                  >
                    Cancel
                    </button>
                  </div>
                </form>
            </div>
          )}

          {/* Dishes List */}
          <div className="space-y-6">
            {dishes.map(dish => (
              <div key={dish.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Dish Image */}
                  <div className="lg:w-48">
                    <img 
                      src={dish.image && dish.image.startsWith('http') 
                        ? dish.image 
                        : dish.image 
                        ? `http://127.0.0.1:8000${dish.image}` 
                        : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&q=80'
                      }
                      alt={dish.name}
                      className="w-full h-32 lg:h-40 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=480&q=80';
                      }}
                    />
                  </div>

                  {/* Dish Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {dish.name}
                      </h3>
                        <p className="text-gray-600 mb-3">
                        {dish.description}
                      </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          ${dish.price}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dish.is_available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {dish.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {dish.category.name}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {dish.preparation_time} min
                      </span>
                        {dish.is_vegetarian && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          Vegetarian
                          </span>
                        )}
                        {dish.is_spicy && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                          Spicy
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => handleEdit(dish)}
                      >
                        Edit
                      </button>
                      <button 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          dish.is_available 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        onClick={() => toggleAvailability(dish.id)}
                      >
                        {dish.is_available ? 'Disable' : 'Enable'}
                      </button>
                      <button 
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => handleDelete(dish.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {dishes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No dishes found</h3>
              <p className="text-gray-600">Start by adding your first dish!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDishes; 