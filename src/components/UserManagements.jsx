
// import React, { useState, useEffect, useCallback } from 'react';

// export default function UserManagement({ currentUser }) {
//   const [users, setUsers] = useState([]);
//   const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'sales_rep' });
//   const [showAddPass, setShowAddPass] = useState(false);
//   const [visibleMap, setVisibleMap] = useState({});
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
//   const activeUser = currentUser || JSON.parse(localStorage.getItem('lumivera_user') || localStorage.getItem('user') || '{}');

//   const fetchUsers = useCallback(async () => {
//     try {
//       const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
//         headers: { 'Content-Type': 'application/json', 'x-user-role': activeUser?.role || '' }
//       });
//       const data = await res.json();
//       if (res.ok) setUsers(Array.isArray(data)? data : []);
//     } catch { setError('Server error loading users.'); }
//   }, [BACKEND_URL, activeUser?.role]);

//   useEffect(() => { fetchUsers(); }, [fetchUsers]);

//   const handleCreateUser = async (e) => {
//     e.preventDefault(); setError(''); setSuccess('');
//     try {
//       const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'x-user-role': activeUser?.role || '' },
//         body: JSON.stringify(formData)
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setSuccess('User created successfully!');
//         setFormData({ name: '', username: '', password: '', role: 'sales_rep' });
//         setShowAddPass(false);
//         fetchUsers();
//       } else setError(data.message || 'Error creating user');
//     } catch { setError('Server connection error.'); }
//   };

//   const handleDeleteUser = async (id) => {
//     if (!window.confirm('Delete this user?')) return;
//     try {
//       const res = await fetch(`${BACKEND_URL}/api/admin/users/${id}`, {
//         method: 'DELETE', headers: { 'x-user-role': activeUser?.role || '' }
//       });
//       if (res.ok) { setSuccess('User deleted.'); fetchUsers(); }
//       else { const d = await res.json(); setError(d.message); }
//     } catch { setError('Server connection error.'); }
//   };

//   const toggleRow = (id) => setVisibleMap(p => ({...p, [id]:!p[id] }));

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.title}>👥 Team Management</h2>
//       <p style={styles.subtitle}>Manage portal access for sales representatives and administrators.</p>

//       {error && <div style={styles.err}>{error}</div>}
//       {success && <div style={styles.ok}>{success}</div>}

//       {/* ADD FORM */}
//       <form onSubmit={handleCreateUser} style={styles.card}>
//         <h3 style={styles.cardH}>Add New Team Member</h3>
//         <div style={styles.grid}>
//           <input style={styles.input} placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
//           <input style={styles.input} placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />

//           <div style={styles.passWrap}>
//             <input
//               style={{...styles.input, width: '100%', paddingRight: '44px'}}
//               type={showAddPass? 'text' : 'password'}
//               placeholder="Password"
//               value={formData.password}
//               onChange={e => setFormData({...formData, password: e.target.value})}
//               required
//             />
//             <button type="button" onClick={() => setShowAddPass(!showAddPass)} style={styles.eyeBtn}>
//               {showAddPass? '🙈' : '👁️'}
//             </button>
//           </div>

//           <select style={styles.input} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
//             <option value="sales_rep">Sales Representative</option>
//             <option value="admin">Administrator</option>
//           </select>
//         </div>
//         <button type="submit" style={styles.addBtn}>+ Create Member</button>
//       </form>

//       {/* EXISTING - FULL WIDTH FIX */}
//       <div style={styles.card}>
//         <h3 style={styles.cardH}>Existing Team Members</h3>
//         <div style={styles.tableWrap}>
//           <div style={styles.thead}>
//             <span>NAME</span>
//             <span>USERNAME</span>
//             <span>ROLE</span>
//             <span>PASSWORD</span>
//             <span style={{textAlign:'right'}}>ACTIONS</span>
//           </div>

