import React, { useState } from 'react';
import axios from 'axios';
import './auth.css';

function Login({ onLoginSuccess, onBack }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', form);
      const { token, user } = res.data; 
      if (onLoginSuccess) {
        onLoginSuccess(token, user); 
      }

      setMessage(`✅ Logged in successfully as ${user.role.toUpperCase()}!`);
    } catch (err) {
      console.error(err);
      setMessage('❌ Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2 className="auth-title">🔐 Login</h2>
        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
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

export default Login;
