import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import './auth.css';
import Login from './Login';
import Register from './Register';
import AdminDashboard from './AdminDashboard';
import ReactMarkdown from 'react-markdown';

// In production (Vercel), frontend & backend share the same domain → use relative URLs.
// In local dev, REACT_APP_API_URL points to http://localhost:5000.
const API_URL = (process.env.REACT_APP_API_URL || 'https://recipe-app-main-copy-3.vercel.app').replace(/\/$/, '');
axios.defaults.baseURL = API_URL;

function App() {
  const [searchName, setSearchName] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('home');
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');

  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiBox, setShowAiBox] = useState(false);

  const [feedbackRating, setFeedbackRating] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editRating, setEditRating] = useState('');
  const [editComment, setEditComment] = useState('');
  const [selectedServes, setSelectedServes] = useState(1);

  const [newRecipe, setNewRecipe] = useState({
    title: '',
    cuisine: '',
    time: '',
    difficulty: '',
    ingredients: '',
    instructions: '',
    serves: '',
    language: 'ગુજરાતી',
    image: '',
    video: 'NO'
  });

  const [listeningField, setListeningField] = useState(null);
  const recognitionRef = useRef(null);

  const startVoiceInput = (fieldName) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('❌ Your browser does not support voice recognition.');

    // Toggle off if already listening to this field
    if (listeningField === fieldName) {
      setListeningField(null);
      if (recognitionRef.current) {
        // Detach onend so it doesn't try to restart
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      return;
    }

    // Stop any existing recognition first
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'gu-IN';
    recognition.interimResults = false;
    recognition.continuous = true;

    setListeningField(fieldName);
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results
        .filter(r => r.isFinal)
        .map(r => r[0].transcript)
        .join(' ');
      if (transcript) {
        setNewRecipe(prev => ({
          ...prev,
          [fieldName]: prev[fieldName] ? `${prev[fieldName]}, ${transcript}` : transcript
        }));
      }
    };

    recognition.onend = () => {
      // If browser forced stop (pause), restart it automatically to keep continuous listening!
      if (recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Restart failed', e);
          recognitionRef.current = null;
          setListeningField(null);
        }
      }
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') {
         console.error('Voice error:', e.error);
         recognitionRef.current = null;
         setListeningField(null);
      }
    };

    try {
      recognition.start();
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    axios
      .get('/api/recipes/list')
      .then(res => setAvailableRecipes(res.data.data || []))
      .catch(err => console.error('Error loading recipes:', err.message));
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    const savedRole = localStorage.getItem('role');
    const savedUserId = localStorage.getItem('userId');

    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUser || 'User');
      setRole(savedRole || 'student');
      setUserId(savedUserId || '');
    }
  }, []);

  const handleEditRecipe = (recipeData) => {
    setNewRecipe({
      title: recipeData.title || '',
      cuisine: recipeData.cuisine || '',
      time: recipeData.time || '',
      difficulty: recipeData.difficulty || '',
      ingredients: recipeData.ingredients?.join(', ') || '',
      instructions: Array.isArray(recipeData.instructions)
        ? recipeData.instructions.join('\n')
        : recipeData.instructions || '',
      serves: recipeData.serves || '',
      language: recipeData.language || 'ગુજરાતી',
      image: recipeData.image || '',
      video: recipeData.video || ''
    });
    setRecipe(recipeData);
    setView('create');
  };

  const handleLoginSuccess = (receivedToken, user) => {
    setToken(receivedToken);
    setUsername(user.username || 'User');
    setRole(user.role || 'student');
    setUserId(user._id);

    localStorage.setItem('token', receivedToken);
    localStorage.setItem('username', user.username || 'User');
    localStorage.setItem('role', user.role || 'student');
    localStorage.setItem('userId', user._id);
    setView('home');
  };

  const handleLogout = () => {
    setToken('');
    setUsername('');
    setRole('');
    setUserId('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setView('home');
    setRecipe(null);
  };

  const handleSearch = async e => {
    e.preventDefault();
    if (!token) return setView('register');
    if (!searchName.trim()) return setError('⚠️ Please enter or select a recipe name.');

    setLoading(true);
    setError('');
    setRecipe(null);

    try {
      const res = await axios.get(
        `/api/recipes/search?name=${encodeURIComponent(searchName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedRecipe = res.data?.data;

      if (!fetchedRecipe) {
        setError('❌ Recipe not found.');
      } else {
        if (!fetchedRecipe._id && fetchedRecipe.id) fetchedRecipe._id = fetchedRecipe.id;
        setRecipe(fetchedRecipe);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Server error';
      setError(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async e => {
    e.preventDefault();
    if (!recipe || (!recipe._id && !recipe.id)) return alert('⚠️ No recipe selected.');
    if (!feedbackRating || !feedbackComment.trim())
      return alert('⚠️ Provide both rating and comment.');

    const recipeId = recipe._id || recipe.id;

    try {
      const res = await axios.post(
        `/api/recipes/${recipeId}/feedbacks`,
        { rating: Number(feedbackRating), comment: feedbackComment.trim() },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (res.data?.feedbacks) {
        setRecipe(prev => ({ ...prev, feedback: res.data.feedbacks }));
      }

      setFeedbackRating('');
      setFeedbackComment('');
      alert('✅ Feedback submitted successfully!');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Server error';
      alert(`❌ ${message}`);
    }
  };

  const handleFeedbackUpdate = async feedbackId => {
    if (!editRating || !editComment.trim())
      return alert('⚠️ Provide both rating and comment.');

    const recipeId = recipe._id || recipe.id;

    try {
      const res = await axios.put(
        `/api/recipes/${recipeId}/feedbacks/${feedbackId}`,
        { rating: Number(editRating), comment: editComment.trim() },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (res.data?.feedbacks) {
        setRecipe(prev => ({ ...prev, feedback: res.data.feedbacks }));
      }

      setEditingFeedbackId(null);
      setEditRating('');
      setEditComment('');
      alert('✅ Feedback updated successfully!');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Server error';
      alert(`❌ ${message}`);
    }
  };

  const handleFeedbackDelete = async feedbackId => {
    if (!window.confirm('🗑 Are you sure you want to delete this feedback?')) return;
    const recipeId = recipe._id || recipe.id;

    try {
      const res = await axios.delete(
        `/api/recipes/${recipeId}/feedbacks/${feedbackId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.feedbacks) {
        setRecipe(prev => ({ ...prev, feedback: res.data.feedbacks }));
      }

      alert('✅ Feedback deleted successfully!');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Server error';
      alert(`❌ ${message}`);
    }
  };

  const handleCreateRecipe = async e => {
    e.preventDefault();
    if (!token) return alert('❌ Please login first.');
    if (!userId) return alert('❌ Invalid user. Please login again.');

    try {
      const payload = {
        userId,
        title: newRecipe.title,
        cuisine: newRecipe.cuisine || 'ગુજરાતી',
        time: newRecipe.time || '30 minutes',
        difficulty: newRecipe.difficulty || 'Easy',
        serves: newRecipe.serves || '4',
        language: newRecipe.language || 'ગુજરાતી',
        image: newRecipe.image || '',
        video: newRecipe.video || 'NO',
        ingredients: (newRecipe.ingredients || 'As needed').split(',').map(i => i.trim()).filter(i => i !== ''),
        instructions: (newRecipe.instructions || 'Cook as per preference.').split('\n').map(i => i.trim()).filter(i => i !== '')
      };

      if (!payload.title) {
        return alert('⚠️ Please enter the recipe name (Title is required).');
      }

      if (recipe && recipe._id) {
        const res = await axios.put(
          `/api/recipes/${recipe._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        alert('✅ Recipe updated successfully!');
        setAvailableRecipes((prev) =>
          prev.map((r) => (r._id === recipe._id ? res.data.data : r))
        );
      } else {
        const res = await axios.post(
          '/api/recipes',
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        alert('✅ Recipe created successfully!');
        setAvailableRecipes(prev => [...prev, res.data?.data]);
      }

      setNewRecipe({
        title: '',
        cuisine: '',
        time: '',
        difficulty: '',
        ingredients: '',
        instructions: '',
        serves: '',
        language: 'ગુજરાતી',
        image: '',
        video: 'NO'
      });
      setRecipe(null);
      setView('home');
    } catch (err) {
      const message = err.response?.status === 413
        ? '❌ Recipe data too large for Vercel (Total must be under 4.5MB). Try smaller images or use a YouTube link for videos.'
        : (err.response?.data?.message || err.message || 'Server error');
      alert(`❌ ${message}`);
    }
  };

  // --- replace the existing handleSubmit with this ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = (aiQuestion || '').trim();
    if (!q) return alert('⚠️ Please enter a question.');

    setAiLoading(true);
    setAiAnswer('');
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      // Use relative axios post which will use axios.defaults.baseURL
      const res = await axios.post(
        '/api/ai/ask',
        { question: q },
        { headers, timeout: 20000 }
      );

      if (res?.data?.answer) {
        setAiAnswer(String(res.data.answer));
      } else if (res?.data?.error) {
        setAiAnswer(`❌ ${res.data.error}`);
      } else {
        setAiAnswer('No response from AI.');
      }
    } catch (err) {
      console.error('AI request failed:', err);
      const msg = err?.response?.data?.error || err?.message || '❌ Failed to fetch AI response.';
      setAiAnswer(String(msg));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <h1 className="brand">🍳 Recipe Finder</h1>
        <div className="nav-buttons">
          {token ? (
            <>
              {role === 'admin' && (
                <button className="btn" onClick={() => setView('admin')}>
                  🛡 Admin Panel
                </button>
              )}
              {role === 'teacher' && (
                <button className="btn" onClick={() => setView('create')}>
                  ➕ Create Recipe
                </button>
              )}
              <button className="btn" onClick={handleLogout}>🚪 Logout</button>
              <span className="username">👤 {username}</span>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setView('login')}>
                🔐 Login
              </button>
              <button className="btn" onClick={() => setView('register')}>
                📝 Register
              </button>
            </>
          )}
        </div>
      </header>

      {view === 'admin' && role === 'admin' && (
        <AdminDashboard 
          token={token} 
          onBack={() => setView('home')} 
        />
      )}

      {view === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onBack={() => setView('home')} 
        />
      )}
      {view === 'register' && (
        <Register 
          onRegisterSuccess={() => setView('login')} 
          onBack={() => setView('home')} 
        />
      )}

      {view === 'create' && (
        <form className="create-form" onSubmit={handleCreateRecipe}>
          <h2>➕ Create Recipe</h2>

          <div className="voice-input-group">
            <input type="text" placeholder="Title (રેસીપીનું નામ)" value={newRecipe.title}
              onChange={e => setNewRecipe({ ...newRecipe, title: e.target.value })} required />
            <button type="button" className={`btn-mic ${listeningField === 'title' ? 'listening' : ''}`} 
              onClick={() => startVoiceInput('title')} title="Speak in Gujarati">
              {listeningField === 'title' ? '🛑' : '🎙️'}
            </button>
          </div>

          <div className="voice-input-group">
            <input type="text" placeholder="Cuisine (default: ગુજરાતી)" value={newRecipe.cuisine}
              onChange={e => setNewRecipe({ ...newRecipe, cuisine: e.target.value })} />
            <button type="button" className={`btn-mic ${listeningField === 'cuisine' ? 'listening' : ''}`}
              onClick={() => startVoiceInput('cuisine')} title="Speak in Gujarati">
              {listeningField === 'cuisine' ? '🛑' : '🎙️'}
            </button>
          </div>

          <div className="voice-input-group">
            <input type="text" placeholder="Time (default: 30 minutes)" value={newRecipe.time}
              onChange={e => setNewRecipe({ ...newRecipe, time: e.target.value })} />
            <button type="button" className={`btn-mic ${listeningField === 'time' ? 'listening' : ''}`}
              onClick={() => startVoiceInput('time')} title="Speak in Gujarati">
              {listeningField === 'time' ? '🛑' : '🎙️'}
            </button>
          </div>

          <div className="voice-input-group">
            <input type="text" placeholder="Difficulty (મુશ્કેલી સ્તર)" value={newRecipe.difficulty}
              onChange={e => setNewRecipe({ ...newRecipe, difficulty: e.target.value })} />
            <button type="button" className={`btn-mic ${listeningField === 'difficulty' ? 'listening' : ''}`}
              onClick={() => startVoiceInput('difficulty')} title="Speak in Gujarati">
              {listeningField === 'difficulty' ? '🛑' : '🎙️'}
            </button>
          </div>

          <div className="voice-input-group">
            <textarea placeholder="Ingredients (default: As needed — separate with comma)" value={newRecipe.ingredients}
              onChange={e => setNewRecipe({ ...newRecipe, ingredients: e.target.value })} />
            <button type="button" className={`btn-mic ${listeningField === 'ingredients' ? 'listening' : ''}`}
              onClick={() => startVoiceInput('ingredients')} title="Speak in Gujarati">
              {listeningField === 'ingredients' ? '🛑' : '🎙️'}
            </button>
          </div>

          <div className="voice-input-group">
            <textarea placeholder="Instructions (default: Cook as per preference — one step per line)" value={newRecipe.instructions}
              onChange={e => setNewRecipe({ ...newRecipe, instructions: e.target.value })} />
            <button type="button" className={`btn-mic ${listeningField === 'instructions' ? 'listening' : ''}`}
              onClick={() => startVoiceInput('instructions')} title="Speak in Gujarati">
              {listeningField === 'instructions' ? '🛑' : '🎙️'}
            </button>
          </div>

          <div className="voice-input-group">
            <input type="text" placeholder="Serves (default: 4)" value={newRecipe.serves}
              onChange={e => setNewRecipe({ ...newRecipe, serves: e.target.value })} />
            <button type="button" className={`btn-mic ${listeningField === 'serves' ? 'listening' : ''}`}
              onClick={() => startVoiceInput('serves')} title="Speak in Gujarati">
              {listeningField === 'serves' ? '🛑' : '🎙️'}
            </button>
          </div>

          <div className="voice-input-group">
            <select
              value={newRecipe.language || 'ગુજરાતી'}
              onChange={e => setNewRecipe({ ...newRecipe, language: e.target.value })}
              className="search-select"
              required
            >
              <option value="ગુજરાતી">ગુજરાતી (Gujarati)</option>
              <option value="en">English (en)</option>
              <option value="hi">Hindi (hi)</option>
            </select>
          </div>

          {/* Input for image URL */}
          <input
            type="text"
            placeholder="Image URL (ફોટો લિંક)"
            value={newRecipe.image}
            onChange={(e) => setNewRecipe({ ...newRecipe, image: e.target.value })}
          />

          {/* Label and input for file upload */}
          <label className="upload-label">📁 Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              if (file.size > 3 * 1024 * 1024) {
                 return alert('⚠️ Image too large! Max 3MB recommended for Vercel. Please compress it or use a smaller file.');
              }

              const formData = new FormData();
              formData.append('image', file);

              try {
                const res = await axios.post('/api/upload/image', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.data?.success) {
                  const finalUrl = res.data.url.startsWith('data:') ? res.data.url : `${API_URL}${res.data.url}`;
                  setNewRecipe({ ...newRecipe, image: finalUrl });
                  alert('🖼 Image uploaded successfully!');
                } else {
                  alert('❌ Image upload failed: ' + (res.data?.message || 'Invalid server response'));
                }
              } catch (err) {
                const msg = err.response?.status === 413
                  ? '❌ Image too large for Vercel (4.5MB limit). Please use a compressed image.'
                  : (err.response?.data?.message || err.message);
                alert('❌ Error uploading image: ' + msg);
              }
            }}
          />

          {newRecipe.image && (
            <div className="preview-media">
              <img src={newRecipe.image} alt="Preview" style={{ maxWidth: '100%', borderRadius: '12px' }} />
              <button type="button" className="btn btn-light" onClick={() => setNewRecipe({ ...newRecipe, image: '' })}>🗑 Remove Image</button>
            </div>
          )}

          <input
            type="text"
            placeholder="Video URL (વિડિઓ લિંક)"
            value={newRecipe.video}
            onChange={e => setNewRecipe({ ...newRecipe, video: e.target.value })}
          />

          <label className="upload-label">Upload Video</label>
          <input
            type="file"
            accept="video/mp4,video/webm"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              if (file.size > 3 * 1024 * 1024) {
                 return alert('⚠️ Video too large! Max 3MB for direct uploads on Vercel. Please use a YouTube link for larger videos.');
              }

              const formData = new FormData();
              formData.append('video', file);

              try {
                const res = await axios.post('/api/upload/video', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.data?.success) {
                  const finalUrl = res.data.url.startsWith('data:') ? res.data.url : `${API_URL}${res.data.url}`;
                  setNewRecipe({ ...newRecipe, video: finalUrl });
                  alert('🎥 Video uploaded successfully!');
                } else {
                  alert('❌ Video upload failed: ' + (res.data?.message || 'Invalid server response'));
                }
              } catch (err) {
                const msg = err.response?.status === 413
                  ? '❌ Video too large for Vercel (4.5MB limit). Please use a YouTube link for this video.'
                  : (err.response?.data?.message || err.message);
                alert('❌ Error uploading video: ' + msg);
              }
            }}
          />

          {newRecipe.video && newRecipe.video !== 'NO' && (
            <div className="preview-media">
              <video src={newRecipe.video} controls style={{ maxWidth: '100%', borderRadius: '12px' }} />
              <button type="button" className="btn btn-light" onClick={() => setNewRecipe({ ...newRecipe, video: 'NO' })}>🗑 Remove Video</button>
            </div>
          )}

          <button type="submit" className="btn btn-create">✅ Save Recipe</button>
          <button type="button" className="btn btn-light" onClick={() => setView('home')}>❌ Cancel</button>
        </form>
      )}

      {view === 'home' && (
        <>
          <form onSubmit={handleSearch} className="search-form">

            <input
              type="text"
              placeholder="Enter food name"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className="search-input"
            />

            <select
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedRecipe = availableRecipes.find(r => r._id === selectedId);
                if (selectedRecipe) {
                  setSearchName(selectedRecipe.title);
                  setSelectedServes(selectedRecipe.serves || 1);
                } else {
                  setSearchName('');
                }
              }}
              className="search-select"
            >
              <option value="">— Select a recipe —</option>
              {availableRecipes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={selectedServes}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0) setSelectedServes(value);
              }}
              className="serves-input"
              title="Enter number of servings"
            />

            <button type="submit" className="btn btn-search">
              🔍 Search
            </button>
          </form>

          {!token && <p className="login-warning">🔒 You must login to search recipes.</p>}
          {loading && <div className="spinner" />}
          {error && <p className="error">{error}</p>}

          {recipe && (
            <article className="recipe-card">

              <div className="recipe-header">
                {role === 'teacher' && (
                  <div className="recipe-actions">
                    <button
                      className="icon-btn"
                      onClick={() => handleEditRecipe(recipe)}
                      title="Edit Recipe"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>

              <h2 className="premium-title">{recipe.title}</h2>
              <div className="recipe-hero">
                <img
                  src={recipe.image || 'https://via.placeholder.com/200?text=No+Image'}
                  alt={recipe.title}
                  className="recipe-image"
                />
                <ul className="meta">
                  {recipe.cuisine && <li>🍱 Cuisine: {recipe.cuisine}</li>}
                  {recipe.time && <li>⏱ Time: {recipe.time}</li>}
                  {recipe.difficulty && <li>💡 Difficulty: {recipe.difficulty}</li>}
                </ul>
              </div>

              <section className="recipe-section">
                <h3>🥗 Ingredients</h3>

                {recipe.ingredients?.length ? (
                  <ul>
                    {recipe.ingredients.map((ing, i) => {
                      let updatedIng = ing;

                      const numberMatch = ing.match(/(\d+(\.\d+)?(\/\d+)?)/);
                      if (numberMatch) {
                        let original = numberMatch[0];

                        if (original.includes('/')) {
                          const [numerator, denominator] = original.split('/').map(Number);
                          original = numerator / denominator;
                        } else {
                          original = parseFloat(original) || 0;
                        }

                        const recipeServesMatch = String(recipe.serves || '').match(/(\d+)/);
                        const recipeServes = recipeServesMatch ? parseInt(recipeServesMatch[0], 10) : 1;

                        const scaledQty = (original * selectedServes) / (recipeServes || 1);

                        function decimalToFraction(decimal) {
                          const tolerance = 1.0E-6;
                          let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
                          let b = decimal;
                          if (decimal === 0) return '0';
                          do {
                            const a = Math.floor(b);
                            let temp = h1; h1 = a * h1 + h2; h2 = temp;
                            temp = k1; k1 = a * k1 + k2; k2 = temp;
                            b = 1 / (b - a);
                          } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

                          if (h1 > k1) {
                            const whole = Math.floor(h1 / k1);
                            const remainder = h1 % k1;
                            return remainder === 0 ? `${whole}` : `${whole} ${remainder}/${k1}`;
                          }

                          return k1 === 1 ? `${h1}` : `${h1}/${k1}`;
                        }

                        const fractionQty = decimalToFraction(scaledQty);

                        updatedIng = ing.replace(numberMatch[0], fractionQty);
                      }

                      return <li key={i}>{updatedIng}</li>;
                    })}
                  </ul>
                ) : (
                  <p>N/A</p>
                )}
              </section>

              <section className="recipe-section">
                <h3>📜 Instructions</h3>

                {Array.isArray(recipe.instructions) ? (
                  <div>
                    {recipe.instructions.map((step, i) => {
                      const updatedStep = step.replace(/(\d+)\s*મિનિટ/, (m, num) => {
                        const newTime = Math.ceil((num / (recipe.serves || 1)) * selectedServes);
                        return `${newTime} મિનિટ`;
                      });

                      return <p key={i}>{updatedStep}</p>;
                    })}

                    <p className="note">
                      🔍 વધુ સૂચનાઓ માટે “Ask AI for a Recipe” નો ઉપયોગ કરો.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p>{recipe.instructions || 'N/A'}</p>
                    <p className="note">
                      🔍 વધુ સૂચનાઓ માટે “Ask AI for a Recipe” નો ઉપયોગ કરો.
                    </p>
                  </div>
                )}
              </section>

              <section className="recipe-section">
                <h3>🍽 Serves</h3>

                  <div className="serves-container">
                  <label htmlFor="serves-input">કેટલા લોકો માટે બનાવવું છે?</label>
                  <input
                    id="serves-input"
                    type="number"
                    min="1"
                    value={selectedServes}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value > 0) setSelectedServes(value);
                    }}
                    className="serves-input-field"
                    title="Enter number of servings"
                  />
                </div>

                <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#333' }}>
                  {selectedServes} લોકો માટે
                </p>
              </section>

              <section className="recipe-section">
                <h3>🌍 Language</h3>
                <p>{recipe.language || 'en'}</p>
              </section>

              <section className="recipe-section">
                <h3>🎥 Video</h3>

                {recipe.video && recipe.video !== 'NO' ? (
                  (recipe.video.includes('youtu.be') || recipe.video.includes('watch?v=')) ? (
                    <iframe
                      width="100%"
                      height="315"
                      src={
                        recipe.video.includes('youtu.be')
                          ? `https://www.youtube.com/embed/${recipe.video.split('/').pop().split('?')[0]}`
                          : recipe.video.includes('watch?v=')
                          ? `https://www.youtube.com/embed/${recipe.video.split('watch?v=')[1].split('&')[0]}`
                          : recipe.video
                      }
                      title="Recipe Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      width="100%"
                      height="315"
                      controls
                      preload="metadata"
                      style={{ borderRadius: '12px', backgroundColor: '#000' }}
                      src={recipe.video}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : (
                  <span>NO</span>
                )}
              </section>

              <section id="feedback-section" className="feedback-section">
                <h3>💬 Feedback</h3>
                <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                  <label>Rating</label>
                  <select
                    value={feedbackRating}
                    onChange={e => setFeedbackRating(e.target.value)}
                    required
                  >
                    <option value="">Select rating</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>
                        {num} ⭐
                      </option>
                    ))}
                  </select>

                  <label>Comment</label>
                  <textarea
                    placeholder="Write your comment..."
                    value={feedbackComment}
                    onChange={e => setFeedbackComment(e.target.value)}
                    rows="3"
                    required
                  />

                  <button type="submit">📤 Submit Feedback</button>
                </form>

                {recipe.feedback?.length > 0 && (
                  <div className="feedback-list">
                    {recipe.feedback.map((fb, i) => (
                      <div key={i} className="feedback-item">
                        {editingFeedbackId === fb._id ? (
                          <div className="edit-feedback-form">
                            <select
                              value={editRating}
                              onChange={e => setEditRating(e.target.value)}
                            >
                              {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>
                                  {num} ⭐
                                </option>
                              ))}
                            </select>
                            <textarea
                              value={editComment}
                              onChange={e => setEditComment(e.target.value)}
                              rows="2"
                            />
                            <button onClick={() => handleFeedbackUpdate(fb._id)}>
                              💾 Save
                            </button>
                            <button onClick={() => setEditingFeedbackId(null)}>❌ Cancel</button>
                          </div>
                        ) : (
                          <>
                            <div className="feedback-rating">{fb.rating} ⭐</div>
                            <div className="feedback-comment">{fb.comment}</div>
                            <div className="feedback-date"> {fb.date ? new Date(fb.date).toLocaleDateString() : '—'} </div>
                            <div className="feedback-actions">
                              <button onClick={() => { setEditingFeedbackId(fb._id); setEditRating(String(fb.rating)); setEditComment(fb.comment); }}>
                                ✏️ Edit
                              </button>
                              <button onClick={() => handleFeedbackDelete(fb._id)}>🗑 Delete</button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {token && (
                <div className="ai-question-box">
                  <button
                    className="btn btn-ask-ai"
                    onClick={() => setShowAiBox((prev) => !prev)}
                    disabled={aiLoading}
                  >
                    🤖 Ask AI for a Recipe
                  </button>

                  {showAiBox && (
                    <form onSubmit={handleSubmit} className="ai-form">
                      <textarea
                        rows="3"
                        placeholder="search recipe from the AI"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        aria-label="AI question"
                      />
                      <button type="submit" className="btn" disabled={aiLoading}>
                        {aiLoading ? '⏳ Asking AI...' : '📤 Ask AI'}
                      </button>
                    </form>
                  )}

                  {aiAnswer && (
                    <div className="ai-response-text">
                      <ReactMarkdown>{aiAnswer}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              <section className="recipe-section">
                <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#444' }}>
                  🙏 આપનો મુલાકાત માટે આભાર 🙏
                </div>
              </section>

            </article>
          )}
        </>
      )}
    </div>
  );
}

export default App;