//           {users.length === 0? (
//             <div style={styles.empty}>No team members found.</div>
//           ) : (
//             users.map(u => {
//               const isVisible = visibleMap[u._id];
//               const passToShow = u.plainPassword || u.password || '';
//               return (
//                 <div key={u._id} style={styles.row}>
//                   <span style={styles.nameCell}><strong>{u.name}</strong></span>
//                   <span style={styles.cell}>{u.username}</span>
//                   <span style={styles.cell}>
//                     <span style={{...styles.badge, background: u.role === 'admin'? '#0EA5E9' : '#334155'}}>
//                       {u.role?.toUpperCase()}
//                     </span>
//                   </span>
//                   <span style={styles.passCell}>
//                     <span style={{flex:1}}>
//                       {isVisible? passToShow : '••••••••'}
//                     </span>
//                     <button type="button" onClick={() => toggleRow(u._id)} style={styles.eyeSmall}>
//                       {isVisible? '🙈' : '👁️'}
//                     </button>
//                   </span>
//                   <span style={{...styles.cell, textAlign:'right'}}>
//                     <button onClick={() => handleDeleteUser(u._id)} style={styles.delBtn}>Delete</button>
//                   </span>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: { width: '100%', maxWidth: '100%' },
//   title: { color: '#F8FAFC', marginBottom: '4px' },
//   subtitle: { color: '#94A3B8', marginTop: 0, marginBottom: '20px' },
//   err: { background: '#7F1D1D', color: '#FECACA', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
//   ok: { background: '#064E3B', color: '#A7F3D0', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
//   card: { background: '#1E293B', padding: '28px', borderRadius: '12px', marginBottom: '24px', width: '100%', boxSizing: 'border-box' },
//   cardH: { marginTop: 0, color: '#F8FAFC', marginBottom: '16px' },
//   grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
//   input: { padding: '14px 16px', borderRadius: '8px', border: '1px solid #334155', background: '#F8FAFC', color: '#0F172A', fontSize: '0.95rem', boxSizing: 'border-box' },
//   passWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
//   eyeBtn: { position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1 },
//   addBtn: { marginTop: '18px', background: '#2CA636', color: '#FFF', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },

//   // TABLE - THIS MAKES IT FILL THE WHOLE BLOCK
//   tableWrap: { width: '100%' },
//   thead: {
//     display: 'grid',
//     gridTemplateColumns: '1.8fr 1.2fr 0.8fr 1.2fr 0.6fr',
//     width: '100%',
//     padding: '14px 10px',
//     borderBottom: '1px solid #334155',
//     color: '#64748B',
//     fontSize: '0.78rem',
//     fontWeight: '700',
//     letterSpacing: '0.05em',
//   },
//   row: {
//     display: 'grid',
//     gridTemplateColumns: '1.8fr 1.2fr 0.8fr 1.2fr 0.6fr',
//     width: '100%',
//     alignItems: 'center',
//     padding: '18px 10px',
//     borderBottom: '1px solid #1E293B',
//   },
//   cell: { color: '#CBD5E1', fontSize: '0.95rem', paddingRight: '12px' },
//   nameCell: { color: '#F8FAFC', fontSize: '0.95rem', paddingRight: '12px' },
//   passCell: { color: '#CBD5E1', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px' },
//   badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', color: '#FFF' },
//   delBtn: { background: '#DC2626', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
//   eyeSmall: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
//   empty: { padding: '20px 10px', color: '#94A3B8' },
// };

