import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getDashboardStats,
  getAllUsers
} from '../services/orderService';

// ─── STATUS CONFIG ───────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
  processing: { label: 'Processing', color: '#3B82F6', bg: '#DBEAFE', icon: '⚙️' },
  shipped:    { label: 'Shipped',    color: '#8B5CF6', bg: '#EDE9FE', icon: '🚚' },
  delivered:  { label: 'Delivered',  color: '#10B981', bg: '#D1FAE5', icon: '✅' },
  cancelled:  { label: 'Cancelled',  color: '#EF4444', bg: '#FEE2E2', icon: '❌' },
};

// ─── ADMIN CREDENTIALS (change these!) ───────────────────────────
const ADMIN_EMAIL = 'admin@loudlyworn.com';
const ADMIN_PASSWORD = 'LoudlyAdmin2024!';

// ══════════════════════════════════════════════════════════════════
//  ADMIN LOGIN SCREEN
// ══════════════════════════════════════════════════════════════════
const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuth', 'true');
      onLogin();
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div style={styles.loginWrapper}>
      <div style={styles.loginCard}>
        {/* Logo */}
        <div style={styles.loginLogo}>
          <span style={styles.loginLogoText}>LW</span>
        </div>
        <h1 style={styles.loginTitle}>Admin Portal</h1>
        <p style={styles.loginSubtitle}>Loudly Worn — Management Dashboard</p>

        <form onSubmit={handleSubmit} style={styles.loginForm}>
          {error && <div style={styles.loginError}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@loudlyworn.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter admin password"
                style={{ ...styles.input, paddingRight: '48px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.loginBtn}>
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  STAT CARD
// ══════════════════════════════════════════════════════════════════
const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={styles.statInfo}>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color }}>{value}</p>
      {sub && <p style={styles.statSub}>{sub}</p>}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════
//  MINI BAR CHART
// ══════════════════════════════════════════════════════════════════
const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div style={styles.chartWrapper}>
      <h3 style={styles.chartTitle}>Revenue — Last 7 Days</h3>
      <div style={styles.chartBars}>
        {data.map((d, i) => (
          <div key={i} style={styles.chartCol}>
            <span style={styles.chartValue}>
              {d.revenue > 0 ? `₹${(d.revenue / 1000).toFixed(1)}k` : ''}
            </span>
            <div style={styles.chartBarTrack}>
              <div
                style={{
                  ...styles.chartBar,
                  height: `${Math.max((d.revenue / max) * 100, 4)}%`,
                }}
              />
            </div>
            <span style={styles.chartDay}>{d.day}</span>
            <span style={styles.chartOrders}>{d.orders} ord</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  ORDER DETAIL MODAL
// ══════════════════════════════════════════════════════════════════
const OrderModal = ({ order, onClose, onStatusChange }) => {
  const [status, setStatus] = useState(order.status || 'pending');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onStatusChange(order.id, status);
    setSaving(false);
    onClose();
  };

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Order Details</h2>
            <p style={styles.modalOrderId}>#{order.id?.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} style={styles.modalClose}>✕</button>
        </div>

        <div style={styles.modalBody}>
          {/* Customer Info */}
          <Section title="👤 Customer Information">
            <InfoRow label="Name"  value={order.customerName || order.name || '—'} />
            <InfoRow label="Email" value={order.customerEmail || order.email || '—'} />
            <InfoRow label="Phone" value={order.phone || order.customerPhone || '—'} />
            <InfoRow
              label="Date"
              value={order.createdAt
                ? new Date(order.createdAt).toLocaleString('en-IN')
                : '—'}
            />
          </Section>

          {/* Shipping */}
          <Section title="📦 Shipping Address">
            <InfoRow label="Address" value={
              [
                order.address,
                order.city,
                order.state,
                order.pincode || order.zipCode,
                order.country
              ].filter(Boolean).join(', ') || '—'
            } />
          </Section>

          {/* Items */}
          <Section title="🛍️ Ordered Items">
            <div style={styles.itemsContainer}>
              {(order.items || order.cart || []).map((item, i) => (
                <div key={i} style={styles.itemCard}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={styles.itemImage}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div style={styles.itemDetails}>
                    <p style={styles.itemName}>{item.name}</p>
                    <p style={styles.itemMeta}>
                      Size: <strong>{item.selectedSize || item.size || '—'}</strong>
                      {item.selectedColor && (
                        <> &nbsp;| Color: <strong>{item.selectedColor}</strong></>
                      )}
                    </p>
                    <p style={styles.itemMeta}>
                      Qty: <strong>{item.quantity}</strong>
                      &nbsp;× {item.price}
                    </p>
                  </div>
                  <p style={styles.itemTotal}>
                    ₹{(
                      parseFloat(String(item.price).replace('₹', '').replace(/,/g, '')) *
                      item.quantity
                    ).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Payment */}
          <Section title="💳 Payment Summary">
            <InfoRow label="Payment Method" value={order.paymentMethod || 'COD'} />
            <InfoRow label="Payment Status" value={order.paymentStatus || 'Pending'} />
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total Amount</span>
              <span style={styles.totalAmount}>
                ₹{String(order.totalAmount || order.total || '0')
                    .replace('₹', '')
                    .replace(/,/g, '')
                    ? Number(
                        String(order.totalAmount || order.total || 0)
                          .replace('₹', '')
                          .replace(/,/g, '')
                      ).toLocaleString('en-IN')
                    : '0'}
              </span>
            </div>
          </Section>

          {/* Status Update */}
          <Section title="🔄 Update Status">
            <div style={styles.statusGrid}>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setStatus(key)}
                  style={{
                    ...styles.statusChip,
                    background: status === key ? val.bg : '#F9FAFB',
                    border: `2px solid ${status === key ? val.color : '#E5E7EB'}`,
                    color: status === key ? val.color : '#6B7280',
                    fontWeight: status === key ? '700' : '400',
                  }}
                >
                  {val.icon} {val.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={styles.saveBtn}
            >
              {saving ? 'Saving…' : `Save Status → ${cfg.label}`}
            </button>
          </Section>
        </div>
      </div>
    </div>
  );
};

// Helper sub-components
const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h4 style={styles.sectionTitle}>{title}</h4>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={styles.infoRow}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={styles.infoValue}>{value}</span>
  </div>
);

// ══════════════════════════════════════════════════════════════════
//  MAIN ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════
const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders]       = useState([]);
  const [users, setUsers]         = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification]   = useState('');
  const [sidebarOpen, setSidebarOpen]     = useState(true);

  // ── Load data ────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, statsRes, usersRes] = await Promise.all([
        getAllOrders(),
        getDashboardStats(),
        getAllUsers()
      ]);

      if (ordersRes.success) setOrders(ordersRes.data);
      else setError(ordersRes.error);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to load data. Check Firestore rules.');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // ── Helpers ──────────────────────────────────────────────────
  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleStatusChange = async (orderId, status) => {
    const res = await updateOrderStatus(orderId, status);
    if (res.success) {
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status } : o)
      );
      notify(`✅ Order status updated to ${STATUS_CONFIG[status]?.label}`);
    } else {
      notify('❌ Failed to update status');
    }
  };

  const handleDelete = async (orderId) => {
    const res = await deleteOrder(orderId);
    if (res.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      notify('🗑️ Order deleted successfully');
    } else {
      notify('❌ Failed to delete order');
    }
    setDeleteConfirm(null);
  };

  // ── Filtered orders ──────────────────────────────────────────
  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      !search ||
      (order.customerName || order.name || '').toLowerCase().includes(search) ||
      (order.customerEmail || order.email || '').toLowerCase().includes(search) ||
      (order.id || '').toLowerCase().includes(search) ||
      (order.items || order.cart || []).some(i =>
        (i.name || '').toLowerCase().includes(search)
      );
    const matchStatus =
      filterStatus === 'all' || (order.status || 'pending') === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Sidebar nav items ────────────────────────────────────────
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'orders',    icon: '🛒', label: 'Orders', count: orders.length },
    { id: 'customers', icon: '👥', label: 'Customers', count: users.length },
  ];

  // ════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div style={styles.adminWrapper}>
      {/* ── Notification Toast ── */}
      {notification && (
        <div style={styles.toast}>{notification}</div>
      )}

      {/* ── Sidebar ── */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? '240px' : '64px' }}>
        <div style={styles.sidebarHeader}>
          {sidebarOpen && (
            <div style={styles.sidebarLogo}>
              <span style={styles.sidebarLogoText}>LW</span>
              <span style={styles.sidebarBrand}>Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.sidebarToggle}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navItem,
                background: activeTab === item.id ? '#1F2937' : 'transparent',
                color: activeTab === item.id ? '#fff' : '#9CA3AF',
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span style={styles.navLabel}>{item.label}</span>
                  {item.count !== undefined && (
                    <span style={styles.navBadge}>{item.count}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        <button onClick={onLogout} style={styles.logoutBtn}>
          <span>🚪</span>
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main style={styles.main}>
        {/* Top Bar */}
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>
              {navItems.find(n => n.id === activeTab)?.icon}{' '}
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p style={styles.pageSubtitle}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric',
                month: 'long', day: 'numeric'
              })}
            </p>
          </div>
          <button onClick={loadData} style={styles.refreshBtn} disabled={loading}>
            {loading ? '⟳ Loading…' : '⟳ Refresh'}
          </button>
        </header>

        {error && (
          <div style={styles.errorBanner}>
            ⚠️ {error}
            <button onClick={loadData} style={styles.retryBtn}>Retry</button>
          </div>
        )}

        {loading ? (
          <div style={styles.loadingCenter}>
            <div style={styles.spinner} />
            <p style={{ marginTop: '16px', color: '#6B7280' }}>
              Loading data…
            </p>
          </div>
        ) : (
          <>
            {/* ════════ DASHBOARD TAB ════════ */}
            {activeTab === 'dashboard' && stats && (
              <div style={styles.tabContent}>
                {/* Stat Cards */}
                <div style={styles.statsGrid}>
                  <StatCard
                    icon="🛒" label="Total Orders"
                    value={stats.totalOrders}
                    color="#3B82F6"
                    sub={`${stats.pendingOrders} pending`}
                  />
                  <StatCard
                    icon="💰" label="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
                    color="#10B981"
                    sub="All time"
                  />
                  <StatCard
                    icon="👥" label="Total Customers"
                    value={stats.totalUsers}
                    color="#8B5CF6"
                    sub="Registered users"
                  />
                  <StatCard
                    icon="✅" label="Delivered"
                    value={stats.deliveredOrders}
                    color="#10B981"
                    sub={`${stats.cancelledOrders} cancelled`}
                  />
                  <StatCard
                    icon="🚚" label="Shipped"
                    value={stats.shippedOrders}
                    color="#8B5CF6"
                    sub="In transit"
                  />
                  <StatCard
                    icon="⚙️" label="Processing"
                    value={stats.processingOrders}
                    color="#3B82F6"
                    sub="Being prepared"
                  />
                </div>

                {/* Bar Chart */}
                {stats.revenueByDay && (
                  <MiniBarChart data={stats.revenueByDay} />
                )}

                {/* Recent Orders Preview */}
                <div style={styles.recentCard}>
                  <div style={styles.recentHeader}>
                    <h3 style={styles.sectionTitle2}>Recent Orders</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      style={styles.viewAllBtn}
                    >
                      View All →
                    </button>
                  </div>
                  <OrderTable
                    orders={orders.slice(0, 5)}
                    onView={setSelectedOrder}
                    onDelete={setDeleteConfirm}
                    onStatusChange={handleStatusChange}
                    compact
                  />
                </div>
              </div>
            )}

            {/* ════════ ORDERS TAB ════════ */}
            {activeTab === 'orders' && (
              <div style={styles.tabContent}>
                {/* Filters */}
                <div style={styles.filtersRow}>
                  <input
                    type="text"
                    placeholder="🔍  Search by name, email, order ID, product…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                  />
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="all">All Statuses</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                  <span style={styles.resultCount}>
                    {filteredOrders.length} of {orders.length} orders
                  </span>
                </div>

                <OrderTable
                  orders={filteredOrders}
                  onView={setSelectedOrder}
                  onDelete={setDeleteConfirm}
                  onStatusChange={handleStatusChange}
                />
              </div>
            )}

            {/* ════════ CUSTOMERS TAB ════════ */}
            {activeTab === 'customers' && (
              <div style={styles.tabContent}>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHead}>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Phone</th>
                        <th style={styles.th}>Joined</th>
                        <th style={styles.th}>Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={styles.emptyCell}>
                            No customers found
                          </td>
                        </tr>
                      ) : (
                        users.map((user, idx) => {
                          const userOrders = orders.filter(
                            o => o.userId === user.id ||
                                 o.customerEmail === user.email
                          );
                          return (
                            <tr key={user.id} style={styles.tr}>
                              <td style={styles.td}>{idx + 1}</td>
                              <td style={styles.td}>
                                <div style={styles.avatar}>
                                  <div style={styles.avatarCircle}>
                                    {(user.displayName || user.name || 'U')[0].toUpperCase()}
                                  </div>
                                  {user.displayName || user.name || '—'}
                                </div>
                              </td>
                              <td style={styles.td}>{user.email || '—'}</td>
                              <td style={styles.td}>{user.phone || '—'}</td>
                              <td style={styles.td}>
                                {user.createdAt
                                  ? new Date(
                                      user.createdAt?.toDate?.() || user.createdAt
                                    ).toLocaleDateString('en-IN')
                                  : '—'}
                              </td>
                              <td style={styles.td}>
                                <span style={styles.orderCountBadge}>
                                  {userOrders.length}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmBox}>
            <h3 style={styles.confirmTitle}>🗑️ Delete Order?</h3>
            <p style={styles.confirmText}>
              Are you sure you want to delete order{' '}
              <strong>#{deleteConfirm.slice(-8).toUpperCase()}</strong>?
              This cannot be undone.
            </p>
            <div style={styles.confirmBtns}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={styles.deleteBtn}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  ORDER TABLE COMPONENT
// ══════════════════════════════════════════════════════════════════
const OrderTable = ({ orders, onView, onDelete, onStatusChange, compact }) => (
  <div style={styles.tableWrapper}>
    <table style={styles.table}>
      <thead>
        <tr style={styles.tableHead}>
          <th style={styles.th}>Order ID</th>
          <th style={styles.th}>Customer</th>
          <th style={styles.th}>Items</th>
          {!compact && <th style={styles.th}>Products</th>}
          <th style={styles.th}>Total</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Date</th>
          <th style={styles.th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.length === 0 ? (
          <tr>
            <td colSpan={compact ? 7 : 8} style={styles.emptyCell}>
              📭 No orders found
            </td>
          </tr>
        ) : (
          orders.map(order => {
            const status = order.status || 'pending';
            const cfg    = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
            const items  = order.items || order.cart || [];

            return (
              <tr key={order.id} style={styles.tr}>
                {/* Order ID */}
                <td style={styles.td}>
                  <span style={styles.orderId}>
                    #{(order.id || '').slice(-8).toUpperCase()}
                  </span>
                </td>

                {/* Customer */}
                <td style={styles.td}>
                  <div>
                    <p style={styles.customerName}>
                      {order.customerName || order.name || 'Guest'}
                    </p>
                    <p style={styles.customerEmail}>
                      {order.customerEmail || order.email || '—'}
                    </p>
                  </div>
                </td>

                {/* Item count */}
                <td style={styles.td}>
                  <span style={styles.itemCount}>
                    {items.reduce((s, i) => s + (i.quantity || 1), 0)} items
                  </span>
                </td>

                {/* Product names (full table only) */}
                {!compact && (
                  <td style={styles.td}>
                    <div style={styles.productList}>
                      {items.slice(0, 2).map((item, i) => (
                        <span key={i} style={styles.productTag}>
                          {item.name}
                          {item.selectedSize ? ` (${item.selectedSize})` : ''}
                        </span>
                      ))}
                      {items.length > 2 && (
                        <span style={styles.moreTag}>+{items.length - 2} more</span>
                      )}
                    </div>
                  </td>
                )}

                {/* Total */}
                <td style={styles.td}>
                  <span style={styles.amount}>
                    ₹{Number(
                      String(order.totalAmount || order.total || 0)
                        .replace('₹', '').replace(/,/g, '')
                    ).toLocaleString('en-IN')}
                  </span>
                </td>

                {/* Status badge */}
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    background: cfg.bg,
                    color: cfg.color,
                    border: `1px solid ${cfg.color}40`
                  }}>
                    {cfg.icon} {cfg.label}
                  </span>
                </td>

                {/* Date */}
                <td style={styles.td}>
                  <span style={styles.dateText}>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })
                      : '—'}
                  </span>
                </td>

                {/* Actions */}
                <td style={styles.td}>
                  <div style={styles.actionBtns}>
                    <button
                      onClick={() => onView(order)}
                      style={styles.viewBtn}
                      title="View Details"
                    >
                      👁️
                    </button>
                    <select
                      value={order.status || 'pending'}
                      onChange={e => onStatusChange(order.id, e.target.value)}
                      style={styles.quickStatus}
                      title="Quick status change"
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => onDelete(order.id)}
                      style={styles.delBtn}
                      title="Delete Order"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);

// ══════════════════════════════════════════════════════════════════
//  ROOT ADMIN PAGE (handles auth gate)
// ══════════════════════════════════════════════════════════════════
const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('adminAuth') === 'true'
  );

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

export default Admin;

// ══════════════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════════════
const styles = {
  // ── Login ──────────────────────────────────────────────────────
  loginWrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
  },
  loginCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '48px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
    textAlign: 'center',
  },
  loginLogo: {
    width: '72px',
    height: '72px',
    background: 'linear-gradient(135deg, #0F172A, #374151)',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  loginLogoText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: '28px',
    letterSpacing: '-1px',
  },
  loginTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '0 0 8px',
  },
  loginSubtitle: {
    color: '#6B7280',
    fontSize: '14px',
    margin: '0 0 32px',
  },
  loginForm: { textAlign: 'left' },
  loginError: {
    background: '#FEE2E2',
    color: '#DC2626',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
  },
  inputGroup: { marginBottom: '20px' },
  inputLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color .2s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '0',
  },
  loginBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #0F172A, #374151)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
  },

  // ── Admin Layout ───────────────────────────────────────────────
  adminWrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F1F5F9',
    fontFamily: "'Inter', sans-serif",
  },

  // ── Sidebar ────────────────────────────────────────────────────
  sidebar: {
    background: '#111827',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width .3s',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 16px',
    borderBottom: '1px solid #1F2937',
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sidebarLogoText: {
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    color: '#fff',
    fontWeight: '900',
    fontSize: '18px',
    padding: '4px 10px',
    borderRadius: '8px',
  },
  sidebarBrand: {
    color: '#fff',
    fontWeight: '700',
    fontSize: '16px',
  },
  sidebarToggle: {
    background: '#1F2937',
    border: 'none',
    color: '#9CA3AF',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all .2s',
    whiteSpace: 'nowrap',
  },
  navIcon: { fontSize: '18px', flexShrink: 0 },
  navLabel: { fontWeight: '500', fontSize: '14px', flex: 1 },
  navBadge: {
    background: '#3B82F6',
    color: '#fff',
    borderRadius: '20px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '700',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    background: 'none',
    border: 'none',
    color: '#EF4444',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    borderTop: '1px solid #1F2937',
    width: '100%',
    whiteSpace: 'nowrap',
  },

  // ── Main ───────────────────────────────────────────────────────
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topBar: {
    background: '#fff',
    padding: '20px 32px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '4px 0 0',
  },
  refreshBtn: {
    padding: '10px 20px',
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  tabContent: {
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  // ── Error / Loading ────────────────────────────────────────────
  errorBanner: {
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '14px',
  },
  retryBtn: {
    padding: '6px 16px',
    background: '#DC2626',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
  loadingCenter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #E5E7EB',
    borderTop: '4px solid #3B82F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  // ── Stats ──────────────────────────────────────────────────────
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  },
  statIcon: { fontSize: '32px' },
  statInfo: { flex: 1 },
  statLabel: {
    fontSize: '12px',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
    margin: 0,
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '800',
    margin: '4px 0',
  },
  statSub: {
    fontSize: '12px',
    color: '#9CA3AF',
    margin: 0,
  },

  // ── Chart ──────────────────────────────────────────────────────
  chartWrapper: {
    background: '#fff',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 20px',
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    height: '160px',
  },
  chartCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    height: '100%',
  },
  chartValue: {
    fontSize: '10px',
    color: '#6B7280',
    fontWeight: '600',
    height: '14px',
  },
  chartBarTrack: {
    flex: 1,
    width: '100%',
    background: '#F3F4F6',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    background: 'linear-gradient(180deg, #3B82F6, #1D4ED8)',
    borderRadius: '6px 6px 0 0',
    transition: 'height .5s',
  },
  chartDay: {
    fontSize: '10px',
    color: '#6B7280',
    fontWeight: '500',
  },
  chartOrders: {
    fontSize: '9px',
    color: '#9CA3AF',
  },

  // ── Recent Orders ──────────────────────────────────────────────
  recentCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  },
  recentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  sectionTitle2: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  viewAllBtn: {
    background: 'none',
    border: 'none',
    color: '#3B82F6',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },

  // ── Filters ────────────────────────────────────────────────────
  filtersRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '240px',
    padding: '12px 16px',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
  },
  selectInput: {
    padding: '12px 16px',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
    cursor: 'pointer',
  },
  resultCount: {
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },

  // ── Table ──────────────────────────────────────────────────────
  tableWrapper: {
    background: '#fff',
    borderRadius: '14px',
    overflow: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  tableHead: {
    background: '#F8FAFC',
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #E5E7EB',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #F3F4F6',
    transition: 'background .15s',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  emptyCell: {
    padding: '48px',
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: '15px',
  },

  // ── Table Cell Styles ─────────────────────────────────────────
  orderId: {
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#374151',
    background: '#F3F4F6',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
  },
  customerName: {
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  customerEmail: {
    color: '#6B7280',
    fontSize: '12px',
    margin: '2px 0 0',
  },
  itemCount: {
    background: '#EFF6FF',
    color: '#2563EB',
    padding: '3px 10px',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '12px',
  },
  productList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    maxWidth: '220px',
  },
  productTag: {
    background: '#F3F4F6',
    color: '#374151',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '500',
  },
  moreTag: {
    background: '#E5E7EB',
    color: '#6B7280',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
  },
  amount: {
    fontWeight: '700',
    color: '#059669',
    fontSize: '14px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  dateText: {
    color: '#6B7280',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  actionBtns: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  viewBtn: {
    padding: '6px',
    background: '#EFF6FF',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  quickStatus: {
    padding: '5px 8px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
    outline: 'none',
    maxWidth: '110px',
  },
  delBtn: {
    padding: '6px',
    background: '#FEE2E2',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },

  // ── Avatar ─────────────────────────────────────────────────────
  avatar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatarCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px',
    flexShrink: 0,
  },
  orderCountBadge: {
    background: '#F3F4F6',
    color: '#374151',
    padding: '3px 12px',
    borderRadius: '20px',
    fontWeight: '700',
    fontSize: '13px',
  },

  // ── Modal ──────────────────────────────────────────────────────
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    backdropFilter: 'blur(4px)',
  },
  modalBox: {
    background: '#fff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 60px rgba(0,0,0,.3)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px 28px',
    borderBottom: '1px solid #E5E7EB',
    background: '#F8FAFC',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },
  modalOrderId: {
    fontFamily: 'monospace',
    color: '#6B7280',
    fontSize: '13px',
    margin: '4px 0 0',
  },
  modalClose: {
    background: '#F3F4F6',
    border: 'none',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#6B7280',
  },
  modalBody: {
    overflowY: 'auto',
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // ── Modal Sections ─────────────────────────────────────────────
  section: {
    background: '#F8FAFC',
    borderRadius: '12px',
    padding: '16px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#374151',
    margin: '0 0 12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '6px 0',
    borderBottom: '1px solid #E5E7EB',
  },
  infoLabel: {
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: '13px',
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '60%',
    wordBreak: 'break-word',
  },

  // ── Items ──────────────────────────────────────────────────────
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fff',
    borderRadius: '10px',
    padding: '12px',
    border: '1px solid #E5E7EB',
  },
  itemImage: {
    width: '56px',
    height: '56px',
    borderRadius: '8px',
    objectFit: 'cover',
    background: '#F3F4F6',
    flexShrink: 0,
  },
  itemDetails: { flex: 1 },
  itemName: {
    fontWeight: '700',
    color: '#111827',
    fontSize: '14px',
    margin: '0 0 4px',
  },
  itemMeta: {
    fontSize: '12px',
    color: '#6B7280',
    margin: '2px 0',
  },
  itemTotal: {
    fontWeight: '800',
    color: '#059669',
    fontSize: '15px',
    whiteSpace: 'nowrap',
  },

  // ── Payment ────────────────────────────────────────────────────
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    padding: '12px',
    background: '#111827',
    borderRadius: '10px',
  },
  totalLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: '14px',
  },
  totalAmount: {
    color: '#34D399',
    fontWeight: '800',
    fontSize: '20px',
  },

  // ── Status Update ──────────────────────────────────────────────
  statusGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '14px',
  },
  statusChip: {
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all .2s',
  },
  saveBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #111827, #374151)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
  },

  // ── Confirm Modal ─────────────────────────────────────────────
  confirmBox: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,.3)',
  },
  confirmTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 12px',
  },
  confirmText: {
    color: '#6B7280',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 24px',
  },
  confirmBtns: {
    display: 'flex',
    gap: '12px',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    background: '#F3F4F6',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    color: '#374151',
  },
  deleteBtn: {
    flex: 1,
    padding: '12px',
    background: '#DC2626',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    color: '#fff',
  },

  // ── Toast ──────────────────────────────────────────────────────
  toast: {
    position: 'fixed',
    top: '24px',
    right: '24px',
    background: '#111827',
    color: '#fff',
    padding: '14px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 9999,
    boxShadow: '0 10px 30px rgba(0,0,0,.3)',
    animation: 'fadeIn .3s ease',
  },
};