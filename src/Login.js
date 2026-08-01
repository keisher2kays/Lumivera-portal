import React, { useState } from 'react';
import logoImg from './assets/logo.png';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save auth token AND the logged-in user object (name, username, role)
        localStorage.setItem('adminToken', data.token || 'authenticated');
        localStorage.setItem('lumivera_user', JSON.stringify(data.user));
        onLoginSuccess();
      } else {
        setError(data.message || 'Invalid admin credentials');
      }
    } catch (err) {
      setError('Could not connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <img
            src={logoImg}
            alt="Lumivera Green Energy"
            className="nav-logo-img"
          />
          <h2 style={{ margin: '10px 0 0 0' }}>LumiVera Admin Portal</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Authorized Team Members Only</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username / Email</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@lumivera.com"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.loginBtn}>
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {

  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0B132B',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    padding: '20px',
  },
  card: {
    background: '#1E293B',
    width: '100%',
    maxWidth: '400px',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    border: '1px solid #334155',
  },
  brand: {
    textAlign: 'center',
    color: '#F8FAFC',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: '#CBD5E1',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    background: '#0F172A',
    color: '#FFFFFF',
    fontSize: '0.95rem',
    outline: 'none',
  },
  loginBtn: {
    background: '#2CA636',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '10px',
  },
  errorAlert: {
    background: '#7F1D1D',
    color: '#FECACA',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '16px',
    textAlign: 'center',
  },
};