import { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../App';
import './Men.css';
import ProductDetail from './ProductDetail';
import image1 from '../images/1.jpg';
import image2 from '../images/2.jpg';
import image3 from '../images/3.jpg';
import image4 from '../images/4.jpg';

const products = [
  {
    id: 'men-1',
    name: 'CLASSIC OXFORD SHOES',
    price: '₹ 6,950.00',
    image: image1,
    description: 'The quintessential formal shoe. Crafted from premium full-grain leather with a closed lacing system for a sleek, sophisticated silhouette.',
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']
  },
  {
    id: 'men-2',
    name: 'SUEDE PENNY LOAFERS',
    price: '₹ 5,200.00',
    image: image2,
    description: 'Soft suede loafers featuring the classic penny strap. Unlined for a relaxed fit and superior comfort. Ideal for smart-casual summer styling.',
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']
  },
  {
    id: 'men-3',
    name: 'RUGGED LEATHER BOOTS',
    price: '₹ 8,950.00',
    image: image3,
    description: 'Durable leather boots with a Goodyear welted sole. Designed to withstand the elements while maintaining a refined aesthetic.',
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']
  },
  {
    id: 'men-4',
    name: 'MINIMALIST SNEAKERS',
    price: '₹ 4,500.00',
    image: image4,
    description: 'Clean, white leather sneakers. A versatile staple that pairs perfectly with tailored trousers or denim for a modern look.',
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']
  }
];

const ProductCard = ({ product, onProductClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [index]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    onProductClick(product, clickPosition);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div 
      ref={cardRef}
      className={`product-card ${isVisible ? 'visible' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image-wrapper" onClick={handleClick}>
        <div className="image-overlay"></div>
        <img 
          src={product.image} 
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
        onClick={handleWishlistClick}
        aria-label="Add to wishlist"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
};

function Men() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, []);

  const handleProductClick = (product, position) => {
    setSelectedProduct(product);
    setClickPosition(position);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setClickPosition(null);
  };

  return (
    <div className="men-container">
      <div className="men-section-header">
        <h1 className="section-title">MEN'S COLLECTION</h1>
      </div>

      <div className="products-grid">
        {products.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product}
            index={index}
            onProductClick={handleProductClick}
          />
        ))}
      </div>

      <div 
        ref={headerRef}
        className={`men-header ${headerVisible ? 'visible' : ''}`}
      >
        <div className="header-line"></div>
        <Link to="/discover" className="men-title">DISCOVER</Link>
        <p className="men-subtitle">Refined style for the modern man</p>
      </div>

      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct}
          clickPosition={clickPosition}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default Men;