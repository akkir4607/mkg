import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { createContext, useState, useEffect } from 'react'

import WishlistSidebar from './components/WishlistSidebar.jsx'
import Preloader from './components/Preloader.jsx'

import Front from './pages/Front.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Women from './pages/Women.jsx'
import Discover from './pages/Discover.jsx'
import Support from './pages/Support.jsx'
import Men from './pages/Men.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Admin from './pages/Admin.jsx'
import Order from './pages/Order.jsx'
import FAQ from './pages/Faq.jsx'
import Term from './pages/term.jsx'
import CartPage from './pages/CartPage.jsx'

export const WishlistContext = createContext()
export const CartContext = createContext()

function App() {
  const [wishlist, setWishlist] = useState([])
  const [cart, setCart] = useState([])

  const [isLoading, setIsLoading] = useState(() => {
    return sessionStorage.getItem('preloaderShown') !== 'true'
  })

  // ── Lock / unlock body scroll during preloader ──────────
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('preloader-active')
    } else {
      document.body.classList.remove('preloader-active')
    }
    return () => {
      document.body.classList.remove('preloader-active')
    }
  }, [isLoading])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    sessionStorage.setItem('preloaderShown', 'true')
  }

  // ══════════════════════════════════════════════
  // WISHLIST ACTIONS
  // ══════════════════════════════════════════════
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) return prev.filter((item) => item.id !== product.id)
      return [...prev, product]
    })
  }

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId))
  }

  const clearWishlist = () => setWishlist([])

  const isInWishlist = (productId) =>
    wishlist.some((item) => item.id === productId)

  // ══════════════════════════════════════════════
  // CART ACTIONS
  // ══════════════════════════════════════════════
  const addToCart = (product, size) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.id === product.id && item.selectedSize === size
      )
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, selectedSize: size, quantity: 1 }]
    })
  }

  const removeFromCart = (productId, size) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === productId && item.selectedSize === size)
      )
    )
  }

  const updateQuantity = (productId, size, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size)
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId && item.selectedSize === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const clearCart = () => setCart([])

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(
        item.price.replace('₹', '').replace(/,/g, '')
      )
      return total + price * item.quantity
    }, 0)
  }

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // ══════════════════════════════════════════════
  // CONTEXT VALUES
  // ══════════════════════════════════════════════
  const wishlistValue = {
    wishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
  }

  const cartValue = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  }

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════
  return (
    <>
      {isLoading && (
        <Preloader onLoadingComplete={handleLoadingComplete} />
      )}

      {!isLoading && (
        <WishlistContext.Provider value={wishlistValue}>
          <CartContext.Provider value={cartValue}>
            <Router>
              <div className="app">
                <WishlistSidebar />

                <Routes>
                  {/* ── Main pages ── */}
                  <Route path="/"           element={<Front />} />
                  <Route path="/women"      element={<Women />} />
                  <Route path="/men"        element={<Men />} />
                  <Route path="/discover"   element={<Discover />} />
                  <Route path="/support"    element={<Support />} />
                  <Route path="/contact"    element={<Contact />} />

                  {/* ── Product ── */}
                  <Route path="/product/:id" element={<ProductDetail />} />

                  {/* ── Cart / Checkout ── */}
                  <Route path="/cart"       element={<CartPage />} />

                  {/* ── Auth ── */}
                  <Route path="/login"      element={<Login />} />

                  {/* ── Account ── */}
                  <Route path="/order"      element={<Order />} />

                  {/* ── Admin ── */}
                  <Route path="/admin"      element={<Admin />} />

                  {/* ── Info pages ── */}
                  <Route path="/faq"        element={<FAQ />} />
                  <Route path="/term"       element={<Term />} />
                </Routes>
              </div>
            </Router>
          </CartContext.Provider>
        </WishlistContext.Provider>
      )}
    </>
  )
}

export default App