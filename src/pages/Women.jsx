// Women.jsx
import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../App';
import './Women.css';
import ProductDetail from './ProductDetail';
import Navbar from '../components/Navbar';
import image1 from '../images/1.jpg';
import image2 from '../images/2.jpg';
import image3 from '../images/3.jpg';
import image4 from '../images/4.jpg';
import image17 from '../images/500.jpeg';
import image18 from '../images/501.jpeg';
import image19 from '../images/502.jpeg';
import image20 from '../images/503.jpeg';
import image21 from '../images/504.jpeg';
import image22 from '../images/505.jpeg';
import image23 from '../images/506.jpeg';
import image24 from '../images/540.jpeg';
import image25 from '../images/541.jpeg';
import image26 from '../images/542.jpeg';
import image27 from '../images/543.jpeg';
import image28 from '../images/544.jpeg';
import image29 from '../images/545.jpeg';
import image30 from '../images/546.jpeg';
import image31 from '../images/547.jpeg';
import image32 from '../images/548.jpeg';
import image33 from '../images/549.jpeg';
import image34 from '../images/550.jpeg';
import image35 from '../images/551.jpeg';
import image36 from '../images/552.jpeg';
import image37 from '../images/553.jpeg';
import image38 from '../images/554.jpeg';
import image39 from '../images/555.jpeg';
import image40 from '../images/556.jpeg';
import image41 from '../images/557.jpeg';
import image42 from '../images/558.jpeg';
import image43 from '../images/559.jpeg';
import image44 from '../images/560.jpeg';
import image45 from '../images/561.jpeg';
import image46 from '../images/562.jpeg';
import image47 from '../images/563.jpeg';
import image48 from '../images/564.jpeg';
import image49 from '../images/565.jpeg';
import image50 from '../images/566.jpeg';
import image51 from '../images/567.jpeg';
import image52 from '../images/568.jpeg';
import image53 from '../images/569.jpeg';

const products = [
  {
    id: 'women-1',
    name: 'ARTIST SPIRIT TEE (WHITE)',
    price: '₹ 50.00',
    images: [image17, image18, image19],
    description: 'Flannel overshirt in cotton with bones appliques with raw hem and button-down closure.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red', value: '#DC2626' },
      { name: 'Brown', value: '#92400E' },
    ],
  },
  {
    id: 'women-2',
    name: 'ARTIST SPIRIT TEE (BLACK)',
    price: '₹ 5,950.00',
    images: [image20, image21, image22, image23],
    description: 'Timeless leather boots designed for comfort and style. Premium craftsmanship with attention to every detail.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red', value: '#DC2626' },
      { name: 'Beige', value: '#D4A574' },
    ],
  },
  {
    id: 'women-3',
    name: 'LEATHER WITH MASK DETAIL',
    price: '₹ 8,550.00',
    images: [image24, image25, image26, image27, image28, image29],
    description: 'Elegant leather moccasins with mask detail. Handcrafted from the finest materials for superior comfort.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Navy', value: '#1E3A8A' },
      { name: 'Brown', value: '#92400E' },
    ],
  },
  {
    id: 'women-4',
    name: 'LEATHER SMART DECK SHOES',
    price: '₹ 8,550.00',
    images: [image30, image31, image32, image33],
    description: 'Premium leather smart deck shoes combining style and functionality. Perfect for casual sophistication.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red', value: '#DC2626' },
      { name: 'White', value: '#F8F8F8' },
    ],
  },
  {
    id: 'women-5',
    name: 'LEATHER SMART DECK SHOES',
    price: '₹ 8,550.00',
    images: [image34, image35, image36, image37, image38],
    description: 'Premium leather smart deck shoes combining style and functionality. Perfect for casual sophistication.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red', value: '#DC2626' },
      { name: 'White', value: '#F8F8F8' },
    ],
  },
  {
    id: 'women-6',
    name: 'LEATHER SMART DECK SHOES',
    price: '₹ 8,550.00',
    images: [image39, image40, image41, image42, image43],
    description: 'Premium leather smart deck shoes combining style and functionality. Perfect for casual sophistication.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red', value: '#DC2626' },
      { name: 'White', value: '#F8F8F8' },
    ],
  },
  {
    id: 'women-7',
    name: 'LEATHER SMART DECK SHOES',
    price: '₹ 8,550.00',
    images: [image44, image45, image46, image47],
    description: 'Premium leather smart deck shoes combining style and functionality. Perfect for casual sophistication.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red', value: '#DC2626' },
      { name: 'White', value: '#F8F8F8' },
    ],
  },
  {
    id: 'women-8',
    name: 'LEATHER SMART DECK SHOES',
    price: '₹ 8,550.00',
    images: [image48, image49, image50, image51, image52, image53],
    description: 'Premium leather smart deck shoes combining style and functionality. Perfect for casual sophistication.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red', value: '#DC2626' },
      { name: 'White', value: '#F8F8F8' },
    ],
  },
];

/* ─── Hook: detect touch device ─── */
const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const check = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(hover: none) and (pointer: coarse)').matches
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isTouch;
};

