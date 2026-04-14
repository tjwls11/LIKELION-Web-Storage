import { useState } from 'react';
import { login, signup } from '../utils/auth.js';

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
    setSuccessMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const action = mode === 'login' ? login : signup;
    const result = await action(username, password);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      setSuccessMessage('Sign up complete. Please log in.');
      setMode('login');
      setUsername('');
      setPassword('');
      setLoading(false);
      return;
    }

    onLogin(result.user);
    setLoading(false);
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🦁</span>
          <span className="auth-logo-text">
            LIKELION <em>Web Storage</em>
          </span>
        </div>

        <div className="auth-tab-bar">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {successMessage && <div className="auth-msg success">{successMessage}</div>}
        {error && <div className="auth-msg error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="username">
              ID
            </label>
            <input
              id="username"
              className="auth-input"
              type="text"
              value={username}
              placeholder="Enter your ID"
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="auth-input"
              type="password"
              value={password}
              placeholder="Enter your password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
