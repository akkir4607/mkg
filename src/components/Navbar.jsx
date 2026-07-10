// Navbar.jsx
import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../App';
import ShoppingBag from "./ShoppingBag";
import './Navbar.css';

const CATEGORIES = [
  { label: 'T-Shirts', path: '/category/tshirts' },
  { label: 'Jeans', path: '/category/jeans' },
  { label: 'Lowers', path: '/category/lowers' },
  { label: 'Shirts', path: '/category/shirts' },
  { label: 'Jackets', path: '/category/jackets' },
  { label: 'Accessories', path: '/category/accessories' },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getCartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (scrolled) return;
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setShowUserMenu(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const showNavControls = !isHomePage || scrolled || isMenuOpen;

  return (
    <>
      {/* Hero Logo - Only on homepage, center of viewport */}
      {isHomePage && (
        <div className={`hero-logo ${scrolled ? 'hero-logo--hidden' : ''}`}>
          <div className="hero-logo__inner">
            <h1 className="hero-logo__title">LOUDLY WORN</h1>
            <div className="hero-logo__divider" />
            <nav className="hero-categories" aria-label="Shop categories">
              {CATEGORIES.map((cat, i) => (
                <Link
                  key={cat.path}
                  to={cat.path}
                  className="hero-category-link"
                  style={{ animationDelay: `${1.0 + i * 0.09}s` }}
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
            <div className="hero-scroll-hint">
              <span>Scroll to explore</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      <nav className={`navbar ${showNavControls ? 'navbar--solid' : ''} ${isHomePage && !scrolled ? 'navbar--home' : ''} ${isMenuOpen ? 'navbar--menu-open' : ''}`}>
        <div className="navbar-container">

          {/* Left: Hamburger + Search */}
          <div className={`nav-left ${showNavControls ? 'nav-section--visible' : ''}`}>
            <button
              className="nav-icon-btn menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span className={`hamburger ${isMenuOpen ? 'hamburger--open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
              <span className="nav-icon-label">Menu</span>
            </button>

            <button
              className="nav-icon-btn search-toggle"
              onClick={toggleSearch}
              aria-label="Toggle search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span className="nav-icon-label">Search</span>
            </button>
          </div>

          {/* Center: Logo */}
          <div className={`nav-logo ${showNavControls ? 'nav-logo--visible' : ''}`}>
            <Link to="/" onClick={closeMenu}>
              <h1>LOUDLY WORN</h1>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className={`nav-right ${showNavControls ? 'nav-section--visible' : ''}`}>
            {user ? (
              <div className="user-menu-wrap" ref={userMenuRef}>
                <button
                  className="nav-icon-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="Account"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>

                <div className={`user-dropdown ${showUserMenu ? 'user-dropdown--open' : ''}`}>
                  <div className="user-dropdown__header">
                    <p className="user-dropdown__name">{user.name}</p>
                    <p className="user-dropdown__email">{user.email}</p>
                  </div>
                  <div className="user-dropdown__divider"/>
                  <button className="user-dropdown__item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    My Profile
                  </button>
                  <button className="user-dropdown__item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    My Orders
                  </button>
                  <div className="user-dropdown__divider"/>
                  <button className="user-dropdown__item user-dropdown__item--danger" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="nav-icon-btn" aria-label="Log in">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            )}

            <button onClick={toggleCart} className="nav-icon-btn cart-btn" aria-label="Shopping bag">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </button>
          </div>
        </div>

        {/* Category Bar — sits below navbar, appears on scroll */}
        <div className={`nav-category-bar ${showNavControls ? 'nav-category-bar--visible' : ''}`}>
          <div className="nav-category-bar__inner">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.path}
                to={cat.path}
                className="nav-category-bar__link"
                style={{ transitionDelay: showNavControls ? `${0.08 + i * 0.04}s` : '0s' }}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Search Overlay */}
        <div className={`search-overlay ${isSearchOpen ? 'search-overlay--open' : ''}`}>
          <div className="search-overlay__inner">
            <form className="search-overlay__form" onSubmit={handleSearchSubmit}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={isSearchOpen}
              />
              <button type="button" className="search-overlay__close" onClick={toggleSearch} aria-label="Close search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Mobile / Main Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu--open' : ''}`}>
          <div className="mobile-menu__scroll">
            <div className="mobile-menu__links">
              <Link to="/" className="mobile-menu__link" onClick={closeMenu} style={{ animationDelay: '0.06s' }}>HOME</Link>

              <div className="mobile-menu__divider" style={{ animationDelay: '0.1s' }}/>

              <p className="mobile-menu__label" style={{ animationDelay: '0.12s' }}>Shop by Category</p>
              {CATEGORIES.map((cat, i) => (
                <Link
                  key={cat.path}
                  to={cat.path}
                  className="mobile-menu__link mobile-menu__link--category"
                  onClick={closeMenu}
                  style={{ animationDelay: `${0.16 + i * 0.035}s` }}
                >
                  {cat.label}
                </Link>
              ))}

              <div className="mobile-menu__divider" style={{ animationDelay: `${0.16 + CATEGORIES.length * 0.035 + 0.02}s` }}/>

              <a href="/contact" className="mobile-menu__link" onClick={closeMenu} style={{ animationDelay: `${0.16 + CATEGORIES.length * 0.035 + 0.06}s` }}>CONTACT</a>

              {user ? (
                <>
                  <div className="mobile-menu__divider" style={{ animationDelay: `${0.16 + CATEGORIES.length * 0.035 + 0.1}s` }}/>
                  <div className="mobile-menu__user" style={{ animationDelay: `${0.16 + CATEGORIES.length * 0.035 + 0.12}s` }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>{user.name}</span>
                  </div>
                  <a href="#profile" className="mobile-menu__link" onClick={closeMenu} style={{ animationDelay: `${0.16 + CATEGORIES.length * 0.035 + 0.16}s` }}>MY PROFILE</a>
                  <a href="#orders" className="mobile-menu__link" onClick={closeMenu} style={{ animationDelay: `${0.16 + CATEGORIES.length * 0.035 + 0.2}s` }}>MY ORDERS</a>
                  <button className="mobile-menu__link mobile-menu__link--danger" onClick={() => { closeMenu(); handleLogout(); }} style={{ animationDelay: `${0.16 + CATEGORIES.length * 0.035 + 0.24}s` }}>
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link to="/login" className="mobile-menu__link" onClick={closeMenu} style={{ animationDelay: `${0.16 + CATEGORIES.length * 0.035 + 0.1}s` }}>LOG IN</Link>
              )}

              <div className="mobile-menu__divider" style={{ animationDelay: `${0.16 + CATEGORIES.length * 0.035 + 0.3}s` }}/>
              <button
                onClick={() => { closeMenu(); toggleCart(); }}
                className="mobile-menu__link mobile-menu__link--bag"
                style={{ animationDelay: `${0.16 + CATEGORIES.length * 0.035 + 0.34}s` }}
              >
                SHOPPING BAG [{getCartCount()}]
              </button>
            </div>
          </div>
        </div>
      </nav>

      {!isHomePage && <div className="navbar-spacer" aria-hidden="true" />}

      <ShoppingBag isOpen={isCartOpen} onClose={toggleCart} />
    </>
  );
}

export default Navbar;