import { useState, useEffect } from 'react'
import './PaymentModal.css'

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  formattedAmount,
  orderNumber,
  customer,
  onPaymentSuccess
}) {
  const [activeTab, setActiveTab] = useState('qr') // 'qr' | 'upi' | 'card' | 'netbanking'
  const [loading, setLoading] = useState(true)
  const [intent, setIntent] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [upiId, setUpiId] = useState('')
  const [cardData, setCardData] = useState({ number: '4532 8921 4455 0192', expiry: '08/29', cvv: '782', name: customer?.name || 'Streetwear Collector' })
  const [selectedBank, setSelectedBank] = useState('HDFC')

  useEffect(() => {
    if (!isOpen) return

    let ignore = false
    fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        customer,
        orderId: orderNumber
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setIntent(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Payment intent initialization failed:', err)
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [isOpen, amount, orderNumber, customer])

  if (!isOpen) return null

  const handleSimulatePayment = async (methodUsed) => {
    setProcessing(true)
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentId: intent?.intentId || `order_rzp_${Date.now()}`,
          method: methodUsed,
          orderId: orderNumber,
          paymentReference: `PAY_${Date.now()}`
        })
      })
      const data = await res.json()
      if (data.success) {
        setTimeout(() => {
          setProcessing(false)
          onPaymentSuccess(data)
        }, 1200)
      } else {
        setProcessing(false)
        alert(data.message || 'Payment simulation failed')
      }
    } catch (err) {
      setProcessing(false)
      alert('Payment processing error: ' + err.message)
    }
  }

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="payment-modal-header">
          <div className="payment-brand-title">
            <span className="payment-brand-badge">⚡ SECURE CHECKOUT</span>
            <h3>VANTA GATEWAY</h3>
          </div>
          <button type="button" className="payment-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Amount bar */}
        <div className="payment-amount-summary">
          <div>
            <span className="amount-label">ORDER AMOUNT PAYABLE</span>
            <div className="amount-value">{formattedAmount || `₹${amount?.toLocaleString('en-IN')}`}</div>
          </div>
          <div className="payment-security-tag">
            <span>🔒 256-Bit SSL Encrypted</span>
            <small>Powered by Razorpay Payments</small>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="payment-tabs-bar">
          <button
            type="button"
            className={`payment-tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            📱 Scan UPI QR
          </button>
          <button
            type="button"
            className={`payment-tab-btn ${activeTab === 'upi' ? 'active' : ''}`}
            onClick={() => setActiveTab('upi')}
          >
            ⚡ UPI ID / VPA
          </button>
          <button
            type="button"
            className={`payment-tab-btn ${activeTab === 'card' ? 'active' : ''}`}
            onClick={() => setActiveTab('card')}
          >
            💳 Cards
          </button>
          <button
            type="button"
            className={`payment-tab-btn ${activeTab === 'netbanking' ? 'active' : ''}`}
            onClick={() => setActiveTab('netbanking')}
          >
            🏛️ NetBanking
          </button>
        </div>

        {/* Tab Body */}
        <div className="payment-tab-body">
          {loading ? (
            <div className="payment-loading">
              <div className="payment-spinner"></div>
              <p>Initializing secure Razorpay gateway session...</p>
            </div>
          ) : processing ? (
            <div className="payment-processing-state">
              <div className="payment-pulse-ring"></div>
              <h4>Verifying Payment with Bank...</h4>
              <p>Authenticating token with National Payments Corporation of India (NPCI)...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: UPI QR CODE */}
              {activeTab === 'qr' && (
                <div className="upi-qr-view">
                  <div className="qr-code-box">
                    <div className="simulated-qr-graphic">
                      {/* SVG Stylized QR Code */}
                      <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                        <rect width="180" height="180" fill="#ffffff" rx="8" />
                        {/* Corner squares */}
                        <rect x="15" y="15" width="45" height="45" fill="#111111" rx="4" />
                        <rect x="23" y="23" width="29" height="29" fill="#ffffff" rx="2" />
                        <rect x="29" y="29" width="17" height="17" fill="#111111" />

                        <rect x="120" y="15" width="45" height="45" fill="#111111" rx="4" />
                        <rect x="128" y="23" width="29" height="29" fill="#ffffff" rx="2" />
                        <rect x="134" y="29" width="17" height="17" fill="#111111" />

                        <rect x="15" y="120" width="45" height="45" fill="#111111" rx="4" />
                        <rect x="23" y="128" width="29" height="29" fill="#ffffff" rx="2" />
                        <rect x="29" y="134" width="17" height="17" fill="#111111" />

                        {/* Data matrix pattern */}
                        <rect x="70" y="25" width="12" height="12" fill="#111111" />
                        <rect x="90" y="25" width="12" height="12" fill="#111111" />
                        <rect x="70" y="45" width="22" height="12" fill="#111111" />
                        <rect x="25" y="70" width="12" height="22" fill="#111111" />
                        <rect x="45" y="70" width="12" height="12" fill="#111111" />
                        <rect x="70" y="70" width="40" height="40" fill="#111111" rx="4" />
                        <rect x="80" y="80" width="20" height="20" fill="#ffffff" />
                        <rect x="120" y="70" width="15" height="25" fill="#111111" />
                        <rect x="145" y="70" width="20" height="12" fill="#111111" />
                        <rect x="70" y="120" width="25" height="12" fill="#111111" />
                        <rect x="105" y="120" width="15" height="35" fill="#111111" />
                        <rect x="130" y="125" width="35" height="15" fill="#111111" />
                        <rect x="140" y="150" width="25" height="15" fill="#111111" />
                        <rect x="70" y="145" width="25" height="20" fill="#111111" />
                      </svg>
                    </div>
                    <div className="qr-scan-badge">SCAN &amp; PAY</div>
                  </div>

                  <p className="qr-helper-text">
                    Scan with any UPI app on your phone: <strong>GPay, PhonePe, Paytm, CRED, or BHIM</strong>
                  </p>

                  <div className="upi-apps-icons-row">
                    <span>⚡ Google Pay</span>
                    <span>🟣 PhonePe</span>
                    <span>🔷 Paytm</span>
                    <span>⚪ CRED</span>
                  </div>

                  <button
                    type="button"
                    className="payment-action-primary"
                    onClick={() => handleSimulatePayment('UPI_QR_CODE')}
                  >
                    ✓ Simulate Successful App Approval
                  </button>
                </div>
              )}

              {/* TAB 2: UPI ID */}
              {activeTab === 'upi' && (
                <div className="upi-id-view">
                  <div className="payment-form-group">
                    <label>Enter your UPI ID / Virtual Address</label>
                    <input
                      type="text"
                      placeholder="e.g. mobileNumber@upi or name@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>

                  <div className="upi-fast-pills">
                    {['@okhdfcbank', '@okaxis', '@ybl', '@paytm', '@ibl'].map((ext) => (
                      <button
                        key={ext}
                        type="button"
                        className="fast-ext-btn"
                        onClick={() => setUpiId((prev) => (prev ? prev.split('@')[0] : 'customer') + ext)}
                      >
                        {ext}
                      </button>
                    ))}
                  </div>

                  <p className="upi-note">
                    A collect request will be sent to your UPI app for instant PIN approval.
                  </p>

                  <button
                    type="button"
                    className="payment-action-primary"
                    onClick={() => handleSimulatePayment('UPI_COLLECT_REQUEST')}
                  >
                    Send Collect Request &amp; Approve
                  </button>
                </div>
              )}

              {/* TAB 3: CARDS */}
              {activeTab === 'card' && (
                <div className="card-payment-view">
                  <div className="card-mock-visual">
                    <div className="card-chip"></div>
                    <div className="card-mock-number">{cardData.number}</div>
                    <div className="card-mock-row">
                      <span>{cardData.name}</span>
                      <span>EXP: {cardData.expiry}</span>
                    </div>
                  </div>

                  <div className="payment-form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    />
                  </div>

                  <div className="card-inputs-row">
                    <div className="payment-form-group">
                      <label>Valid Thru</label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      />
                    </div>
                    <div className="payment-form-group">
                      <label>CVV</label>
                      <input
                        type="password"
                        maxLength="4"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="payment-action-primary"
                    onClick={() => handleSimulatePayment('CREDIT_CARD')}
                  >
                    Pay {formattedAmount} via Card
                  </button>
                </div>
              )}

              {/* TAB 4: NETBANKING */}
              {activeTab === 'netbanking' && (
                <div className="netbanking-view">
                  <label className="bank-section-title">Select Bank:</label>
                  <div className="bank-grid-options">
                    {[
                      { code: 'HDFC', name: 'HDFC Bank' },
                      { code: 'ICICI', name: 'ICICI Bank' },
                      { code: 'SBI', name: 'State Bank of India' },
                      { code: 'AXIS', name: 'Axis Bank' },
                      { code: 'KOTAK', name: 'Kotak Mahindra' },
                      { code: 'OTHER', name: 'Other 50+ Banks' }
                    ].map((b) => (
                      <button
                        key={b.code}
                        type="button"
                        className={`bank-option-btn ${selectedBank === b.code ? 'active' : ''}`}
                        onClick={() => setSelectedBank(b.code)}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="payment-action-primary"
                    onClick={() => handleSimulatePayment(`NETBANKING_${selectedBank}`)}
                  >
                    Proceed with {selectedBank} NetBanking
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="payment-modal-footer">
          <small>Razorpay Verified Merchant • Instant Digital Receipt &amp; AWB Dispatch</small>
        </div>
      </div>
    </div>
  )
}
