import React, { useState, useEffect, useCallback } from 'react';

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'sales_rep' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const activeUser = currentUser || JSON.parse(localStorage.getItem('lumivera_user') || localStorage.getItem('user') || '{}');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': activeUser?.role || ''
        }
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Server error loading users.');
    }
  }, [BACKEND_URL, activeUser?.role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': activeUser?.role || ''
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('User created successfully!');
        setFormData({ name: '', username: '', password: '', role: 'sales_rep' });
        fetchUsers();
      } else {
        setError(data.message || 'Error creating user');
      }
    } catch (err) {
      setError('Server connection error.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': activeUser?.role || ''
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('User deleted successfully.');
        fetchUsers();
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Server connection error.');
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ color: '#F8FAFC' }}>👥 Team Management</h2>
      <p style={{ color: '#94A3B8' }}>Manage portal access for sales representatives and administrators.</p>

      {error && (
        <div style={{ background: '#7F1D1D', color: '#FECACA', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#064E3B', color: '#A7F3D0', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          {success}
        </div>
      )}

      {/* CREATE USER FORM */}
      <form onSubmit={handleCreateUser} style={styles.card}>
        <h3 style={{ marginTop: 0, color: '#F8FAFC' }}>Add New Team Member</h3>
        <div style={styles.formGrid}>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            style={styles.input}
            required
          />
          <input 
            type="text" 
            placeholder="Username" 
            value={formData.username} 
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
            style={styles.input}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
            style={styles.input}
            required
          />
          <select 
            value={formData.role} 
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={styles.input}
          >
            <option value="sales_rep">Sales Representative</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <button type="submit" style={styles.submitBtn}>
          + Create Member
        </button>
      </form>

      {/* TEAM MEMBERS LIST */}
      <div style={styles.card}>
        <h3 style={{ marginTop: 0, color: '#F8FAFC' }}>Existing Team Members</h3>
        <table style={styles.table}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '12px 8px' }}>Name</th>
              <th style={{ padding: '12px 8px' }}>Username</th>
              <th style={{ padding: '12px 8px' }}>Role</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '16px 8px', color: '#94A3B8' }}>No team members found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #1E293B' }}>
                  <td style={{ padding: '12px 8px' }}><strong>{u.name}</strong></td>
                  <td style={{ padding: '12px 8px' }}>{u.username}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      background: u.role === 'admin' ? '#0369A1' : '#334155',
                      color: '#FFF'
                    }}>
                      {u.role ? u.role.toUpperCase() : 'SALES_REP'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDeleteUser(u._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#1E293B',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginTop: '16px',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    background: '#0F172A',
    color: '#F8FAFC',
    fontSize: '0.95rem',
  },
  submitBtn: {
    marginTop: '16px',
    background: '#2CA636',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  deleteBtn: {
    background: '#DC2626',
    color: '#FFFFFF',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    color: '#F8FAFC',
  },
};