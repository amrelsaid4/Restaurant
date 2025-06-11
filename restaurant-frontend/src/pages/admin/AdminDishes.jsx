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
    is_available: true
  });

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
      setDishes(Array.isArray(dishesData) ? dishesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      showError('Could not load data from the server.', 'Loading Failed');
      setDishes([]);
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
    
    const processedFormData = {
      ...formData,
      price: parseFloat(formData.price),
      preparation_time: parseInt(formData.preparation_time, 10) || 0,
      calories: parseInt(formData.calories, 10) || 0,
      category_id: parseInt(formData.category_id, 10),
    };

    const action = async () => {
      try {
        if (editingDish) {
          await updateDish(editingDish.id, processedFormData);
          showSuccess('Dish has been updated successfully!', 'Updated!');
        } else {
          await createDish(processedFormData);
          showSuccess('New dish has been added successfully!', 'Dish Added!');
        }
        resetForm();
        await loadData();
      } catch (error) {
        console.error('Error saving dish:', error);
        showError(`Failed to save dish: ${error.message}`, 'Save Failed');
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
      is_available: true
    });
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
      is_available: dish.is_available
    });
    setShowAddForm(true);
  };

  const handleDelete = (dishId) => {
    const action = async () => {
      try {
        await deleteDish(dishId);
        showSuccess('Dish has been deleted successfully!', 'Deleted!');
        await loadData();
      } catch (error) {
        console.error('Error deleting dish:', error);
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
        setDishes(dishes.map(d =>
          d.id === dishId ? { ...d, is_available: !d.is_available } : d
        ));
        showSuccess('Dish availability updated!');
      } catch (error) {
        console.error('Error updating availability:', error);
        showError('Failed to update availability.');
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
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dishes...</p>
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
              <Link to="/admin/dishes" className="admin-nav-link active">
                🍕 Dishes
              </Link>
              <Link to="/admin/categories" className="admin-nav-link">
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
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--primary-orange)' }}>
              🍕 Dish Management
            </h1>
            <p style={{ color: 'var(--medium-gray)', fontSize: '1.1rem' }}>
              Add, edit and manage restaurant dishes
            </p>
          </div>

          {/* Add Button */}
          <div style={{ marginBottom: '2rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '❌ Cancel' : '➕ Add New Dish'}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div className="card-body">
                <h3 style={{ marginBottom: '1.5rem' }}>
                  {editingDish ? '✏️ Edit Dish' : '➕ Add New Dish'}
                </h3>
                
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Dish Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Category *
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                        required
                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }}
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Preparation Time (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.preparation_time}
                        onChange={(e) => setFormData({...formData, preparation_time: e.target.value})}
                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Calories
                      </label>
                      <input
                        type="number"
                        value={formData.calories}
                        onChange={(e) => setFormData({...formData, calories: e.target.value})}
                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Ingredients
                    </label>
                    <textarea
                      value={formData.ingredients}
                      onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                      rows="2"
                      placeholder="List ingredients separated by commas"
                      style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.is_vegetarian}
                        onChange={(e) => setFormData({...formData, is_vegetarian: e.target.checked})}
                      />
                      🌱 Vegetarian
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.is_spicy}
                        onChange={(e) => setFormData({...formData, is_spicy: e.target.checked})}
                      />
                      🌶️ Spicy
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.is_available}
                        onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                      />
                      ✅ Available
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary">
                      {editingDish ? '💾 Update Dish' : '➕ Add Dish'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Dishes List */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {dishes.map(dish => (
              <div key={dish.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', color: 'var(--dark-charcoal)' }}>
                        {dish.name}
                      </h3>
                      <p style={{ color: 'var(--medium-gray)', marginBottom: '1rem' }}>
                        {dish.description}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span style={{ background: 'var(--light-background)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>
                          📂 {dish.category.name}
                        </span>
                        <span style={{ background: 'var(--success-green)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>
                          💰 ${dish.price}
                        </span>
                        <span style={{ background: 'var(--info-blue)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>
                          ⏱️ {dish.preparation_time} min
                        </span>
                        {dish.calories && (
                          <span style={{ background: 'var(--warning-orange)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>
                            🔥 {dish.calories} cal
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {dish.is_vegetarian && (
                          <span style={{ background: 'var(--success-green)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                            🌱 Vegetarian
                          </span>
                        )}
                        {dish.is_spicy && (
                          <span style={{ background: 'var(--danger-red)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                            🌶️ Spicy
                          </span>
                        )}
                        <span style={{ 
                          background: dish.is_available ? 'var(--success-green)' : 'var(--medium-gray)', 
                          color: 'white', 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '10px', 
                          fontSize: '0.8rem' 
                        }}>
                          {dish.is_available ? '✅ Available' : '❌ Unavailable'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(dish)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-sm"
                        style={{ 
                          background: dish.is_available ? 'var(--warning-orange)' : 'var(--success-green)',
                          color: 'white'
                        }}
                        onClick={() => toggleAvailability(dish.id)}
                      >
                        {dish.is_available ? '🚫 Disable' : '✅ Enable'}
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(dish.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {dishes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--medium-gray)' }}>
              <h3>No dishes found</h3>
              <p>Start by adding your first dish!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDishes; 