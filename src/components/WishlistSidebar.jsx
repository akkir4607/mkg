import { useContext, useState, useEffect } from 'react'
import { WishlistContext, CartContext } from '../App'
import './WishlistSidebar.css'

function WishlistSidebar() {
  const { wishlist, removeFromWishlist, clearWishlist } = useContext(WishlistContext)
  const { addToCart } = useContext(CartContext)
  const [isOpen, setIsOpen] = useState(false)

  // Handle browser back button
  useEffect(() => {
    if (isOpen) {
      // Push a new state when sidebar opens
      window.history.pushState({ wishlistOpen: true }, '')

      // Listen for popstate (back button press)
      const handlePopState = (event) => {
        if (isOpen) {
          setIsOpen(false)
        }
      }

      window.addEventListener('popstate', handlePopState)

      // Cleanup listener
      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [isOpen])

  // Close sidebar function - also handles history
  const closeSidebar = () => {
    // If sidebar is open and we have a history state, go back
    if (window.history.state && window.history.state.wishlistOpen) {
      window.history.back()
    }
    setIsOpen(false)
  }

  // Open sidebar function
  const openSidebar = () => {
    setIsOpen(true)
  }

  const handleAddAllToCart = () => {
    wishlist.forEach(item => {
      const defaultSize = item.sizes ? item.sizes[0] : 'M'
      addToCart({ ...item, selectedSize: defaultSize })
    })
  }

  const handleAddSingleToCart = (item) => {
    const defaultSize = item.sizes ? item.sizes[0] : 'M'
    addToCart({ ...item, selectedSize: defaultSize })
  }

  return (
    <>
      {/* Floating Button */}
      <button
        className={`wishlist-fab ${isOpen ? 'open' : ''}`}
        onClick={openSidebar}
        aria-label="Open wishlist"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {wishlist.length > 0 && (
          <span className="wishlist-count">{wishlist.length}</span>
        )}
      </button>

      {/* Sidebar Overlay */}
      <div
        className={`wishlist-overlay ${isOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`wishlist-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>WISHLIST</h2>
          <button
            className="close-btn"
            onClick={closeSidebar}
            aria-label="Close wishlist"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p>Your wishlist is empty</p>
            <span className="empty-subtitle">Save items you love</span>
          </div>
        ) : (
          <>
            <div className="wishlist-items">
              {wishlist.map(item => (
                <div key={item.id} className="wishlist-item">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-content">
                    <h4>{item.name}</h4>
                    <p className="item-price">{item.price}</p>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddSingleToCart(item)}
                    >
                      ADD TO BAG
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label="Remove from wishlist"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="sidebar-footer">
              <button className="add-all-cart-btn" onClick={handleAddAllToCart}>
                ADD ALL TO BAG
              </button>
              <button className="clear-wishlist-btn" onClick={clearWishlist}>
                CLEAR WISHLIST
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default WishlistSidebar