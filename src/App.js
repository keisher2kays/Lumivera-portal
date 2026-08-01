


import React, { useState, useEffect } from 'react';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('lumivera_user');
    setIsAuthenticated(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('lumivera_user');
    setIsAuthenticated(false);
  };

  return (
    <div className="admin-app">
      {!isAuthenticated ? (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <div>
          {/* Top Bar with Logout Button */}
          <div style={{ background: '#0F172A', padding: '10px 40px', textAlign: 'right' }}>
            <button
              onClick={handleLogout}
              style={{
                background: '#EF4444',
                color: '#FFF',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              🔒 Log Out
            </button>
          </div>
          <AdminDashboard />
        </div>
      )}
    </div>
  );
}

export default App;