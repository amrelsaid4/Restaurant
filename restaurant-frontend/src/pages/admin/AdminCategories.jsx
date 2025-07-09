import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import { getCategories, createCategory, updateCategory, patchCategory, deleteCategory } from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
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
    is_active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      // Handle paginated response from DRF
      const categoriesArray = data.results ? data.results : (Array.isArray(data) ? data : []);
      setCategories(categoriesArray);
    } catch (error) {
      showError('Failed to load categories.', 'Loading Failed');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    await modalState.onConfirm();
    setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const action = async () => {
        try {
          if (editingCategory) {
            await updateCategory(editingCategory.id, formData);
            showSuccess('Category has been updated successfully!', 'Updated!');
          } else {
            await createCategory(formData);
            showSuccess('New category has been added successfully!', 'Category Added!');
          }
          resetForm();
          await loadCategories();
        } catch (error) {
          showError(`Failed to save category: ${error.message}`, 'Save Failed');
        }
    };
    
    setModalState({
        isOpen: true,
        title: editingCategory ? 'Confirm Update' : 'Confirm Add',
        message: `Are you sure you want to ${editingCategory ? 'update this' : 'add this new'} category?`,
        onConfirm: action
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true
    });
    setShowAddForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      is_active: category.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category.dishes_count > 0) {
      showError('Cannot delete a category that contains dishes. Please delete the dishes first.', 'Delete Failed');
      return;
    }

    const action = async () => {
        try {
          await deleteCategory(categoryId);
          showSuccess('Category has been deleted successfully!', 'Deleted!');
          await loadCategories();
        } catch (error) {
          showError(`Failed to delete category: ${error.message}`, 'Delete Failed');
        }
    };
    
    setModalState({
        isOpen: true,
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this category? This is irreversible.',
        onConfirm: action
    });
  };

  const toggleActive = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const action = async () => {
        try {
          await patchCategory(categoryId, { is_active: !category.is_active });
          setCategories(categories.map(c =>
            c.id === categoryId ? { ...c, is_active: !c.is_active } : c
          ));
          showSuccess('Category status updated successfully!');
        } catch (error) {
          showError('Failed to update category status.');
        }
    };

    setModalState({
        isOpen: true,
        title: 'Confirm Status Change',
        message: `Are you sure you want to ${category.is_active ? 'deactivate' : 'activate'} this category?`,
        onConfirm: action
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading categories...</p>
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
        <AdminNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
              <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Category Management
                </h1>
              <p className="text-gray-600 mt-2">
                  Organize and manage menu categories
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
              {showAddForm ? 'Cancel' : 'Add New Category'}
              </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-3xl font-bold text-gray-900">{categories.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Categories</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-3xl font-bold text-green-600">
                {categories.filter(c => c.is_active).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Active Categories</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-3xl font-bold text-blue-600">
                {categories.reduce((sum, c) => sum + (c.dishes_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Dishes</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-3xl font-bold text-orange-600">
                {categories.length > 0 ? Math.round(categories.reduce((sum, c) => sum + (c.dishes_count || 0), 0) / categories.length) : 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Average Dishes</div>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              
                <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        placeholder="Example: Pizza, Burgers, Beverages..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    rows="3"
                      placeholder="Brief description about this category..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  </div>

                <div className="mb-6">
                  <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    <span className="ml-2 text-sm text-gray-700">Active category (visible to customers)</span>
                    </label>
                  </div>

                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingCategory ? 'Update Category' : 'Add Category'}
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

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {category.name}
                      </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                    
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                  </div>

                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {category.dishes_count || 0} dishes
                    </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {new Date(category.created_at).toLocaleDateString('en-US')}
                    </span>
                  </div>

                <div className="flex gap-2">
                      <button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => handleEdit(category)}
                      >
                    Edit
                      </button>
                      <button 
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category.is_active 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                        onClick={() => toggleActive(category.id)}
                      >
                    {category.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button 
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleDelete(category.id)}
                        disabled={(category.dishes_count || 0) > 0}
                        title={(category.dishes_count || 0) > 0 ? 'Cannot delete category with dishes' : 'Delete category'}
                      >
                    Delete
                      </button>
                    </div>

                  {(category.dishes_count || 0) > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      This category contains {category.dishes_count || 0} dishes. To delete it, you must delete the dishes first.
                    </p>
                    </div>
                  )}
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">Start by adding your first category to organize the menu</p>
              <button 
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                onClick={() => setShowAddForm(true)}
              >
                Add New Category
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminCategories; 