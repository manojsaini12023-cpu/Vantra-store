import { useState, useId } from 'react'
import { useCurrency } from './useCurrency'
import { PaymentModal } from './PaymentModal'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const FREE_SHIPPING_THRESHOLD = 4999

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateSize,
  onClearCart,
  autoOpenCheckout = false,
}) {
  const { formatPrice } = useCurrency()
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  const [pincode, setPincode] = useState('')
  const [pincodeStatus, setPincodeStatus] = useState(null)
  const [pincodeLoading, setPincodeLoading] = useState(false)

  // Checkout Modal State
  const [manualCheckoutOpen, setManualCheckoutOpen] = useState(false)
  const [checkoutDismissed, setCheckoutDismissed] = useState(false)
  const isCheckoutOpen = (autoOpenCheckout && !checkoutDismissed) || manualCheckoutOpen
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [orderError, setOrderError] = useState('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Customer Delivery Info
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('COD')

  const promoInputId = useId()
  const pincodeInputId = useId()

  if (!isOpen) return null

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.numericPrice * item.quantity, 0)

  // Shipping
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0
  const shippingCharge = isFreeShipping ? 0 : 199
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  const finalTotal = Math.max(0, subtotal - promoDiscount + (items.length > 0 ? shippingCharge : 0))

  // Handle Promo Code via Backend API
  const handleApplyPromo = async (codeToApply) => {
    const code = (codeToApply || promoInput).trim().toUpperCase()
    if (!code) return
    setPromoError('')
    setPromoLoading(true)

    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      })
      const data = await res.json()

      if (data.success && data.valid) {
        setAppliedPromo(data.code)
        setPromoDiscount(data.discountAmount)
        setPromoInput(data.code)
        setPromoError('')
      } else {
        setPromoError(data.message || 'Invalid promo code')
      }
    } catch {
      // Offline fallback
      if (code === 'VANTA10') {
        const disc = Math.round(subtotal * 0.1)
        setAppliedPromo('VANTA10')
        setPromoDiscount(disc)
        setPromoInput('VANTA10')
      } else {
        setPromoError('Failed to validate promo. Try VANTA10.')
      }
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoDiscount(0)
    setPromoInput('')
    setPromoError('')
  }

  // Handle Indian PIN Code Geocoding & City/State Auto-Detection
  const handlePincodeChange = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6)
    setPincode(clean)
    setCustomer((prev) => ({ ...prev, pincode: clean }))

    if (clean.length === 6) {
      setPincodeLoading(true)
      fetch(`/api/shipping/check-pincode/${clean}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.valid) {
            setPincodeStatus(`✓ Detected ${data.city}, ${data.state} • ${data.carrier}`)
            setCustomer((prev) => ({
              ...prev,
              city: data.city || prev.city,
              state: data.state || prev.state,
              pincode: clean
            }))
          } else {
            setPincodeStatus(data.message || 'Delivery currently unavailable to this PIN.')
          }
        })
        .catch(() => {
          setPincodeStatus(`Fast Express Delivery active for PIN ${clean}.`)
        })
        .finally(() => {
          setPincodeLoading(false)
        })
    }
  }

  // Handle Checkout Order Submission via Backend API
  const handleOrderSubmit = async (e) => {
    e.preventDefault()
    setOrderError('')

    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setOrderError('Please fill in your name, contact phone, and delivery address.')
      return
    }

    const pinToSubmit = customer.pincode.trim() || pincode.trim()
    if (pinToSubmit.length !== 6) {
      setOrderError('Please enter a valid 6-digit PIN code for shipping.')
      return
    }

    setIsSubmittingOrder(true)

    const orderPayload = {
      customer: {
        ...customer,
        pincode: pinToSubmit,
      },
      items,
      promoCode: appliedPromo,
      paymentMethod,
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })
      const data = await res.json()

      if (data.success && data.order) {
        setPlacedOrder(data.order)
        setManualCheckoutOpen(false)
        setCheckoutDismissed(true)
        if (onClearCart) {
          onClearCart()
        }

        // If online prepaid chosen, open the payment modal immediately
        if (paymentMethod === 'UPI' || paymentMethod === 'CARD') {
          setIsPaymentModalOpen(true)
        }
      } else {
        setOrderError(data.message || 'Failed to place order. Please check your details.')
      }
    } catch (err) {
      setOrderError('Backend server connection error. Please try again in a moment.')
      console.error(err)
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const handlePaymentSuccess = (paymentData) => {
    setIsPaymentModalOpen(false)
    if (placedOrder) {
      setPlacedOrder((prev) => ({
        ...prev,
        paymentStatus: 'PAID_PREPAID',
        paymentMethod: paymentData.method || 'ONLINE_PREPAID'
      }))
    }
  }

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping Cart"
      >
        {/* Drawer Header */}
        <div className="cart-header">
          <div className="cart-header-title-wrap">
            <h2 className="cart-title">YOUR BAG</h2>
            <span className="cart-count-badge">
              {items.reduce((acc, i) => acc + i.quantity, 0)} {items.length === 1 ? 'PIECE' : 'PIECES'}
            </span>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Close cart drawer"
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Progress Banner */}
        <div className="cart-shipping-banner">
          <div className="shipping-banner-text">
            {isFreeShipping ? (
              <span className="free-shipping-unlocked">
                🎉 <strong>FREE EXPRESS SHIPPING UNLOCKED!</strong> All orders &gt; ₹4,999 ship free across India.
              </span>
            ) : (
              <span>
                Add <strong>{formatPrice(amountNeededForFreeShipping)}</strong> more to unlock <strong>Free Express Shipping</strong>
              </span>
            )}
          </div>
          <div className="shipping-progress-track">
            <div
              className="shipping-progress-fill"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Offers Ribbon */}
        <div className="cart-offers-ribbon">
          <div className="offer-tag">
            <span className="offer-badge">LIMITED DROP</span>
            <span className="offer-detail">Use code <strong>VANTA10</strong> for 10% instant discount</span>
            {!appliedPromo && (
              <button
                type="button"
                className="quick-apply-btn"
                onClick={() => handleApplyPromo('VANTA10')}
              >
                APPLY
              </button>
            )}
          </div>
        </div>

        {/* Items List / Empty State */}
        <div className="cart-items-container">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-cart-graphic">
                <span className="empty-cart-icon">🛍️</span>
              </div>
              <h3 className="empty-title">YOUR BAG IS CURRENTLY EMPTY</h3>
              <p className="empty-subtitle">
                The street rewards those who move fast. Explore our latest archival drop before sizes sell out.
              </p>
              <button
                type="button"
                className="cart-shop-now-btn"
                onClick={onClose}
              >
                EXPLORE NEW DROPS
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.cartId} className="cart-item-card">
                  <div className={`cart-item-img-wrap ${item.fit || ''}`}>
                    <img src={item.image} alt={item.title} />
                  </div>

                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <div>
                        <span className="cart-item-category">{item.category || 'STREETWEAR'}</span>
                        <h4 className="cart-item-title">{item.title}</h4>
                      </div>
                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => onRemoveItem(item.cartId)}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="cart-item-price-row">
                      <span className="cart-price">{formatPrice(item.numericPrice * item.quantity)}</span>
                      {item.quantity > 1 && (
                        <span className="cart-unit-price">({formatPrice(item.numericPrice)} each)</span>
                      )}
                    </div>

                    {/* All Sizes Selector for this item */}
                    <div className="cart-size-selector">
                      <span className="cart-size-label">SIZE:</span>
                      <div className="cart-size-pills">
                        {ALL_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            className={`cart-size-pill ${item.size === size ? 'active' : ''}`}
                            onClick={() => onUpdateSize(item.cartId, size)}
                            title={`Select size ${size}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="cart-item-bottom">
                      <div className="cart-qty-stepper">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartId, -1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartId, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {items.length > 0 && (
          <div className="cart-footer">
            {/* Delivery PIN Code Checker */}
            <div className="cart-pincode-box">
              <label htmlFor={pincodeInputId} className="pincode-label">
                📍 ESTIMATE DELIVERY &amp; DISPATCH
              </label>
              <div className="pincode-input-row">
                <input
                  id={pincodeInputId}
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN code (e.g. 110001)"
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                />
              </div>
              {pincodeLoading && <small className="pincode-status">Auto-geocoding delivery hub...</small>}
              {pincodeStatus && !pincodeLoading && (
                <p className={`pincode-status ${pincodeStatus.includes('✓') ? 'success' : ''}`}>
                  {pincodeStatus}
                </p>
              )}
            </div>

            {/* Promo Code Input */}
            <div className="cart-promo-section">
              <label htmlFor={promoInputId} className="promo-label">
                COUPON / PROMO CODE
              </label>
              <div className="promo-input-row">
                <input
                  id={promoInputId}
                  type="text"
                  placeholder="Discount Code (e.g. VANTA10, VANTA500)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                />
                {appliedPromo ? (
                  <button type="button" className="promo-btn remove" onClick={handleRemovePromo}>
                    REMOVE
                  </button>
                ) : (
                  <button
                    type="button"
                    className="promo-btn apply"
                    onClick={() => handleApplyPromo()}
                    disabled={promoLoading}
                  >
                    {promoLoading ? 'CHECKING...' : 'APPLY'}
                  </button>
                )}
              </div>
              {appliedPromo && (
                <p className="promo-success">
                  ✓ Code <strong>{appliedPromo}</strong> applied! You saved {formatPrice(promoDiscount)}.
                </p>
              )}
              {promoError && <p className="promo-error">{promoError}</p>}
            </div>

            {/* Bill Breakdown */}
            <div className="cart-breakdown">
              <div className="breakdown-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="breakdown-row discount">
                  <span>Promo Discount ({appliedPromo})</span>
                  <span>-{formatPrice(promoDiscount)}</span>
                </div>
              )}
              <div className="breakdown-row">
                <span>Express Shipping</span>
                <span>
                  {isFreeShipping ? (
                    <strong className="free-text">FREE</strong>
                  ) : (
                    formatPrice(shippingCharge)
                  )}
                </span>
              </div>
              <div className="breakdown-row total">
                <span>Total Amount (incl. taxes)</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              className="cart-checkout-btn"
              onClick={() => {
                setManualCheckoutOpen(true)
                setCheckoutDismissed(false)
              }}
            >
              PROCEED TO CHECKOUT • {formatPrice(finalTotal)}
            </button>

            {/* Trust Badges */}
            <div className="cart-trust-row">
              <span>🔒 100% Secure Checkout</span>
              <span>⚡ Razorpay &amp; UPI</span>
              <span>🔄 7-Day Free Exchange</span>
            </div>
          </div>
        )}
      </aside>

      {/* Interactive Checkout Modal */}
      {isCheckoutOpen && (
        <div
          className="checkout-modal-overlay"
          onClick={() => {
            setManualCheckoutOpen(false)
            setCheckoutDismissed(true)
          }}
        >
          <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <div>
                <span className="checkout-eyebrow">FAST &amp; SECURE CHECKOUT</span>
                <h3>SHIPPING &amp; PAYMENT DETAILS</h3>
              </div>
              <button
                type="button"
                className="checkout-modal-close"
                onClick={() => {
                  setManualCheckoutOpen(false)
                  setCheckoutDismissed(true)
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="checkout-form">
              <div className="checkout-fields-grid">
                <div className="checkout-field-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter recipient name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  />
                </div>

                <div className="checkout-field-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  />
                </div>

                <div className="checkout-field-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="For invoice and tracking alerts"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  />
                </div>

                <div className="checkout-field-group full">
                  <label>Street Address / Apartment *</label>
                  <input
                    type="text"
                    required
                    placeholder="House/Flat No., Building, Street Name"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  />
                </div>

                <div className="checkout-field-group">
                  <label>PIN Code * (Auto-Detects City)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit PIN"
                    value={customer.pincode || pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                  />
                </div>

                <div className="checkout-field-group">
                  <label>City &amp; State *</label>
                  <input
                    type="text"
                    required
                    placeholder="Auto-fills from PIN"
                    value={customer.city ? `${customer.city}${customer.state ? `, ${customer.state}` : ''}` : ''}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="checkout-payment-section">
                <label className="checkout-section-title">CHOOSE PAYMENT METHOD</label>
                <div className="payment-options-grid">
                  <label className={`payment-pill ${paymentMethod === 'COD' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                    />
                    <div className="payment-pill-content">
                      <strong>💵 Cash on Delivery</strong>
                      <span>Pay at doorstep</span>
                    </div>
                  </label>

                  <label className={`payment-pill ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                    />
                    <div className="payment-pill-content">
                      <strong>⚡ Instant UPI / QR</strong>
                      <span>GPay, PhonePe, Paytm</span>
                    </div>
                  </label>

                  <label className={`payment-pill ${paymentMethod === 'CARD' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="CARD"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                    />
                    <div className="payment-pill-content">
                      <strong>💳 Card / NetBanking</strong>
                      <span>Visa, MC, RuPay, HDFC</span>
                    </div>
                  </label>
                </div>
              </div>

              {orderError && <p className="checkout-error-banner">{orderError}</p>}

              {/* Final Summary in Checkout */}
              <div className="checkout-order-summary-box">
                <div className="checkout-summary-line">
                  <span>Order Items:</span>
                  <strong>{items.length} items</strong>
                </div>
                {appliedPromo && (
                  <div className="checkout-summary-line green">
                    <span>Coupon ({appliedPromo}):</span>
                    <strong>-{formatPrice(promoDiscount)}</strong>
                  </div>
                )}
                <div className="checkout-summary-line total">
                  <span>Grand Total to Pay:</span>
                  <strong>{formatPrice(finalTotal)}</strong>
                </div>
              </div>

              <button
                type="submit"
                className="checkout-confirm-btn"
                disabled={isSubmittingOrder}
              >
                {isSubmittingOrder
                  ? 'COMMUNICATING WITH BACKEND...'
                  : paymentMethod === 'COD'
                  ? `CONFIRM CASH ON DELIVERY • ${formatPrice(finalTotal)}`
                  : `PROCEED TO PAY ONLINE (UPI / CARDS) • ${formatPrice(finalTotal)}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Online Prepaid Payment Modal */}
      {isPaymentModalOpen && placedOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={placedOrder.pricing?.totalAmount || finalTotal}
          formattedAmount={formatPrice(placedOrder.pricing?.totalAmount || finalTotal)}
          orderNumber={placedOrder.orderNumber}
          customer={placedOrder.customer}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Order Confirmed Receipt Modal */}
      {placedOrder && !isPaymentModalOpen && (
        <div className="order-receipt-overlay" onClick={() => setPlacedOrder(null)}>
          <div className="order-receipt-card" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-success-icon">✦</div>
            <span className="receipt-badge">ORDER CONFIRMED</span>
            <h2>THANK YOU, {placedOrder.customer.name.toUpperCase()}</h2>
            <p className="receipt-order-id">
              ORDER REFERENCE: <strong>{placedOrder.orderNumber}</strong>
            </p>

            <div className="receipt-details-card">
              <div className="receipt-row">
                <span>Fulfillment Status</span>
                <strong className="status-badge green">{placedOrder.status}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Mode</span>
                <strong>{placedOrder.paymentMethod} ({placedOrder.paymentStatus})</strong>
              </div>
              <div className="receipt-row">
                <span>Deliver To</span>
                <span className="receipt-address">
                  {placedOrder.customer.address}, {placedOrder.customer.city} - {placedOrder.customer.pincode}
                </span>
              </div>
              <div className="receipt-row">
                <span>Estimated Arrival</span>
                <strong>{placedOrder.shipping?.estimatedDelivery}</strong>
              </div>
              <div className="receipt-row">
                <span>Carrier</span>
                <span>{placedOrder.shipping?.method}</span>
              </div>
              <div className="receipt-row total">
                <span>Total Settled</span>
                <strong>{formatPrice(placedOrder.pricing.totalAmount)}</strong>
              </div>
            </div>

            <p className="receipt-info-note">
              A dispatch confirmation and live BlueDart tracking link have been scheduled for your phone <strong>{placedOrder.customer.phone}</strong>.
            </p>

            {/* Official Tax Invoice Button */}
            <div className="receipt-actions-stack">
              <a
                href={`/api/invoice/${placedOrder.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="receipt-invoice-btn"
              >
                🖨️ View &amp; Print Official Tax Invoice (GST)
              </a>

              <button
                type="button"
                className="primary-btn receipt-done-btn"
                onClick={() => {
                  setPlacedOrder(null)
                  onClose()
                }}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
