import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import './AdminDashboard.css'

const ORDER_STATUSES = ['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_COLORS = {
  CONFIRMED: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: '#3b82f6' },
  PROCESSING: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: '#f59e0b' },
  SHIPPED: { bg: 'rgba(139, 92, 246, 0.15)', text: '#c084fc', border: '#8b5cf6' },
  DELIVERED: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: '#10b981' },
  CANCELLED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#ef4444' }
}

export function AdminDashboard({ onClose }) {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [promos, setPromos] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [toast, setToast] = useState(null)

  // Filters
  const [orderFilterStatus, setOrderFilterStatus] = useState('ALL')
  const [orderSearch, setOrderSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  // Product modal states
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL')
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    title: '',
    numericPrice: 2999,
    category: 'T-Shirt',
    gender: 'Unisex',
    image: '/products/tshirt-unleash-dragon.png',
    stock: 20,
    fit: 'flatlay',
    isFeatured: false,
    description: '',
    sizes: 'XS, S, M, L, XL, XXL'
  })

  // Image upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageUploadPreview, setImageUploadPreview] = useState('')
  const [imageMode, setImageMode] = useState('upload') // 'upload' | 'url'
  const fileInputRef = useRef(null)

  // Promo modal states
  const [isAddPromoOpen, setIsAddPromoOpen] = useState(false)
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 2000,
    description: ''
  })

  const showToast = useCallback((text, type = 'success') => {
    setToast({ text, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }, [])

  // Fetch on mount
  useEffect(() => {
    let ignore = false
    async function init() {
      try {
        const [statsRes, ordersRes, productsRes, promosRes, subsRes] = await Promise.all([
          fetch('/api/admin/stats').then((r) => r.json()),
          fetch('/api/admin/orders').then((r) => r.json()),
          fetch('/api/admin/products').then((r) => r.json()),
          fetch('/api/admin/promos').then((r) => r.json()),
          fetch('/api/admin/subscribers').then((r) => r.json())
        ])

        if (!ignore) {
          if (statsRes.success) setStats(statsRes.stats)
          if (ordersRes.success) setOrders(ordersRes.orders)
          if (productsRes.success) setProducts(productsRes.products)
          if (promosRes.success) setPromos(promosRes.promos)
          if (subsRes.success) setSubscribers(subsRes.subscribers)
          setLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          showToast('Failed to load admin data: ' + err.message, 'error')
          setLoading(false)
        }
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [showToast])

  // Manual refresh handler
  const handleRefresh = async () => {
    setLoading(true)
    try {
      const [statsRes, ordersRes, productsRes, promosRes, subsRes] = await Promise.all([
        fetch('/api/admin/stats').then((r) => r.json()),
        fetch('/api/admin/orders').then((r) => r.json()),
        fetch('/api/admin/products').then((r) => r.json()),
        fetch('/api/admin/promos').then((r) => r.json()),
        fetch('/api/admin/subscribers').then((r) => r.json())
      ])

      if (statsRes.success) setStats(statsRes.stats)
      if (ordersRes.success) setOrders(ordersRes.orders)
      if (productsRes.success) setProducts(productsRes.products)
      if (promosRes.success) setPromos(promosRes.promos)
      if (subsRes.success) setSubscribers(subsRes.subscribers)
      showToast('Admin data refreshed from server!')
    } catch (err) {
      showToast('Failed to refresh admin data: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId)
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Order #${orderId} status changed to ${newStatus}`)
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? data.order : o))
        )
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder(data.order)
        }
        // Refresh stats
        fetch('/api/admin/stats')
          .then((r) => r.json())
          .then((d) => d.success && setStats(d.stats))
      } else {
        showToast(data.message || 'Could not update status', 'error')
      }
    } catch (err) {
      showToast('Error updating status: ' + err.message, 'error')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Clear all orders handler
  const handleClearAllOrders = async () => {
    if (orders.length === 0) {
      showToast('Order history is already empty!', 'info')
      return
    }
    const confirmed = window.confirm(
      '⚠️ PERMANENT ACTION:\n\nAre you sure you want to DELETE ALL ORDERS and clear the entire order history?\n\nThis will reset store revenue to ₹0 and permanently remove all customer order records.'
    )
    if (!confirmed) return

    try {
      setLoading(true)
      const res = await fetch('/api/admin/orders/clear', { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setOrders([])
        setSelectedOrder(null)
        showToast('All order history successfully deleted and cleared!', 'success')
        const statsRes = await fetch('/api/admin/stats').then((r) => r.json())
        if (statsRes.success) setStats(statsRes.stats)
      } else {
        showToast(data.message || 'Failed to clear orders', 'error')
      }
    } catch (err) {
      showToast('Error clearing order history: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Delete single order handler
  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm(`Delete Order #${orderId} permanently?`)
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.orderId !== orderId && o.orderNumber !== orderId))
        if (selectedOrder && (selectedOrder.orderId === orderId || selectedOrder.orderNumber === orderId)) {
          setSelectedOrder(null)
        }
        showToast(`Order #${orderId} deleted successfully`)
        fetch('/api/admin/stats')
          .then((r) => r.json())
          .then((d) => d.success && setStats(d.stats))
      } else {
        showToast(data.message || 'Failed to delete order', 'error')
      }
    } catch (err) {
      showToast('Error deleting order: ' + err.message, 'error')
    }
  }

  // Image file upload handler
  const handleImageFileUpload = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP, etc.)', 'error')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('Image file size exceeds 20MB limit', 'error')
      return
    }

    try {
      setIsUploadingImage(true)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target.result
        setImageUploadPreview(base64Data)

        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            fileName: file.name
          })
        })
        const data = await res.json()
        if (data.success) {
          setProductForm((prev) => ({ ...prev, image: data.imageUrl }))
          setImageUploadPreview(data.imageUrl)
          showToast(`Image uploaded: ${data.fileName}`)
        } else {
          showToast(data.message || 'Image upload failed', 'error')
        }
        setIsUploadingImage(false)
      }
      reader.onerror = () => {
        showToast('Failed to read image file', 'error')
        setIsUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      showToast('Error uploading image: ' + err.message, 'error')
      setIsUploadingImage(false)
    }
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Product submission (create or edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    try {
      const sizesArray = productForm.sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const payload = {
        title: productForm.title,
        numericPrice: Number(productForm.numericPrice) || 0,
        category: productForm.category,
        gender: productForm.gender,
        image: productForm.image || '/products/tshirt-unleash-dragon.png',
        stock: Number(productForm.stock) || 0,
        fit: productForm.fit || '',
        isFeatured: Boolean(productForm.isFeatured),
        description: productForm.description,
        sizes: sizesArray.length > 0 ? sizesArray : ['S', 'M', 'L', 'XL']
      }

      if (editingProduct) {
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (data.success) {
          showToast(`Updated "${data.product.title}"`)
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? data.product : p))
          )
          setEditingProduct(null)
          setImageUploadPreview('')
          if (fileInputRef.current) fileInputRef.current.value = ''
          setIsAddProductOpen(false)
        } else {
          showToast(data.message || 'Error updating product', 'error')
        }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (data.success) {
          showToast(`Created new product "${data.product.title}"`)
          setProducts((prev) => [data.product, ...prev])
          setIsAddProductOpen(false)
          setImageUploadPreview('')
          if (fileInputRef.current) fileInputRef.current.value = ''
          setProductForm({
            title: '',
            numericPrice: 2999,
            category: 'T-Shirt',
            gender: 'Unisex',
            image: '/products/tshirt-unleash-dragon.png',
            stock: 20,
            fit: 'flatlay',
            isFeatured: false,
            description: '',
            sizes: 'XS, S, M, L, XL, XXL'
          })
        } else {
          showToast(data.message || 'Error creating product', 'error')
        }
      }
    } catch (err) {
      showToast('Error saving product: ' + err.message, 'error')
    }
  }

  // Delete product
  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the store catalog?`)) {
      return
    }
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast(`Deleted product "${title}"`)
        setProducts((prev) => prev.filter((p) => p.id !== id))
      } else {
        showToast(data.message || 'Failed to delete product', 'error')
      }
    } catch (err) {
      showToast('Error deleting product: ' + err.message, 'error')
    }
  }

  // Quick inline stock update
  const handleQuickStock = async (p, delta) => {
    const newStock = Math.max(0, (Number(p.stock) || 0) + delta)
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      })
      const data = await res.json()
      if (data.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, stock: newStock } : item))
        )
      }
    } catch (err) {
      showToast('Stock update failed: ' + err.message, 'error')
    }
  }

  // Add Promo code
  const handleSavePromo = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoForm.code.trim().toUpperCase(),
          discountType: promoForm.discountType,
          discountValue: Number(promoForm.discountValue) || 10,
          minOrder: Number(promoForm.minOrder) || 0,
          description: promoForm.description
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Promo code ${data.promo.code} activated!`)
        setPromos((prev) => [...prev, data.promo])
        setIsAddPromoOpen(false)
        setPromoForm({
          code: '',
          discountType: 'percentage',
          discountValue: 15,
          minOrder: 2000,
          description: ''
        })
      } else {
        showToast(data.message || 'Failed to create promo', 'error')
      }
    } catch (err) {
      showToast('Error creating promo: ' + err.message, 'error')
    }
  }

  // Delete Promo code
  const handleDeletePromo = async (code) => {
    if (!window.confirm(`Deactivate promo code ${code}?`)) return
    try {
      const res = await fetch(`/api/admin/promos/${code}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast(`Promo code ${code} deactivated`)
        setPromos((prev) => prev.filter((p) => p.code !== code))
      } else {
        showToast(data.message || 'Failed to delete promo', 'error')
      }
    } catch (err) {
      showToast('Error deleting promo: ' + err.message, 'error')
    }
  }

  // Copy subscribers list
  const handleCopySubscribers = () => {
    const emails = subscribers.map((s) => s.email).join('\n')
    navigator.clipboard.writeText(emails)
    showToast(`Copied ${subscribers.length} subscriber emails to clipboard!`)
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderFilterStatus === 'ALL' || (o.status || '').toUpperCase() === orderFilterStatus
    const q = orderSearch.trim().toLowerCase()
    if (!q) return matchesStatus
    const orderNum = (o.orderNumber || o.orderId || '').toLowerCase()
    const name = (o.customer?.name || '').toLowerCase()
    const phone = (o.customer?.phone || '').toLowerCase()
    const email = (o.customer?.email || '').toLowerCase()
    return matchesStatus && (orderNum.includes(q) || name.includes(q) || phone.includes(q) || email.includes(q))
  })

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      productCategoryFilter === 'ALL' || (p.category || '').toLowerCase() === productCategoryFilter.toLowerCase()
    const q = productSearch.trim().toLowerCase()
    if (!q) return matchesCat
    return matchesCat && ((p.title || '').toLowerCase().includes(q) || String(p.id) === q)
  })

  return (
    <div className="admin-portal-wrapper">
      {/* Toast notification banner */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          <span>{toast.type === 'error' ? '⚠️' : '✓'}</span>
          <p>{toast.text}</p>
        </div>
      )}

      {/* Top command navigation bar */}
      <header className="admin-topbar">
        <div className="admin-brand-section">
          <div className="admin-logo-mark">⚡</div>
          <div>
            <h1 className="admin-title">VANTA HQ // CONTROL CENTER</h1>
            <span className="admin-live-badge">
              <span className="admin-pulsing-dot"></span> LIVE BACKEND API ONLINE
            </span>
          </div>
        </div>

        <div className="admin-topbar-actions">
          <div className="admin-user-pill">
            <span className="admin-shield-mini">🛡️</span>
            <span>{user?.email || 'admin@vanta.com'}</span>
          </div>
          <button
            type="button"
            className="admin-action-btn secondary"
            onClick={handleRefresh}
            title="Refresh latest data from server"
          >
            ↻ Refresh Data
          </button>
          <button
            type="button"
            className="admin-action-btn primary store-return-btn"
            onClick={onClose}
          >
            ← Storefront
          </button>
          <button
            type="button"
            className="admin-action-btn danger"
            onClick={async () => {
              await logout()
              onClose()
            }}
            title="Sign out of Staff Admin"
          >
            ⏻ Logout Admin
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="admin-tab-nav" aria-label="Admin Sections">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders & Fulfillment{' '}
          <span className="tab-pill-count">{orders.length}</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🏷️ Catalog Inventory{' '}
          <span className="tab-pill-count">{products.length}</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'promos' ? 'active' : ''}`}
          onClick={() => setActiveTab('promos')}
        >
          🎟️ Promo Codes{' '}
          <span className="tab-pill-count">{promos.length}</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscribers')}
        >
          👥 Subscribers{' '}
          <span className="tab-pill-count">{subscribers.length}</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="admin-main-viewport">
        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-spinner"></div>
            <p>Syncing secure store telemetry with server...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && stats && (
              <div className="admin-tab-content overview-grid">
                {/* Metric Summary Cards */}
                <div className="admin-metrics-grid">
                  <div className="admin-metric-card revenue-card">
                    <div className="metric-header">
                      <span className="metric-label">GROSS REVENUE</span>
                      <span className="metric-icon">₹</span>
                    </div>
                    <h2 className="metric-value">{stats.formattedRevenue}</h2>
                    <p className="metric-subtext">Cumulative settled customer orders</p>
                  </div>

                  <div className="admin-metric-card">
                    <div className="metric-header">
                      <span className="metric-label">TOTAL ORDERS</span>
                      <span className="metric-icon">📦</span>
                    </div>
                    <h2 className="metric-value">{stats.totalOrders}</h2>
                    <p className="metric-subtext">Lifetime server processed drops</p>
                  </div>

                  <div className="admin-metric-card">
                    <div className="metric-header">
                      <span className="metric-label">ACTIVE PRODUCTS</span>
                      <span className="metric-icon">🏷️</span>
                    </div>
                    <h2 className="metric-value">{stats.activeProducts}</h2>
                    <p className="metric-subtext">Catalog SKUs currently live</p>
                  </div>

                  <div className="admin-metric-card">
                    <div className="metric-header">
                      <span className="metric-label">SUBSCRIBERS</span>
                      <span className="metric-icon">👥</span>
                    </div>
                    <h2 className="metric-value">{stats.totalSubscribers}</h2>
                    <p className="metric-subtext">Registered drop newsletter waitlist</p>
                  </div>
                </div>

                {/* Status Breakdown & Low Stock Section */}
                <div className="overview-two-col">
                  <div className="overview-panel">
                    <div className="panel-header">
                      <h3>ORDER PIPELINE BY STATUS</h3>
                      <button
                        type="button"
                        className="panel-link-btn"
                        onClick={() => setActiveTab('orders')}
                      >
                        Manage Orders →
                      </button>
                    </div>
                    <div className="status-bars-list">
                      {Object.entries(stats.statusCounts || {}).map(([statusKey, count]) => {
                        const styleInfo = STATUS_COLORS[statusKey] || {
                          bg: '#333',
                          text: '#fff',
                          border: '#555'
                        }
                        const pct = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0
                        return (
                          <div key={statusKey} className="status-progress-row">
                            <div className="status-row-label">
                              <span
                                className="status-dot"
                                style={{ backgroundColor: styleInfo.text }}
                              ></span>
                              <strong>{statusKey}</strong>
                              <span>{count} orders</span>
                            </div>
                            <div className="progress-track">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${Math.max(pct, count > 0 ? 8 : 0)}%`,
                                  backgroundColor: styleInfo.text
                                }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Low Stock Alerts */}
                  <div className="overview-panel">
                    <div className="panel-header">
                      <h3>INVENTORY HEALTH & LOW STOCK</h3>
                      <button
                        type="button"
                        className="panel-link-btn"
                        onClick={() => setActiveTab('products')}
                      >
                        Manage Stock →
                      </button>
                    </div>
                    {stats.lowStockProducts?.length === 0 ? (
                      <div className="empty-panel-state">
                        <p>✓ All products have healthy inventory levels (&gt; 15 units).</p>
                      </div>
                    ) : (
                      <div className="low-stock-list">
                        {stats.lowStockProducts?.map((item) => (
                          <div key={item.id} className="low-stock-item">
                            <div className="item-details">
                              <strong>{item.title}</strong>
                              <small>{item.price}</small>
                            </div>
                            <span className="stock-alert-pill">
                              {item.stock} LEFT
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Recent Orders Preview */}
                <div className="overview-panel full-width">
                  <div className="panel-header">
                    <h3>RECENT INCOMING ORDERS</h3>
                    <button
                      type="button"
                      className="panel-link-btn"
                      onClick={() => setActiveTab('orders')}
                    >
                      View All Orders ({orders.length}) →
                    </button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="empty-text">No orders placed yet. Place an order on the storefront to test.</p>
                  ) : (
                    <div className="recent-orders-table-wrapper">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Placed At</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((ord) => (
                            <tr key={ord.orderId}>
                              <td>
                                <span className="order-num-code">{ord.orderNumber}</span>
                              </td>
                              <td>
                                <div>
                                  <strong>{ord.customer?.name}</strong>
                                  <small className="cell-subtext">{ord.customer?.phone}</small>
                                </div>
                              </td>
                              <td>{ord.items?.length} item(s)</td>
                              <td>
                                <strong>₹{ord.pricing?.totalAmount?.toLocaleString('en-IN')}</strong>
                              </td>
                              <td>
                                <span className="payment-pill">{ord.paymentMethod}</span>
                              </td>
                              <td>
                                <span
                                  className="status-pill"
                                  style={{
                                    backgroundColor: STATUS_COLORS[ord.status]?.bg,
                                    color: STATUS_COLORS[ord.status]?.text,
                                    borderColor: STATUS_COLORS[ord.status]?.border
                                  }}
                                >
                                  {ord.status}
                                </span>
                              </td>
                              <td>
                                <small className="cell-subtext">
                                  {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </small>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="table-sm-btn"
                                  onClick={() => {
                                    setSelectedOrder(ord)
                                    setActiveTab('orders')
                                  }}
                                >
                                  Inspect →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ORDERS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="admin-tab-content">
                {/* Search & Filter Toolbar */}
                <div className="admin-toolbar">
                  <div className="toolbar-search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search by Order ID, Customer Name, Phone, or Email..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                    {orderSearch && (
                      <button
                        type="button"
                        className="clear-search-btn"
                        onClick={() => setOrderSearch('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="status-filter-buttons">
                    {ORDER_STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`filter-btn ${orderFilterStatus === status ? 'active' : ''}`}
                        onClick={() => setOrderFilterStatus(status)}
                      >
                        {status}
                        {status !== 'ALL' && (
                          <span className="count-dot">
                            {orders.filter((o) => (o.status || '').toUpperCase() === status).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="orders-toolbar-actions">
                    <button
                      type="button"
                      className="admin-action-btn danger clear-orders-btn"
                      onClick={handleClearAllOrders}
                      disabled={orders.length === 0}
                      title="Permanently wipe all orders and reset revenue statistics"
                    >
                      🗑️ Clear All Orders ({orders.length})
                    </button>
                  </div>
                </div>

                {/* Orders List Table */}
                {filteredOrders.length === 0 ? (
                  <div className="empty-results-box">
                    <p>
                      {orders.length === 0
                        ? '✨ No orders in database. All order history is completely cleared.'
                        : 'No orders found matching the filter criteria.'}
                    </p>
                    {orders.length > 0 && (
                      <button
                        type="button"
                        className="admin-action-btn secondary"
                        onClick={() => {
                          setOrderSearch('')
                          setOrderFilterStatus('ALL')
                        }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Placed At</th>
                          <th>Customer Details</th>
                          <th>Items</th>
                          <th>Amount</th>
                          <th>Payment</th>
                          <th>Live Fulfillment Status</th>
                          <th>Quick Status Action</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((ord) => (
                          <tr key={ord.orderId}>
                            <td>
                              <button
                                type="button"
                                className="order-link-trigger"
                                onClick={() => setSelectedOrder(ord)}
                                title="Click to view complete order dossier"
                              >
                                {ord.orderNumber} 🔍
                              </button>
                            </td>
                            <td>
                              <small className="cell-subtext">
                                {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </small>
                            </td>
                            <td>
                              <div>
                                <strong>{ord.customer?.name}</strong>
                                <div className="cell-subtext">{ord.customer?.phone}</div>
                                <div className="cell-subtext">{ord.customer?.city} ({ord.customer?.pincode})</div>
                              </div>
                            </td>
                            <td>
                              <div className="order-items-snippet">
                                {ord.items?.map((item, idx) => (
                                  <span key={idx} className="item-tag">
                                    {item.title} ({item.size}) x{item.quantity}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <div className="price-stack">
                                <strong>₹{ord.pricing?.totalAmount?.toLocaleString('en-IN')}</strong>
                                {ord.pricing?.appliedPromo && (
                                  <small className="promo-badge-tag">
                                    Promo: {ord.pricing.appliedPromo} (-₹{ord.pricing.discountAmount})
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="payment-pill">{ord.paymentMethod}</span>
                            </td>
                            <td>
                              <span
                                className="status-pill"
                                style={{
                                  backgroundColor: STATUS_COLORS[ord.status]?.bg,
                                  color: STATUS_COLORS[ord.status]?.text,
                                  borderColor: STATUS_COLORS[ord.status]?.border
                                }}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td>
                              <div className="status-changer-select-wrap">
                                <select
                                  value={ord.status}
                                  disabled={updatingOrderId === ord.orderId}
                                  onChange={(e) => handleUpdateOrderStatus(ord.orderId, e.target.value)}
                                  className="admin-status-dropdown"
                                >
                                  <option value="CONFIRMED">CONFIRMED</option>
                                  <option value="PROCESSING">PROCESSING</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                                {updatingOrderId === ord.orderId && (
                                  <span className="mini-spin">↻</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="table-row-actions">
                                <button
                                  type="button"
                                  className="table-sm-btn inspect-btn"
                                  onClick={() => setSelectedOrder(ord)}
                                  title="Inspect complete order dossier"
                                >
                                  Inspect
                                </button>
                                <button
                                  type="button"
                                  className="table-sm-btn danger-btn"
                                  onClick={() => handleDeleteOrder(ord.orderId)}
                                  title="Delete order permanently"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PRODUCTS CATALOG INVENTORY */}
            {activeTab === 'products' && (
              <div className="admin-tab-content">
                <div className="admin-toolbar">
                  <div className="toolbar-search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search products by title or ID..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>

                  <div className="category-filter-select">
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                    >
                      <option value="ALL">All Categories</option>
                      <option value="T-Shirt">T-Shirts</option>
                      <option value="Hoodie">Hoodies</option>
                      <option value="Shirt">Shirts / Headwear</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="admin-action-btn primary add-product-btn"
                    onClick={() => {
                      setEditingProduct(null)
                      setImageUploadPreview('')
                      setImageMode('upload')
                      if (fileInputRef.current) fileInputRef.current.value = ''
                      setProductForm({
                        title: '',
                        numericPrice: 2999,
                        category: 'T-Shirt',
                        gender: 'Unisex',
                        image: '',
                        stock: 20,
                        fit: 'flatlay',
                        isFeatured: false,
                        description: '',
                        sizes: 'XS, S, M, L, XL, XXL'
                      })
                      setIsAddProductOpen(true)
                    }}
                  >
                    + Add New Product
                  </button>
                </div>

                <div className="products-admin-grid">
                  {filteredProducts.map((p) => (
                    <div key={p.id} className="admin-product-card">
                      <div className="product-card-img-wrap">
                        <img src={p.image} alt={p.title} />
                        {p.isFeatured && <span className="featured-flag">FEATURED</span>}
                        <span className="product-id-tag">#{p.id}</span>
                      </div>

                      <div className="admin-product-card-body">
                        <div className="card-top-row">
                          <span className="cat-badge">{p.gender} • {p.category}</span>
                          <span className="price-tag">{p.price}</span>
                        </div>
                        <h4 className="product-card-title">{p.title}</h4>
                        <p className="product-card-desc">{p.description}</p>

                        <div className="stock-counter-row">
                          <span className="stock-label">Stock Units:</span>
                          <div className="stock-stepper">
                            <button
                              type="button"
                              onClick={() => handleQuickStock(p, -1)}
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            <span className={`stock-number ${p.stock <= 10 ? 'critical' : ''}`}>
                              {p.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStock(p, 1)}
                              title="Increase stock by 1"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="admin-product-card-actions">
                          <button
                            type="button"
                            className="card-action-btn edit"
                            onClick={() => {
                              setEditingProduct(p)
                              setImageUploadPreview(p.image || '')
                              setImageMode('upload')
                              if (fileInputRef.current) fileInputRef.current.value = ''
                              setProductForm({
                                title: p.title,
                                numericPrice: p.numericPrice,
                                category: p.category,
                                gender: p.gender,
                                image: p.image,
                                stock: p.stock,
                                fit: p.fit || '',
                                isFeatured: Boolean(p.isFeatured),
                                description: p.description || '',
                                sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : 'S, M, L, XL'
                              })
                              setIsAddProductOpen(true)
                            }}
                          >
                            Edit Item
                          </button>
                          <button
                            type="button"
                            className="card-action-btn delete"
                            onClick={() => handleDeleteProduct(p.id, p.title)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PROMO CODES */}
            {activeTab === 'promos' && (
              <div className="admin-tab-content">
                <div className="admin-toolbar">
                  <div>
                    <h3>ACTIVE DISCOUNT & PROMO CODES</h3>
                    <p className="cell-subtext">Coupons validated in real-time during checkout calculation</p>
                  </div>
                  <button
                    type="button"
                    className="admin-action-btn primary"
                    onClick={() => setIsAddPromoOpen(true)}
                  >
                    + Create Promo Code
                  </button>
                </div>

                <div className="promos-grid">
                  {promos.map((promo) => (
                    <div key={promo.code} className="promo-card">
                      <div className="promo-card-header">
                        <span className="promo-code-badge">{promo.code}</span>
                        <button
                          type="button"
                          className="promo-delete-btn"
                          onClick={() => handleDeletePromo(promo.code)}
                          title="Deactivate code"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="promo-card-body">
                        <h4 className="promo-value">
                          {promo.discountType === 'percentage'
                            ? `${promo.discountValue}% OFF`
                            : `₹${promo.discountValue} OFF`}
                        </h4>
                        <p className="promo-desc">{promo.description}</p>
                        <div className="promo-meta">
                          <span>Min Order: ₹{promo.minOrder?.toLocaleString('en-IN') || 0}</span>
                          <span className="promo-active-pill">ACTIVE</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: SUBSCRIBERS */}
            {activeTab === 'subscribers' && (
              <div className="admin-tab-content">
                <div className="admin-toolbar">
                  <div>
                    <h3>SUBSCRIBERS LIST ({subscribers.length})</h3>
                    <p className="cell-subtext">Registered emails for exclusive drop alerts and secret discounts</p>
                  </div>
                  {subscribers.length > 0 && (
                    <button
                      type="button"
                      className="admin-action-btn secondary"
                      onClick={handleCopySubscribers}
                    >
                      📋 Copy All Emails
                    </button>
                  )}
                </div>

                {subscribers.length === 0 ? (
                  <div className="empty-results-box">
                    <p>No subscribers on the waitlist yet.</p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Subscriber Email</th>
                          <th>Registered Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((sub, idx) => (
                          <tr key={sub.email}>
                            <td>{idx + 1}</td>
                            <td>
                              <strong>{sub.email}</strong>
                            </td>
                            <td>
                              <small className="cell-subtext">
                                {new Date(sub.subscribedAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </small>
                            </td>
                            <td>
                              <span className="status-pill" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: '#10b981' }}>
                                ACTIVE
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL 1: ORDER DOSSIER / DETAILS INSPECTION */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-box large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>ORDER DOSSIER: {selectedOrder.orderNumber}</h3>
                <small className="cell-subtext">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </small>
              </div>
              <div className="modal-header-actions">
                <button
                  type="button"
                  className="table-sm-btn danger-btn dossier-del-btn"
                  onClick={() => handleDeleteOrder(selectedOrder.orderId)}
                  title="Permanently delete this order"
                >
                  🗑️ Delete Order
                </button>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="order-dossier-grid">
              {/* Customer & Shipping Section */}
              <div className="dossier-section">
                <h4>CUSTOMER & SHIPPING DETAILS</h4>
                <div className="dossier-details-box">
                  <p><strong>Name:</strong> {selectedOrder.customer?.name}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer?.phone}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer?.email || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedOrder.customer?.address}</p>
                  <p><strong>City & PIN:</strong> {selectedOrder.customer?.city}, {selectedOrder.customer?.state} - {selectedOrder.customer?.pincode}</p>
                  <p><strong>Carrier:</strong> {selectedOrder.shipping?.method}</p>
                  <p><strong>Tracking Status:</strong> {selectedOrder.shipping?.trackingStatus}</p>
                </div>
              </div>

              {/* Status Update & Financials */}
              <div className="dossier-section">
                <h4>ORDER STATUS & FINANCIALS</h4>
                <div className="status-control-box">
                  <label htmlFor="status-select">Live Status:</label>
                  <select
                    id="status-select"
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.orderId, e.target.value)}
                    className="admin-status-dropdown large"
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="pricing-summary-box">
                  <div className="pricing-row">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.pricing?.subtotal?.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedOrder.pricing?.discountAmount > 0 && (
                    <div className="pricing-row discount">
                      <span>Promo ({selectedOrder.pricing?.appliedPromo})</span>
                      <span>-₹{selectedOrder.pricing?.discountAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="pricing-row">
                    <span>Shipping</span>
                    <span>₹{selectedOrder.pricing?.shippingFee || 0}</span>
                  </div>
                  <div className="pricing-row total">
                    <span>Total Settled</span>
                    <span>₹{selectedOrder.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pricing-row payment">
                    <span>Payment Mode</span>
                    <span>{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="dossier-section full-width">
                <h4>PURCHASED ITEMS ({selectedOrder.items?.length})</h4>
                <div className="dossier-items-list">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="dossier-item-row">
                      <img src={item.image} alt={item.title} className="dossier-item-img" />
                      <div className="dossier-item-info">
                        <strong>{item.title}</strong>
                        <small>Size: {item.size} • Qty: {item.quantity}</small>
                      </div>
                      <div className="dossier-item-price">
                        <strong>₹{(item.numericPrice * item.quantity).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PRODUCT */}
      {isAddProductOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddProductOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingProduct ? `EDIT PRODUCT: #${editingProduct.id}` : 'ADD NEW CATALOG ITEM'}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddProductOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. CYBERPUNK ACID OVERSIZED TEE"
                />
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.numericPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, numericPrice: e.target.value })
                    }
                    placeholder="3499"
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value })
                    }
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option value="T-Shirt">T-Shirt</option>
                    <option value="Hoodie">Hoodie</option>
                    <option value="Shirt">Shirt</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Gender / Section</label>
                  <select
                    value={productForm.gender}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>
              </div>

              {/* Product Image Section: File Upload or Web URL */}
              <div className="form-group image-upload-group">
                <div className="image-mode-header">
                  <label className="form-label-with-mode">
                    <span>Product Image *</span>
                    <span className="mode-desc">
                      {imageMode === 'upload' ? 'Upload from device' : 'Web image URL'}
                    </span>
                  </label>
                  <div className="image-mode-toggles">
                    <button
                      type="button"
                      className={`mode-toggle-btn ${imageMode === 'upload' ? 'active' : ''}`}
                      onClick={() => setImageMode('upload')}
                    >
                      📁 Upload File
                    </button>
                    <button
                      type="button"
                      className={`mode-toggle-btn ${imageMode === 'url' ? 'active' : ''}`}
                      onClick={() => setImageMode('url')}
                    >
                      🔗 Paste URL
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <div className="image-uploader-box">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageFileUpload(e.target.files[0])
                        }
                      }}
                    />

                    {/* Drag and Drop Zone */}
                    <div
                      className={`image-dropzone ${isUploadingImage ? 'uploading' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploadingImage ? (
                        <div className="uploader-loading">
                          <span className="admin-spinner sm"></span>
                          <p>Uploading and storing product image...</p>
                        </div>
                      ) : (
                        <div className="uploader-prompt">
                          <span className="uploader-icon">📷</span>
                          <p className="uploader-title">Click to upload or drag & drop image here</p>
                          <span className="uploader-hint">PNG, JPG, WEBP or GIF (Max 20MB)</span>
                        </div>
                      )}
                    </div>

                    {/* Live Preview Box */}
                    {(imageUploadPreview || productForm.image) && (
                      <div className="image-preview-card">
                        <img
                          src={imageUploadPreview || productForm.image}
                          alt="Product preview"
                          className="preview-img-thumbnail"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                        <div className="preview-meta">
                          <span className="preview-status-badge">✓ Image Ready</span>
                          <span className="preview-path" title={productForm.image || 'Uploaded file'}>
                            {productForm.image || 'Local preview ready'}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="preview-remove-btn"
                          title="Remove image"
                          onClick={(e) => {
                            e.stopPropagation()
                            setImageUploadPreview('')
                            setProductForm((prev) => ({ ...prev, image: '' }))
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="image-url-input-wrap">
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={(e) => {
                        const val = e.target.value
                        setProductForm({ ...productForm, image: val })
                        setImageUploadPreview(val)
                      }}
                      placeholder="/products/tshirt-unleash-dragon.png or https://..."
                    />
                    {productForm.image && (
                      <div className="url-preview-mini">
                        <img
                          src={productForm.image}
                          alt="URL preview"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Available Sizes (comma separated)</label>
                <input
                  type="text"
                  value={productForm.sizes}
                  onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                  placeholder="XS, S, M, L, XL, XXL"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  placeholder="Heavyweight 240 GSM French Terry cotton tee with premium screenprint..."
                ></textarea>
              </div>

              <div className="form-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) =>
                      setProductForm({ ...productForm, isFeatured: e.target.checked })
                    }
                  />
                  Mark as Featured Product
                </label>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="admin-action-btn secondary"
                  onClick={() => setIsAddProductOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE PROMO CODE */}
      {isAddPromoOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddPromoOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>CREATE PROMO CODE</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddPromoOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="admin-form">
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FLASH20"
                />
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, discountType: e.target.value })
                    }
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed">Fixed Amount (₹ OFF)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={promoForm.discountValue}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, discountValue: e.target.value })
                    }
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Minimum Order Value (₹)</label>
                <input
                  type="number"
                  value={promoForm.minOrder}
                  onChange={(e) => setPromoForm({ ...promoForm, minOrder: e.target.value })}
                  placeholder="2500"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  placeholder="20% OFF on drops above ₹2,500"
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="admin-action-btn secondary"
                  onClick={() => setIsAddPromoOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
