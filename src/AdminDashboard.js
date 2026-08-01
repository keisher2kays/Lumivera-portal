
import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import UserManagement from './components/UserManagements';
import logoImg from './assets/logo.png';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL);

const PRODUCT_CATEGORIES = ['Solar Panels', 'Inverters', 'Batteries', 'Drones', 'Accessories', 'Borehole'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('live_chat');
  const [alerts, setAlerts] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [agentInput, setAgentInput] = useState('');

  const [currentUser] = useState(() => {
    const rawData = localStorage.getItem('lumivera_user') || localStorage.getItem('user');
    if (!rawData) return { role: 'sales_rep' };
    try {
      const parsed = JSON.parse(rawData);
      return parsed.user || parsed;
    } catch (e) {
      return { role: 'sales_rep' };
    }
  });

  const userRole = (currentUser?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin';

  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [installations, setInstallations] = useState([]);

  const [productForm, setProductForm] = useState({
    name: '', category: 'Solar Panels', priceZimUSD: '', priceUKGBP: '', description: '', specs: '', stockQuantity: '',
  });
  const [productError, setProductError] = useState('');
  const [productSuccess, setProductSuccess] = useState('');

  const [leadMsg, setLeadMsg] = useState('');
  const [installMsg, setInstallMsg] = useState('');

  useEffect(() => {
    socket.on('agent_notification', (data) => {
      setAlerts((prev) => {
        if (!prev.find((a) => a.roomId === data.roomId)) return [...prev, data];
        return prev;
      });
    });

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('agent_notification');
      socket.off('receive_message');
    };
  }, []);

  const fetchLeads = useCallback(() => {
    fetch(`${BACKEND_URL}/api/admin/leads`)
      .then((res) => res.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const fetchProducts = useCallback(() => {
    fetch(`${BACKEND_URL}/api/admin/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const fetchInstallations = useCallback(() => {
    fetch(`${BACKEND_URL}/api/admin/installations`)
      .then((res) => res.json())
      .then((data) => setInstallations(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (activeTab === 'leads') fetchLeads();
    else if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'installations') fetchInstallations();
  }, [activeTab, fetchLeads, fetchProducts, fetchInstallations]);

  const joinChatRoom = (roomId) => {
    setCurrentRoom(roomId);
    setMessages([]);
    socket.emit('join_room', roomId);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!agentInput.trim() || !currentRoom) return;

    socket.emit('send_message', {
      roomId: currentRoom,
      message: agentInput,
      sender: 'agent',
    });

    setAgentInput('');
  };

  // --- Leads ---
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Remove this lead? This cannot be undone.')) return;
    setLeadMsg('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/leads/${leadId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setLeadMsg('Lead removed.');
        fetchLeads();
      } else {
        setLeadMsg(data.message || 'Failed to remove lead');
      }
    } catch (err) {
      setLeadMsg('Server connection error.');
    }
  };

  // --- Products ---
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setProductError('');
    setProductSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });
      const data = await response.json();

      if (response.ok) {
        setProductSuccess('Product added successfully!');
        setProductForm({ name: '', category: 'Solar Panels', priceZimUSD: '', priceUKGBP: '', description: '', specs: '', stockQuantity: '' });
        fetchProducts();
      } else {
        setProductError(data.message || 'Error adding product');
      }
    } catch (err) {
      setProductError('Server connection error.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/products/${productId}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok) {
        setProductSuccess('Product deleted successfully.');
        fetchProducts();
      } else {
        setProductError(data.message || 'Failed to delete product');
      }
    } catch (err) {
      setProductError('Server connection error.');
    }
  };

  const handleStockChange = async (productId, newQty) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newQty }),
      });
      fetchProducts();
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  // --- Installations ---
  const handleDeleteInstallationClient = async (instId, clientId) => {
    if (!window.confirm('Remove this booking? This frees up the slot.')) return;
    setInstallMsg('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/installations/${instId}/clients/${clientId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setInstallMsg('Booking removed.');
        fetchInstallations();
      } else {
        setInstallMsg(data.message || 'Failed to remove booking');
      }
    } catch (err) {
      setInstallMsg('Server connection error.');
    }
  };

  return (
    <div style={styles.container} className="admin-container">
      <header style={styles.header} className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoImg} alt="LumiVera Green Energy" className="admin-logo-img" style={{ height: '36px', width: 'auto' }} />
          <h2 style={{ margin: 0 }}>LumiVera Admin Workspace</h2>
        </div>
        <span style={styles.statusBadge} className="admin-status-badge">
          Role: <strong>{(currentUser.role || 'sales_rep').toUpperCase()}</strong> | Connected to: {BACKEND_URL.includes('localhost') ? 'Localhost' : 'Live'}
        </span>
      </header>

      <nav style={styles.navTabs} className="admin-nav-tabs">
        <button style={activeTab === 'live_chat' ? styles.activeTabBtn : styles.tabBtn} className="admin-tab-btn" onClick={() => setActiveTab('live_chat')}>
          💬 Live Agent Workspace ({alerts.length})
        </button>
        <button style={activeTab === 'leads' ? styles.activeTabBtn : styles.tabBtn} className="admin-tab-btn" onClick={() => setActiveTab('leads')}>
          📋 Leads & Enquiries
        </button>
        <button style={activeTab === 'products' ? styles.activeTabBtn : styles.tabBtn} className="admin-tab-btn" onClick={() => setActiveTab('products')}>
          📦 Inventory & Products
        </button>
        <button style={activeTab === 'installations' ? styles.activeTabBtn : styles.tabBtn} className="admin-tab-btn" onClick={() => setActiveTab('installations')}>
          📅 Installation Schedule
        </button>
        {isAdmin && (
          <button style={activeTab === 'users' ? styles.activeTabBtn : styles.tabBtn} className="admin-tab-btn" onClick={() => setActiveTab('users')}>
            👥 Team Management
          </button>
        )}
      </nav>

      <main style={styles.contentArea}>
        {activeTab === 'live_chat' && (
          <div style={styles.chatLayout} className="admin-chat-layout">
            <div style={styles.alertsPanel} className="admin-alerts-panel">
              <h3>🔔 Live Alerts ({alerts.length})</h3>
              {alerts.length === 0 ? (
                <p style={{ color: '#94A3B8' }}>No pending agent requests right now.</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.roomId} style={styles.alertCard}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>⚠️ Handover requested</p>
                    <button onClick={() => joinChatRoom(alert.roomId)} style={styles.joinBtn}>
                      Join Room: {alert.roomId}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={styles.chatWindow} className="admin-chat-window">
              <div style={styles.messageBox}>
                {messages.length === 0 ? (
                  <p style={{ color: '#94A3B8', textAlign: 'center', marginTop: '40px' }}>
                    {currentRoom ? 'Joined room. Waiting for customer messages...' : 'Select or join a chat room first.'}
                  </p>
                ) : (
                  messages.map((m, idx) => (
                    <div key={idx} style={{ ...styles.msgRow, justifyContent: m.sender === 'agent' ? 'flex-end' : 'flex-start' }}>
                      <div
                        style={{
                          ...styles.msgBubble,
                          background: m.sender === 'agent' ? '#2CA636' : m.sender === 'user' ? '#1E293B' : '#334155',
                          color: '#FFFFFF',
                        }}
                      >
                        <span style={styles.senderLabel}>[{m.sender}]:</span> {m.text || m.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} style={styles.inputForm}>
                <input
                  type="text"
                  placeholder={currentRoom ? 'Type reply as LumiVera Agent...' : 'Join a chat room first'}
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  disabled={!currentRoom}
                  style={styles.textInput}
                />
                <button type="submit" disabled={!currentRoom} style={styles.sendBtn}>
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div style={styles.tableCard} className="admin-table-card">
            <h3>Captured Customer Leads</h3>
            {leadMsg && <p style={{ color: '#A7F3D0' }}>{leadMsg}</p>}
            <div className="admin-table-wrap">
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact Info</th>
                    <th>Notes / Room</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr><td colSpan="6">No leads recorded yet.</td></tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead._id}>
                        <td>{lead.customerName || 'Guest'}</td>
                        <td><strong>{lead.phoneOrEmail || lead.contact}</strong></td>
                        <td>{lead.notes}</td>
                        <td>{lead.status || 'New'}</td>
                        <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleDeleteLead(lead._id)} style={styles.deleteBtn}>Remove</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div style={styles.tableCard} className="admin-table-card">
              <h3 style={{ marginTop: 0 }}>Add New Product</h3>

              {productError && (
                <div style={{ background: '#7F1D1D', color: '#FECACA', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                  {productError}
                </div>
              )}
              {productSuccess && (
                <div style={{ background: '#064E3B', color: '#A7F3D0', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                  {productSuccess}
                </div>
              )}

              <form onSubmit={handleCreateProduct}>
                <div style={styles.formGrid} className="admin-form-grid">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    style={styles.input}
                    required
                  />
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={styles.input}
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Price USD (Zimbabwe)"
                    value={productForm.priceZimUSD}
                    onChange={(e) => setProductForm({ ...productForm, priceZimUSD: e.target.value })}
                    style={styles.input}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price GBP (UK) — optional"
                    value={productForm.priceUKGBP}
                    onChange={(e) => setProductForm({ ...productForm, priceUKGBP: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Quantity in Stock"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ ...styles.input, width: '100%', marginTop: '16px', minHeight: '70px', boxSizing: 'border-box' }}
                />
                <input
                  type="text"
                  placeholder="Specs (comma-separated, e.g. 21% efficiency, 25-year warranty)"
                  value={productForm.specs}
                  onChange={(e) => setProductForm({ ...productForm, specs: e.target.value })}
                  style={{ ...styles.input, width: '100%', marginTop: '16px', boxSizing: 'border-box' }}
                />
                <button type="submit" style={styles.submitBtn}>+ Add Product</button>
              </form>
            </div>

            <div style={styles.tableCard} className="admin-table-card">
              <h3 style={{ marginTop: 0 }}>Product Inventory (MongoDB)</h3>
              <div className="admin-table-wrap">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price (USD)</th>
                      <th>Stock Qty</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan="6">No products found in MongoDB.</td></tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p._id}>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.category}</td>
                          <td>${p.priceZimUSD}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              defaultValue={p.stockQuantity ?? 0}
                              onBlur={(e) => handleStockChange(p._id, e.target.value)}
                              style={{ ...styles.input, width: '70px', padding: '6px 8px' }}
                            />
                          </td>
                          <td>{(p.stockQuantity ?? 0) > 0 ? '✅ In Stock' : '❌ Out of Stock'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button onClick={() => handleDeleteProduct(p._id)} style={styles.deleteBtn}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'installations' && (
          <div style={styles.tableCard} className="admin-table-card">
            <h3>Booked Installations & Site Surveys</h3>
            {installMsg && <p style={{ color: '#A7F3D0' }}>{installMsg}</p>}
            <div className="admin-table-wrap">
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Phone</th>
                    <th>Installation Date</th>
                    <th>Package</th>
                    <th>Slots Filled</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {installations.length === 0 || installations.every((i) => i.clients.length === 0) ? (
                    <tr><td colSpan="6">No installations scheduled.</td></tr>
                  ) : (
                    installations.flatMap((inst) =>
                      inst.clients.map((client) => (
                        <tr key={`${inst._id}-${client._id}`}>
                          <td><strong>{client.clientName}</strong></td>
                          <td>{client.phone}</td>
                          <td>{new Date(inst.date).toLocaleDateString()}</td>
                          <td>{client.packageName || 'Not specified'}</td>
                          <td>{inst.bookedSlots} / {inst.maxSlots}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteInstallationClient(inst._id, client._id)}
                              style={styles.deleteBtn}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && isAdmin && <UserManagement currentUser={currentUser} />}
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0B132B', color: '#F8FAFC', fontFamily: "'Segoe UI', Roboto, sans-serif", padding: '20px 40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #1E293B' },
  statusBadge: { background: '#1E293B', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', color: '#38BDF8' },
  navTabs: { display: 'flex', gap: '12px', margin: '20px 0' },
  tabBtn: { background: '#1E293B', color: '#94A3B8', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  activeTabBtn: { background: '#2CA636', color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  contentArea: { marginTop: '20px' },
  chatLayout: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' },
  alertsPanel: { background: '#1E293B', borderRadius: '12px', padding: '20px', minHeight: '450px' },
  alertCard: { background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '12px', marginBottom: '12px' },
  joinBtn: { width: '100%', background: '#2CA636', color: '#FFFFFF', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  chatWindow: { background: '#FFFFFF', borderRadius: '12px', display: 'flex', flexDirection: 'column', height: '520px', overflow: 'hidden' },
  messageBox: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  msgRow: { display: 'flex' },
  msgBubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.95rem', lineHeight: '1.4' },
  senderLabel: { fontSize: '0.75rem', opacity: 0.8, marginRight: '6px' },
  inputForm: { display: 'flex', padding: '16px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', gap: '10px' },
  textInput: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' },
  sendBtn: { background: '#2CA636', color: '#FFFFFF', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  tableCard: { background: '#1E293B', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px', textAlign: 'left' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: '#F8FAFC', fontSize: '0.95rem' },
  submitBtn: { marginTop: '16px', background: '#2CA636', color: '#FFFFFF', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  deleteBtn: { background: '#DC2626', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
};