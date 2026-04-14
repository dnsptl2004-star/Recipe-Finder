import React, { useState } from 'react';
import axios from 'axios';
import './auth.css';

function Register({ onRegisterSuccess, onBack }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'teacher'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', form);
      if (res.data.success) {
        setMessage('✅ Registration successful!');
        setForm({ username: '', email: '', password: '', role: 'teacher' }); 
      } else {
        setMessage(res.data.message || '❌ Registration failed.');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage('❌ Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2 className="auth-title">📝 Register</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />



          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          
          <button 
            type="button" 
            className="btn-back" 
            onClick={onBack}
            style={{ marginTop: '10px', background: 'transparent', color: '#3f51b5', border: '1.5px solid #3f51b5' }}
          >
            ⬅ Back to Home
          </button>
        </form>
        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
}

export default Register;
