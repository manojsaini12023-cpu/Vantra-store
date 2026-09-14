import { useState, useEffect } from 'react'
import { useCurrency } from './useCurrency'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const SIZE_MEASUREMENTS = {
  XS: { chest: 45, length: 26, shoulder: 21, sleeve: 9 },
  S: { chest: 47, length: 27, shoulder: 22, sleeve: 9.5 },
  M: { chest: 49, length: 28, shoulder: 23, sleeve: 10 },
  L: { chest: 51, length: 29, shoulder: 24, sleeve: 10.5 },
  XL: { chest: 53, length: 30, shoulder: 25, sleeve: 11 },
  XXL: { chest: 55, length: 31, shoulder: 26, sleeve: 11.5 },
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist
}) {
  const { formatPrice } = useCurrency()
  const [selectedSize, setSelectedSize] = useState('XS')
  const [quantity, setQuantity] = useState(1)
  const [activeTabAccordion, setActiveTabAccordion] = useState('offers')
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [addedAnimation, setAddedAnimation] = useState(false)

  // Reviews state
  const [reviewsData, setReviewsData] = useState(null)
  const [isWritingReview, setIsWritingReview] = useState(false)
  const [newReview, setNewReview] = useState({
    author: '',
    rating: 5,
    title: '',
    comment: '',
    fit: 'True to Size',
    city: ''
  })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isSizeGuideOpen) {
          setIsSizeGuideOpen(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSizeGuideOpen, onClose])

  // Fetch verified reviews for this product
  useEffect(() => {
    if (!product?.id) return
    let ignore = false
    fetch(`/api/reviews/${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setReviewsData(data)
        }
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [product?.id])

  if (!product) return null

  const currentPrice = product.numericPrice || 3799
  const originalPrice = Math.round((currentPrice * 1.16) / 50) * 50 - 1
  const discountPercent = Math.max(10, Math.round(((originalPrice - currentPrice) / originalPrice) * 100))

  const handleQtyChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  const handleAdd = () => {
    onAddToCart(product, selectedSize, quantity)
    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 1200)
  }

  const handleBuy = () => {
    onBuyNow(product, selectedSize, quantity)
  }

  const toggleAccordion = (name) => {
    setActiveTabAccordion((prev) => (prev === name ? null : name))
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!newReview.author.trim() || !newReview.comment.trim()) return
    setReviewSubmitting(true)
    try {
      const res = await fetch(`/api/reviews/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      })
      const data = await res.json()
      if (data.success) {
        setReviewMsg('Thank you! Your verified review has been published.')
        // Refetch reviews
        fetch(`/api/reviews/${product.id}`)
          .then((r) => r.json())
          .then((d) => d.success && setReviewsData(d))
        setIsWritingReview(false)
        setNewReview({
          author: '',
          rating: 5,
          title: '',
          comment: '',
          fit: 'True to Size',
          city: ''
        })
      } else {
        setReviewMsg(data.message || 'Failed to submit review')
      }
    } catch {
      setReviewMsg('Error submitting review. Please try again.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <div className="pdp-overlay" onClick={onClose}>
      <div className="pdp-modal" onClick={(e) => e.stopPropagation()}>
        {/* Wishlist Heart Button */}
        {onToggleWishlist && (
          <button
            type="button"
            className={`pdp-wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={() => onToggleWishlist(product.id)}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {isWishlisted ? '♥' : '♡'}
          </button>
        )}

        {/* Close Button */}
        <button
          type="button"
          className="pdp-close-btn"
          onClick={onClose}
          aria-label="Close product view"
        >
          ✕
        </button>

        <div className="pdp-grid">
          {/* Left Column: Image Gallery */}
          <div className="pdp-gallery-col">
            <div className={`pdp-main-image-wrap ${product.fit || ''}`}>
              <img src={product.image} alt={product.title} className="pdp-main-img" />
              <div className="pdp-img-badges">
                <span className="pdp-exclusive-badge">LIMITED DROP</span>
                <span className="pdp-stock-badge">● IN STOCK</span>
              </div>
            </div>
            <div className="pdp-gallery-thumbnails">
              <div className="pdp-thumb active">
                <img src={product.image} alt="Front view" />
              </div>
              <div className="pdp-thumb">
                <img src={product.image} alt="Back detail" style={{ transform: 'scaleX(-1)' }} />
              </div>
            </div>
          </div>

          {/* Right Column: Product Configurator & Purchasing */}
          <div className="pdp-info-col">
            <div className="pdp-header">
              <span className="pdp-category">{product.gender || 'UNISEX'} • {product.category || 'STREETWEAR'} // ARCHIVAL</span>
              <h1 className="pdp-title">{product.title}</h1>
              {reviewsData && (
                <div
                  className="pdp-rating-pill"
                  onClick={() => setActiveTabAccordion('reviews')}
                  title="Click to view verified community reviews"
                >
                  <span className="pdp-stars">{'★'.repeat(Math.round(reviewsData.averageRating || 5))}</span>
                  <strong>{reviewsData.averageRating} / 5.0</strong>
                  <span className="pdp-review-count">({reviewsData.totalReviews} reviews)</span>
                  <span className="pdp-fit-tag">✓ {reviewsData.fitStats?.trueToSizePercentage}% True to Size</span>
                </div>
              )}
            </div>

            {/* Price Row with Live Multi-Currency Conversion */}
            <div className="pdp-price-row">
              <span className="pdp-original-price">
                {formatPrice(originalPrice)}
              </span>
              <span className="pdp-sale-price">
                {formatPrice(currentPrice)}
              </span>
              <span className="pdp-save-badge">SAVE {discountPercent}%</span>
            </div>

            <p className="pdp-shipping-note">Complimentary express shipping on orders over ₹4,999.</p>

            {/* Size Section */}
            <div className="pdp-size-section">
              <div className="pdp-size-header-row">
                <span className="pdp-size-label">
                  SELECT SIZE: <strong>{selectedSize}</strong>
                  {SIZE_MEASUREMENTS[selectedSize] && (
                    <span className="pdp-size-specs-inline">
                      (Chest: {SIZE_MEASUREMENTS[selectedSize].chest}", Length: {SIZE_MEASUREMENTS[selectedSize].length}")
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className="pdp-size-guide-btn"
                  onClick={() => setIsSizeGuideOpen(true)}
                >
                  📏 SIZING GUIDE
                </button>
              </div>

              {/* Size Buttons Grid */}
              <div className="pdp-size-chips-grid">
                {ALL_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`pdp-size-chip ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="pdp-quantity-section">
              <span className="pdp-qty-label">QUANTITY:</span>
              <div className="pdp-qty-counter">
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() => handleQtyChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="pdp-qty-value">{quantity}</span>
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() => handleQtyChange(1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pdp-cta-group">
              <button
                type="button"
                className={`pdp-add-cart-btn ${addedAnimation ? 'added' : ''}`}
                onClick={handleAdd}
              >
                {addedAnimation ? '✓ ADDED TO BAG' : 'ADD TO CART'}
              </button>
              <button
                type="button"
                className="pdp-buy-now-btn"
                onClick={handleBuy}
              >
                BUY IT NOW
              </button>
            </div>

            {/* Accordions */}
            <div className="pdp-accordions">
              {/* Verified Community Reviews */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  className="pdp-accordion-header"
                  onClick={() => toggleAccordion('reviews')}
                >
                  <span className="pdp-acc-title">
                    ⭐ Verified Reviews ({reviewsData?.totalReviews || 0})
                  </span>
                  <span className="pdp-acc-caret">{activeTabAccordion === 'reviews' ? '▲' : '▼'}</span>
                </button>
                {activeTabAccordion === 'reviews' && (
                  <div className="pdp-accordion-content pdp-reviews-accordion">
                    {reviewMsg && <div className="review-toast-banner">{reviewMsg}</div>}

                    {/* Review stats header */}
                    <div className="reviews-summary-bar">
                      <div>
                        <div className="rating-huge-num">{reviewsData?.averageRating || '5.0'}</div>
                        <div className="stars-gold">{'★'.repeat(5)}</div>
                        <small>{reviewsData?.totalReviews || 0} verified customer reviews</small>
                      </div>
                      <button
                        type="button"
                        className="write-review-btn"
                        onClick={() => setIsWritingReview(!isWritingReview)}
                      >
                        {isWritingReview ? 'Cancel Review' : '+ Write a Review'}
                      </button>
                    </div>

                    {/* Write Review Form */}
                    {isWritingReview && (
                      <form onSubmit={handleReviewSubmit} className="pdp-write-review-form">
                        <h5>SUBMIT VERIFIED BUYER FEEDBACK</h5>
                        <div className="review-form-row">
                          <input
                            type="text"
                            required
                            placeholder="Your Name *"
                            value={newReview.author}
                            onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                          />
                          <input
                            type="text"
                            placeholder="City (e.g. Mumbai, Delhi)"
                            value={newReview.city}
                            onChange={(e) => setNewReview({ ...newReview, city: e.target.value })}
                          />
                        </div>

                        <div className="review-form-row">
                          <select
                            value={newReview.rating}
                            onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                          >
                            <option value={5}>★★★★★ (5 Stars - Outstanding)</option>
                            <option value={4}>★★★★☆ (4 Stars - Great)</option>
                            <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                            <option value={2}>★★☆☆☆ (2 Stars - Below Average)</option>
                            <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                          </select>

                          <select
                            value={newReview.fit}
                            onChange={(e) => setNewReview({ ...newReview, fit: e.target.value })}
                          >
                            <option value="True to Size">Fit: True to Size</option>
                            <option value="Runs Slightly Large">Fit: Runs Slightly Large</option>
                            <option value="Runs Slightly Small">Fit: Runs Slightly Small</option>
                            <option value="Oversized Boxy">Fit: Signature Oversized</option>
                          </select>
                        </div>

                        <input
                          type="text"
                          placeholder="Headline (e.g. Perfect drop-shoulder cut!)"
                          value={newReview.title}
                          onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                        />

                        <textarea
                          rows="3"
                          required
                          placeholder="Share your thoughts on the 240 GSM fabric weight, graphics, and comfort..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        ></textarea>

                        <button
                          type="submit"
                          className="submit-review-action"
                          disabled={reviewSubmitting}
                        >
                          {reviewSubmitting ? 'Publishing...' : 'Publish Verified Review'}
                        </button>
                      </form>
                    )}

                    {/* Reviews List */}
                    <div className="reviews-cards-list">
                      {reviewsData?.reviews?.map((r) => (
                        <div key={r.id} className="pdp-review-card">
                          <div className="rev-top-line">
                            <strong>{r.author}</strong>
                            <span className="rev-verified-check">✓ Verified Buyer</span>
                            <span className="rev-city">{r.city}</span>
                            <span className="rev-stars">{'★'.repeat(r.rating)}</span>
                          </div>
                          <h6 className="rev-title">{r.title}</h6>
                          <p className="rev-comment">{r.comment}</p>
                          <div className="rev-footer-meta">
                            <span>Fit: <strong>{r.fit}</strong></span>
                            <small>{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Special Offers */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  className="pdp-accordion-header"
                  onClick={() => toggleAccordion('offers')}
                >
                  <span className="pdp-acc-title">🏷️ Special Offers</span>
                  <span className="pdp-acc-caret">{activeTabAccordion === 'offers' ? '▲' : '▼'}</span>
                </button>
                {activeTabAccordion === 'offers' && (
                  <div className="pdp-accordion-content">
                    <div className="pdp-offer-bullet">
                      <strong>VANTA10</strong>: Extra 10% instant discount on all orders.
                    </div>
                    <div className="pdp-offer-bullet">
                      <strong>VANTA500</strong>: Flat ₹500 discount on orders above ₹2,500.
                    </div>
                    <div className="pdp-offer-bullet">
                      <strong>FREE SHIPPING</strong>: Automatically applied on orders above ₹4,999.
                    </div>
                  </div>
                )}
              </div>

              {/* Description & Specifications */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  className="pdp-accordion-header"
                  onClick={() => toggleAccordion('specs')}
                >
                  <span className="pdp-acc-title">🧵 Fabric &amp; Fit Details</span>
                  <span className="pdp-acc-caret">{activeTabAccordion === 'specs' ? '▲' : '▼'}</span>
                </button>
                {activeTabAccordion === 'specs' && (
                  <div className="pdp-accordion-content">
                    <p>{product.description || 'Crafted with premium heavyweight French Terry cotton, featuring custom architectural cuts and a relaxed boxy drape tailored for the street.'}</p>
                    <ul className="pdp-specs-list">
                      <li><strong>Weight:</strong> 240 GSM Luxury Jersey</li>
                      <li><strong>Composition:</strong> 100% Combed Compact Cotton</li>
                      <li><strong>Fit:</strong> Signature Boxy Dropped-Shoulder Fit</li>
                      <li><strong>Finish:</strong> Pre-shrunk with vintage enzyme wash</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  className="pdp-accordion-header"
                  onClick={() => toggleAccordion('shipping')}
                >
                  <span className="pdp-acc-title">🚀 Express Dispatch &amp; Exchanges</span>
                  <span className="pdp-acc-caret">{activeTabAccordion === 'shipping' ? '▲' : '▼'}</span>
                </button>
                {activeTabAccordion === 'shipping' && (
                  <div className="pdp-accordion-content">
                    <p>Orders dispatched within 24 hours via BlueDart Air / Delhivery Express. Delivery in 2-4 business days.</p>
                    <div className="pdp-perks-row">
                      <span>✓ Cash on Delivery (COD) &amp; Instant UPI available</span>
                      <span>✓ 7-Day hassle-free size exchange</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sizing Guide Popup Modal */}
      {isSizeGuideOpen && (
        <div className="size-guide-overlay" onClick={() => setIsSizeGuideOpen(false)}>
          <div className="size-guide-card" onClick={(e) => e.stopPropagation()}>
            <div className="size-guide-header">
              <div>
                <span className="size-guide-eyebrow">VANTA FIT GUIDE</span>
                <h3>STREETWEAR SIZE CHART (INCHES)</h3>
              </div>
              <button
                type="button"
                className="checkout-modal-close"
                onClick={() => setIsSizeGuideOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="size-guide-table-wrap">
              <table className="size-guide-table">
                <thead>
                  <tr>
                    <th>SIZE</th>
                    <th>CHEST (IN)</th>
                    <th>LENGTH (IN)</th>
                    <th>SHOULDER (IN)</th>
                    <th>SLEEVE (IN)</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_SIZES.map((sz) => (
                    <tr
                      key={sz}
                      className={sz === selectedSize ? 'active-row' : ''}
                      onClick={() => {
                        setSelectedSize(sz)
                        setIsSizeGuideOpen(false)
                      }}
                    >
                      <td><strong>{sz}</strong></td>
                      <td>{SIZE_MEASUREMENTS[sz].chest}"</td>
                      <td>{SIZE_MEASUREMENTS[sz].length}"</td>
                      <td>{SIZE_MEASUREMENTS[sz].shoulder}"</td>
                      <td>{SIZE_MEASUREMENTS[sz].sleeve}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="size-guide-tips">
              <p>💡 <strong>Fit Tip:</strong> Our garments feature an elevated boxy streetwear silhouette. Take your normal size for a tailored oversized drape, or size down for a standard regular fit.</p>
            </div>

            <button
              type="button"
              className="primary-btn size-guide-select-btn"
              onClick={() => setIsSizeGuideOpen(false)}
            >
              CONFIRM SIZE: {selectedSize}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
