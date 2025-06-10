import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { showSuccess, showError } = useAlert();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Mock data
      setTimeout(() => {
        setCategories([
          {
            id: 1,
            name: 'Pizza',
            description: 'Delicious Italian pizza with fresh mozzarella and basil',
            is_active: true,
            dishes_count: 5,
            created_at: '2024-01-01T00:00:00'
          },
          {
            id: 2,
            name: 'Burgers',
            description: 'Tasty grilled burgers made to perfection with fresh toppings',
            is_active: true,
            dishes_count: 4,
            created_at: '2024-01-01T00:00:00'
          },
          {
            id: 3,
            name: 'Pasta',
            description: 'Italian pasta with homemade sauce and cheese',
            is_active: true,
            dishes_count: 3,
            created_at: '2024-01-01T00:00:00'
          },
          {
            id: 4,
            name: 'Beverages',
            description: 'Refreshing drinks and fresh juices and other beverages',
            is_active: true,
            dishes_count: 4,
            created_at: '2024-01-01T00:00:00'
          },
          {
            id: 5,
            name: 'Desserts',
            description: 'Delicious desserts to end your meal the right way',
            is_active: true,
            dishes_count: 3,
            created_at: '2024-01-01T00:00:00'
          },
          {
            id: 6,
            name: 'Salads',
            description: 'Fresh and healthy salad options',
            is_active: true,
            dishes_count: 2,
            created_at: '2024-01-01T00:00:00'
          },
          {
            id: 7,
            name: 'Appetizers',
            description: 'Perfect appetizers to start your meal',
            is_active: true,
            dishes_count: 2,
            created_at: '2024-01-01T00:00:00'
          }
        ]);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategories = categories.map(category =>
          category.id === editingCategory.id
            ? { ...category, ...formData }
            : category
        );
        setCategories(updatedCategories);
        showSuccess('Category has been updated successfully!', 'Updated!');
      } else {
        // Add new category
        const newCategory = {
          id: Date.now(),
          ...formData,
          dishes_count: 0,
          created_at: new Date().toISOString()
        };
        setCategories([...categories, newCategory]);
        showSuccess('New category has been added successfully!', 'Category Added!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      showError('Failed to save category. Please try again.', 'Save Failed');
    }
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

  const handleDelete = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category.dishes_count > 0) {
      showError('Cannot delete a category that contains dishes. Please delete the dishes first.', 'Delete Failed');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setCategories(categories.filter(category => category.id !== categoryId));
        showSuccess('Category has been deleted successfully!', 'Deleted!');
      } catch (error) {
        console.error('Error deleting category:', error);
        showError('Failed to delete category. Please try again.', 'Delete Failed');
      }
    }
  };

  const toggleActive = async (categoryId) => {
    try {
      const updatedCategories = categories.map(category =>
        category.id === categoryId ? { ...category, is_active: !category.is_active } : category
      );
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error updating category status:', error);
    }
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
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <div className="admin-sidebar">
        <div style={{ padding: '0 2rem' }}>
          <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>
            🛡️ Admin Panel
          </h3>
          
          <nav className="admin-nav">
            <Link to="/admin/dashboard" className="admin-nav-link">
              📊 Dashboard
            </Link>
            <Link to="/admin/orders" className="admin-nav-link">
              📋 Orders
            </Link>
            <Link to="/admin/dishes" className="admin-nav-link">
              🍕 Dishes
            </Link>
            <Link to="/admin/categories" className="admin-nav-link active">
              📂 Categories
            </Link>
            <Link to="/admin/customers" className="admin-nav-link">
              👥 Customers
            </Link>
            <Link to="/" className="admin-nav-link" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '2rem' }}>
              🏠 Back to Website
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-header" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--primary-orange)' }}>
                📂 Category Management
              </h1>
              <p style={{ color: 'var(--medium-gray)', fontSize: '1.1rem' }}>
                Organize and manage menu categories
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '❌ Cancel' : '➕ Add New Category'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Total Categories</div>
          </div>
          
          <div className="stat-card" style={{ borderLeftColor: 'var(--success-green)' }}>
            <div className="stat-value" style={{ color: 'var(--success-green)' }}>
              {categories.filter(c => c.is_active).length}
            </div>
            <div className="stat-label">Active Categories</div>
          </div>
          
          <div className="stat-card" style={{ borderLeftColor: 'var(--info-blue)' }}>
            <div className="stat-value" style={{ color: 'var(--info-blue)' }}>
              {categories.reduce((sum, c) => sum + c.dishes_count, 0)}
            </div>
            <div className="stat-label">Total Dishes</div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: 'var(--warning-orange)' }}>
            <div className="stat-value" style={{ color: 'var(--warning-orange)' }}>
              {Math.round(categories.reduce((sum, c) => sum + c.dishes_count, 0) / categories.length)}
            </div>
            <div className="stat-label">Average Dishes</div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <h3>{editingCategory ? '✏️ Edit Category' : '➕ Add New Category'}</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="Example: Pizza, Burgers, Beverages..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    placeholder="Brief description about this category..."
                  ></textarea>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    ✅ Active category (visible to customers)
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary">
                    {editingCategory ? '💾 Update' : '➕ Add'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {categories.map(category => (
            <div key={category.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--dark-charcoal)' }}>
                      📂 {category.name}
                    </h3>
                    <p style={{ color: 'var(--medium-gray)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                      {category.description}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      background: category.is_active ? 'var(--success-green)' : 'var(--danger-red)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {category.is_active ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'var(--primary-orange)', color: 'white' }}>
                    🍽️ {category.dishes_count} dishes
                  </span>
                  <span className="badge" style={{ background: 'var(--info-blue)', color: 'white' }}>
                    📅 {new Date(category.created_at).toLocaleDateString('en-US')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--primary-orange)' }}>
                    {category.name} Category
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(category)}
                    >
                      ✏️
                    </button>
                    <button 
                      className={`btn btn-sm ${category.is_active ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => toggleActive(category.id)}
                    >
                      {category.is_active ? '🚫' : '✅'}
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(category.id)}
                      disabled={category.dishes_count > 0}
                      title={category.dishes_count > 0 ? 'Cannot delete category with dishes' : 'Delete category'}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {category.dishes_count > 0 && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    background: 'var(--secondary-cream)', 
                    borderRadius: 'var(--border-radius)',
                    fontSize: '0.9rem',
                    color: 'var(--medium-gray)'
                  }}>
                    💡 This category contains {category.dishes_count} dishes. To delete it, you must delete the dishes first.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ color: 'var(--medium-gray)', marginBottom: '1rem' }}>
              📂 No Categories Found
            </h3>
            <p style={{ color: 'var(--medium-gray)', marginBottom: '2rem' }}>
              Start by adding your first category to organize the menu
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              ➕ Add New Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories; 