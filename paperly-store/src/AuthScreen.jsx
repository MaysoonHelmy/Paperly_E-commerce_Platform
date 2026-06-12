import { useState } from 'react';

function AuthScreen({ onLogin, setUser, setRole }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualSubmit = async () => {
    setError('');
    if (!isLogin && !name.trim()) return setError('Please enter your full name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);

    try {
      const endpoint = isLogin ? 'http://localhost:5069/api/auth/login' : 'http://localhost:5069/api/auth/register';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Authentication failed.');

      if (isLogin) {
        const userObj = { 
          id: data.userId, 
          name: data.name, 
          email: data.email, 
          phone: null,     
          role: data.role 
        };
        setUser(userObj);
        setRole(data.role);
        localStorage.setItem('user', JSON.stringify(userObj));
        onLogin();
      } else {
        alert("Account created! Please sign in.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>⚠️ {error}</div>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!isLogin && <input className="form-input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />}
        <input className="form-input" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="form-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        
        <button className="teal-btn" onClick={handleManualSubmit} disabled={loading}>
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>
      </div>
      
      <p style={{ marginTop: '20px', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
      </p>
    </div>
  );
}

export default AuthScreen;