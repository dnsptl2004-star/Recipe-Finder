import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function AdminDashboard({ token, onBack }) {
  const [view, setView] = useState('users'); // 'users' or 'recipes'
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/recipes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (view === 'users') fetchUsers();
    else fetchRecipes();
  }, [view, fetchUsers, fetchRecipes]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== id));
      alert('User deleted');
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      await axios.put(`/api/admin/users/${id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
      alert('Role updated');
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await axios.delete(`/api/admin/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(recipes.filter(r => r._id !== id));
      alert('Recipe deleted');
    } catch (err) {
      alert('Failed to delete recipe');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <button className="btn btn-light" onClick={onBack}>⬅ Back</button>
        <h2>🛡 Admin Dashboard</h2>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${view === 'users' ? 'active' : ''}`} 
          onClick={() => setView('users')}
        >
          👥 Users
        </button>
        <button 
          className={`tab-btn ${view === 'recipes' ? 'active' : ''}`} 
          onClick={() => setView('recipes')}
        >
          🍳 Recipes
        </button>
      </div>

      {loading && <div className="spinner" />}
      {error && <p className="error">{error}</p>}

      <div className="admin-content">
        {view === 'users' ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <select 
                      value={u.role} 
                      onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                    >
                      <option value="learner">Learner</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn-icon delete" onClick={() => handleDeleteUser(u._id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Cuisine</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(r => (
                <tr key={r._id}>
                  <td>{r.title}</td>
                  <td>{r.cuisine}</td>
                  <td>{r.createdBy?.username || 'Unknown'}</td>
                  <td>
                    <button className="btn-icon delete" onClick={() => handleDeleteRecipe(r._id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