import React, { useState, useEffect, useCallback } from 'react';

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'sales_rep' });
  const [showAddPass, setShowAddPass] = useState(false);
  const [visibleMap, setVisibleMap] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const activeUser = currentUser || JSON.parse(localStorage.getItem('lumivera_user') || localStorage.getItem('user') || '{}');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { 'Content-Type': 'application/json', 'x-user-role': activeUser?.role || '' }
      });
      const data = await res.json();
      if (res.ok) setUsers(Array.isArray(data)? data : []);
    } catch { setError('Server error loading users.'); }
  }, [BACKEND_URL, activeUser?.role]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
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
        setShowAddPass(false);
        fetchUsers();
      } else setError(data.message || 'Error creating user');
    } catch { setError('Server connection error.'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${id}`, {
        method: 'DELETE', headers: { 'x-user-role': activeUser?.role || '' }
      });
      if (res.ok) { setSuccess('User deleted.'); fetchUsers(); }
      else { const d = await res.json(); setError(d.message); }
    } catch { setError('Server connection error.'); }
  };

  const toggleRow = (id) => setVisibleMap(p => ({...p, [id]:!p[id] }));

  return (
    <div style={styles.container}>
      <style>{`
        @media (max-width: 640px) {
         .um-grid { grid-template-columns: 1fr!important; }
         .um-scroll-wrap { overflow-x: auto!important; -webkit-overflow-scrolling: touch; }
         .um-scroll-wrap > div { min-width: 620px; }
        }
      `}</style>

      <h2 style={styles.title}>👥 Team Management</h2>
      <p style={styles.subtitle}>Manage portal access for sales representatives and administrators.</p>

      {error && <div style={styles.err}>{error}</div>}
      {success && <div style={styles.ok}>{success}</div>}

      <form onSubmit={handleCreateUser} style={styles.card}>
        <h3 style={styles.cardH}>Add New Team Member</h3>
        <div style={styles.grid} className="um-grid">
          <input style={styles.input} placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input style={styles.input} placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />

          <div style={styles.passWrap}>
            <input
              style={{...styles.input, width: '100%', paddingRight: '44px'}}
              type={showAddPass? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
            <button type="button" onClick={() => setShowAddPass(!showAddPass)} style={styles.eyeBtn}>
              {showAddPass? '🙈' : '👁'}
            </button>
          </div>

          <select style={styles.input} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="sales_rep">Sales Representative</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <button type="submit" style={styles.addBtn}>+ Create Member</button>
      </form>

      <div style={styles.card}>
        <h3 style={styles.cardH}>Existing Team Members</h3>
        <div style={styles.tableWrap} className="um-scroll-wrap">
          <div style={styles.thead}>
            <span>NAME</span>
            <span>USERNAME</span>
            <span>ROLE</span>
            <span>PASSWORD</span>
            <span style={{textAlign:'right'}}>ACTIONS</span>
          </div>

          {users.length === 0? (
            <div style={styles.empty}>No team members found.</div>
          ) : (
            users.map(u => {
              const isVisible = visibleMap[u._id];
              const passToShow = u.plainPassword || u.password || '';
              return (
                <div key={u._id} style={styles.row}>
                  <span style={styles.nameCell}><strong>{u.name}</strong></span>
                  <span style={styles.cell}>{u.username}</span>
                  <span style={styles.cell}>
                    <span style={{...styles.badge, background: u.role === 'admin'? '#0EA5E9' : '#334155'}}>
                      {u.role?.toUpperCase()}
                    </span>
                  </span>
                  <span style={styles.passCell}>
                    <span style={{flex:1, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {isVisible? passToShow : '••••••••'}
                    </span>
                    <button type="button" onClick={() => toggleRow(u._id)} style={styles.eyeSmall}>
                      {isVisible? '🙈' : '👁'}
                    </button>
                  </span>
                  <span style={{...styles.cell, textAlign:'right'}}>
                    <button onClick={() => handleDeleteUser(u._id)} style={styles.delBtn}>Delete</button>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { width: '100%', maxWidth: '100%' },
  title: { color: '#F8FAFC', marginBottom: '4px' },
  subtitle: { color: '#94A3B8', marginTop: 0, marginBottom: '20px' },
  err: { background: '#7F1D1D', color: '#FECACA', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
  ok: { background: '#064E3B', color: '#A7F3D0', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
  card: { background: '#1E293B', padding: '24px', borderRadius: '12px', marginBottom: '24px', width: '100%', boxSizing: 'border-box' },
  cardH: { marginTop: 0, color: '#F8FAFC', marginBottom: '16px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  input: { padding: '14px 16px', borderRadius: '8px', border: '1px solid #334155', background: '#F8FAFC', color: '#0F172A', fontSize: '0.95rem', boxSizing: 'border-box' },
  passWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1 },
  addBtn: { marginTop: '18px', background: '#2CA636', color: '#FFF', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },

  tableWrap: { width: '100%', overflowX: 'auto' },
  thead: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1.2fr 0.8fr 1.2fr 0.6fr',
    width: '100%',
    padding: '14px 10px',
    borderBottom: '1px solid #334155',
    color: '#64748B',
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1.2fr 0.8fr 1.2fr 0.6fr',
    width: '100%',
    alignItems: 'center',
    padding: '18px 10px',
    borderBottom: '1px solid #1E293B',
  },
  cell: { color: '#CBD5E1', fontSize: '0.95rem', paddingRight: '12px' },
  nameCell: { color: '#F8FAFC', fontSize: '0.95rem', paddingRight: '12px' },
  passCell: { color: '#CBD5E1', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px' },
  badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', color: '#FFF' },
  delBtn: { background: '#DC2626', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  eyeSmall: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
  empty: { padding: '20px 10px', color: '#94A3B8' },
};