

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
        headers: { 'Content-Type': 'application/json', 'x-user-role': activeUser?.role || '' }
      });
      const data = await response.json();
      if (response.ok) setUsers(Array.isArray(data) ? data : []);
      else setError(data.message || 'Failed to fetch users');
    } catch { setError('Server error loading users.'); }
  }, [BACKEND_URL, activeUser?.role]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': activeUser?.role || '' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('User created successfully!');
        setFormData({ name: '', username: '', password: '', role: 'sales_rep' });
        fetchUsers();
      } else setError(data.message || 'Error creating user');
    } catch { setError('Server connection error.'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'DELETE', headers: { 'x-user-role': activeUser?.role || '' }
      });
      const data = await res.json();
      if (res.ok) { setSuccess('User deleted.'); fetchUsers(); }
      else setError(data.message || 'Failed to delete');
    } catch { setError('Server connection error.'); }
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ color: '#F8FAFC' }}>👥 Team Management</h2>
      <p style={{ color: '#94A3B8' }}>Manage portal access for sales representatives and administrators.</p>

      {error && <div style={styles.alertErr}>{error}</div>}
      {success && <div style={styles.alertOk}>{success}</div>}

      <form onSubmit={handleCreateUser} style={styles.card}>
        <h3 style={styles.cardTitle}>Add New Team Member</h3>
        <div style={styles.formGrid}>
          <input style={styles.input} placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input style={styles.input} placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
          <input style={styles.input} type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          <select style={styles.input} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="sales_rep">Sales Representative</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <button type="submit" style={styles.createBtn}>+ Create Member</button>
      </form>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Existing Team Members</h3>
        
        {/* TABLE HEADER - stretched */}
        <div style={styles.tableHeaderRow}>
          <span style={styles.th}>NAME</span>
          <span style={styles.th}>USERNAME</span>
          <span style={styles.th}>ROLE</span>
          <span style={{...styles.th, textAlign: 'right'}}>ACTIONS</span>
        </div>

        {/* TABLE BODY - stretched */}
        <div style={styles.tableBody}>
          {users.length === 0 ? (
            <div style={styles.empty}>No team members found.</div>
          ) : (
            users.map(u => (
              <div key={u._id} style={styles.tr}>
                <span style={styles.tdName}><strong>{u.name}</strong></span>
                <span style={styles.td}>{u.username}</span>
                <span style={styles.td}>
                  <span style={{...styles.badge, background: u.role === 'admin' ? '#0EA5E9' : '#334155'}}>
                    {u.role?.toUpperCase()}
                  </span>
                </span>
                <span style={{...styles.td, textAlign: 'right'}}>
                  <button onClick={() => handleDeleteUser(u._id)} style={styles.delBtn}>Delete</button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { background: '#1E293B', padding: '24px', borderRadius: '12px', marginBottom: '24px', width: '100%', boxSizing: 'border-box' },
  cardTitle: { marginTop: 0, color: '#F8FAFC', marginBottom: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  input: { padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#F8FAFC', color: '#0F172A', fontSize: '0.95rem' },
  createBtn: { marginTop: '16px', background: '#2CA636', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },

  // THIS IS THE FIX - grid spreads across 100%
  tableHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.2fr 1fr 0.8fr', // spreads content across full div
    width: '100%',
    padding: '12px 8px',
    borderBottom: '1px solid #334155',
  },
  tableBody: { width: '100%' },
  tr: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.2fr 1fr 0.8fr', // same as header
    width: '100%',
    alignItems: 'center',
    padding: '16px 8px',
    borderBottom: '1px solid #1E293B',
  },
  th: { color: '#64748B', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em' },
  td: { color: '#CBD5E1', fontSize: '0.95rem' },
  tdName: { color: '#F8FAFC', fontSize: '0.95rem' },
  badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#FFF' },
  delBtn: { background: '#DC2626', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  empty: { padding: '20px 8px', color: '#94A3B8' },
  alertErr: { background: '#7F1D1D', color: '#FECACA', padding: '12px', borderRadius: '6px', marginBottom: '15px' },
  alertOk: { background: '#064E3B', color: '#A7F3D0', padding: '12px', borderRadius: '6px', marginBottom: '15px' },
};