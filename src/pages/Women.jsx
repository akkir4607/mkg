import { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../App';
import './Women.css';
import ProductDetail from './ProductDetail';
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
    description:
      'Flannel overshirt in cotton with bones appliques with raw hem and button-down closure.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black',  value: '#000000' },
      { name: 'Red',    value: '#DC2626' },
      { name: 'Brown',  value: '#92400E' },
    ],
  },
  {
    id: 'women-2',
    name: 'ARTIST SPIRIT TEE (BLACK)',
    price: '₹ 5,950.00',
    images: [image20, image21, image22, image23],
    description:
      'Timeless leather boots designed for comfort and style. Premium craftsmanship with attention to every detail.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red',   value: '#DC2626' },
      { name: 'Beige', value: '#D4A574' },
    ],
  },
  {
    id: 'women-3',
    name: 'LEATHER WITH MASK DETAIL',
    price: '₹ 8,550.00',
    images: [image24, image25, image26, image27, image28, image29],
    description:
      'Elegant leather moccasins with mask detail. Handcrafted from the finest materials for superior comfort.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Navy',  value: '#1E3A8A' },
      { name: 'Brown', value: '#92400E' },
    ],
  },
  {
    id: 'women-4',
    name: 'LEATHER SMART DECK SHOES',
    price: '₹ 8,550.00',
    images: [image30, image31, image32, image33],
    description:
      'Premium leather smart deck shoes combining style and functionality. Perfect for casual sophistication.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red',   value: '#DC2626' },
      { name: 'White', value: '#F8F8F8' },
    ],
    },
  {
    id: 'women-5',
    name: 'LEATHER SMART DECK SHOES',
    price: '₹ 8,550.00',
    images: [image34, image35, image36, image37, image38],
    description:
      'Premium leather smart deck shoes combining style and functionality. Perfect for casual sophistication.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red',   value: '#DC2626' },
      { name: 'White', value: '#F8F8F8' },
    ],
    },
  {
    id: 'women-6',
    name: 'LEATHER SMART DECK SHOES',
    price: '₹ 8,550.00',
    images: [image39, image40, image41, image42, image43],
    description:
      'Premium leather smart deck shoes combining style and functionality. Perfect for casual sophistication.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red',   value: '#DC2626' },
      { name: 'White', value: '#F8F8F8' },
    ],
    },
  {
    id: 'women-7',
    name: 'LEATHER SMART DECK SHOES',
    price: '₹ 8,550.00',
    images: [image44, image45, image46, image47],
    description:
      'Premium leather smart deck shoes combining style and functionality. Perfect for casual sophistication.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red',   value: '#DC2626' },
      { name: 'White', value: '#F8F8F8' },
    ],
    },
  {
    id: 'women-8',
    name: 'LEATHER SMART DECK SHOES',
    price: '₹ 8,550.00',
    images: [image48, image49, image50, image51, image52, image53],
    description:
      'Premium leather smart deck shoes combining style and functionality. Perfect for casual sophistication.',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Red',   value: '#DC2626' },
      { name: 'White', value: '#F8F8F8' },
    ],
    
  },
  
];

/* ─── Product card ──────────────────────────────────────── */
const ProductCard = ({ product, onProductClick, index }) => {
  const [isHovered, setIsHovered]     = useState(false);
  const [isVisible, setIsVisible]     = useState(false);
  const cardRef = useRef(null);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setIsVisible(true), index * 100); },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => { if (cardRef.current) observer.unobserve(cardRef.current); };
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`product-card ${isVisible ? 'visible' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image-wrapper" onClick={() => onProductClick(product)}>
        <div className="image-overlay" />
        <img
          src={product.images[0]}
          alt={product.name}
          className={`product-img ${isHovered ? 'hovered' : ''}`}
        />
        <button className="quick-add-btn">
          <span className="plus-icon">+</span>
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price">{product.price}</p>
      </div>

      <button
        className={`wishlist-icon ${isInWishlist(product.id) ? 'active' : ''}`}
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
        aria-label="Add to wishlist"
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
};

/* ─── Women page ────────────────────────────────────────── */
function Women() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [headerVisible, setHeaderVisible]     = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHeaderVisible(true); },
      { threshold: 0.3 }
    );
    if (headerRef.current) obs.observe(headerRef.current);
    return () => { if (headerRef.current) obs.unobserve(headerRef.current); };
  }, []);

  return (
    <div className="women-container">
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

      <div
        ref={headerRef}
        className={`women-header ${headerVisible ? 'visible' : ''}`}
      >
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