/* ─── Product Card ─── */
const ProductCard = ({ product, onProductClick, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef(null);
  const touchRef = useRef({ x: 0, y: 0, time: 0 });
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const isTouch = useIsTouchDevice();

  const images = product.images?.length > 0 ? product.images : [product.image];
  const hasMultiple = images.length > 1;

  /* Intersection observer */
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 80);
          observer.unobserve(node);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [index]);

  /* Desktop hover → show 2nd image */
  useEffect(() => {
    if (!hasMultiple || isTouch) return;
    setCurrentIndex(isHovering ? 1 : 0);
  }, [isHovering, hasMultiple, isTouch]);

  /* ── Swipe handlers ── */
  const handleTouchStart = useCallback((e) => {
    if (!hasMultiple) return;
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    setIsSwiping(false);
  }, [hasMultiple]);

  const handleTouchMove = useCallback((e) => {
    if (!hasMultiple) return;
    const t = e.touches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      setIsSwiping(true);
      e.preventDefault();
    }
  }, [hasMultiple]);

  const handleTouchEnd = useCallback(() => {
    if (!hasMultiple) return;
    const dx = touchRef.current.x
      ? (event => {
          // We need the final position — use changedTouches from the native event
          // But since we stored start, we can compute from the isSwiping state
        })()
      : 0;
    // Simplified: we track in touchMove
  }, [hasMultiple]);

  // Better approach: store delta during move
  const deltaRef = useRef(0);

  const onTouchStart = useCallback((e) => {
    if (!hasMultiple) return;
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    deltaRef.current = 0;
    setIsSwiping(false);
  }, [hasMultiple]);

  const onTouchMove = useCallback((e) => {
    if (!hasMultiple) return;
    const t = e.touches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    deltaRef.current = dx;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      setIsSwiping(true);
      e.preventDefault();
    }
  }, [hasMultiple]);

  const onTouchEnd = useCallback(() => {
    if (!hasMultiple) return;
    const dx = deltaRef.current;
    const elapsed = Date.now() - touchRef.current.time;
    const velocity = Math.abs(dx) / elapsed;
    const threshold = velocity > 0.3 ? 15 : 35;

    if (Math.abs(dx) > threshold) {
      setCurrentIndex((prev) =>
        dx < 0
          ? (prev + 1) % images.length
          : (prev - 1 + images.length) % images.length
      );
    }
    deltaRef.current = 0;
    setTimeout(() => setIsSwiping(false), 60);
  }, [hasMultiple, images.length]);

  /* Side tap for mobile */
  const handleSideTap = useCallback((dir) => {
    if (!hasMultiple) return;
    setCurrentIndex((prev) => (prev + dir + images.length) % images.length);
  }, [hasMultiple, images.length]);

  /* Desktop arrow */
  const handleArrow = useCallback((e, dir) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + dir + images.length) % images.length);
  }, [images.length]);

  /* Image click — open detail unless swiping */
  const handleImageClick = useCallback(() => {
    if (!isSwiping) onProductClick(product);
  }, [isSwiping, onProductClick, product]);

  const inWishlist = isInWishlist(product.id);

  return (
    <div
      ref={cardRef}
      className={`product-card ${isVisible ? 'visible' : ''}`}
      onMouseEnter={() => !isTouch && setIsHovering(true)}
      onMouseLeave={() => !isTouch && setIsHovering(false)}
    >
      <div
        className="product-image-wrapper"
        onClick={handleImageClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="image-overlay" />

        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={product.name}
            className={`product-img ${i === currentIndex ? 'active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            draggable={false}
          />
        ))}

        {/* Desktop: minimal bare arrows */}
        {hasMultiple && !isTouch && (
          <>
            <button
              className="product-nav-arrow left"
              onClick={(e) => handleArrow(e, -1)}
              aria-label="Previous"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className="product-nav-arrow right"
              onClick={(e) => handleArrow(e, 1)}
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Mobile: invisible side tap zones */}
        {hasMultiple && isTouch && (
          <>
            <button
              className="touch-zone left"
              onClick={(e) => {
                e.stopPropagation();
                handleSideTap(-1);
              }}
              aria-label="Previous image"
            />
            <button
              className="touch-zone right"
              onClick={(e) => {
                e.stopPropagation();
                handleSideTap(1);
              }}
              aria-label="Next image"
            />
          </>
        )}

        {/* Mobile dots */}
        {hasMultiple && isTouch && (
          <div className="swipe-dots">
            {images.map((_, i) => (
              <span key={i} className={`swipe-dot ${i === currentIndex ? 'active' : ''}`} />
            ))}
          </div>
        )}

        {/* Quick add */}
        <button
          className="quick-add-btn"
          onClick={(e) => e.stopPropagation()}
          aria-label="Quick add"
        >
          <span className="plus-icon">+</span>
        </button>

        {/* Wishlist */}
        <button
          className={`wishlist-icon ${inWishlist ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price">{product.price}</p>
      </div>
    </div>
  );
};

/* ─── Women Page ─── */
function Women() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          obs.unobserve(node);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(node);
    return () => obs.unobserve(node);
  }, []);

  return (
    <div className="women-container">
      <Navbar />

      <div className="women-section-header">
        <h1 className="section-title">FRESH N LOUD</h1>
      </div>

      <div className="products-grid">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onProductClick={setSelectedProduct}
          />
        ))}
      </div>

      <div ref={headerRef} className={`women-header ${headerVisible ? 'visible' : ''}`}>
        <div className="header-line" />
        <Link to="/discover" className="women-title">Explore the LOUD</Link>
        <p className="women-subtitle">Timeless elegance in every step</p>
      </div>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default Women;