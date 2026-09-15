import { useState } from 'react'
import { useCurrency } from './useCurrency'
import './WishlistDrawer.css'

export function WishlistDrawer({
  isOpen,
  onClose,
  items,
  onRemoveFromWishlist,
  onMoveToCart
}) {
  const { formatPrice } = useCurrency()
  const [selectedSizes, setSelectedSizes] = useState({})

  if (!isOpen) return null

  const handleSizeChange = (id, size) => {
    setSelectedSizes((prev) => ({ ...prev, [id]: size }))
  }

  return (
    <div className="wishlist-drawer-overlay" onClick={onClose}>
      <div className="wishlist-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wishlist-header">
          <div className="wishlist-title-wrap">
            <span className="wishlist-eyebrow">YOUR CURATED ARCHIVE</span>
            <h3>SAVED PIECES ({items.length})</h3>
          </div>
          <button type="button" className="wishlist-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="wishlist-items-container">
          {items.length === 0 ? (
            <div className="wishlist-empty-state">
              <div className="wishlist-empty-heart">♡</div>
              <h4>Your Wishlist is Empty</h4>
              <p>Explore our limited drops and tap the heart icon on any piece to curate your wardrobe.</p>
              <button type="button" className="wishlist-explore-btn" onClick={onClose}>
                Explore Collection
              </button>
            </div>
          ) : (
            items.map((product) => {
              const currentSize = selectedSizes[product.id] || (product.sizes ? product.sizes[0] : 'L')
              return (
                <div key={product.id} className="wishlist-item-card">
                  <div className="wishlist-item-image-wrap">
                    <img src={product.image} alt={product.title} />
                  </div>

                  <div className="wishlist-item-info">
                    <span className="wishlist-item-cat">{product.gender} • {product.category}</span>
                    <h4 className="wishlist-item-title">{product.title}</h4>
                    <div className="wishlist-item-price">{formatPrice(product.numericPrice)}</div>

                    {/* Size Selector */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="wishlist-size-row">
                        <span className="size-label">Size:</span>
                        <div className="size-chips">
                          {product.sizes.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`size-chip ${currentSize === s ? 'active' : ''}`}
                              onClick={() => handleSizeChange(product.id, s)}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="wishlist-card-actions">
                      <button
                        type="button"
                        className="wishlist-move-btn"
                        onClick={() => onMoveToCart(product, currentSize)}
                      >
                        + Move to Cart
                      </button>
                      <button
                        type="button"
                        className="wishlist-remove-btn"
                        onClick={() => onRemoveFromWishlist(product.id)}
                        title="Remove from saved"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="wishlist-drawer-footer">
            <small>Prices synced with real-time inventory and selected currency.</small>
          </div>
        )}
      </div>
    </div>
  )
}
