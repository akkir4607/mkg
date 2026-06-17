import React, {
  useState, useEffect, useRef, useContext, useCallback
} from 'react';
import { CartContext, WishlistContext } from '../App';
import './ProductDetail.css';

/* ─────────────────────────────────────────────────────────
   Accordion item
───────────────────────────────────────────────────────── */
function Accordion({ title, children, defaultOpen = false, icon = 'chevron' }) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (open) el.style.maxHeight = el.scrollHeight + 'px';
    else el.style.maxHeight = '0px';
  }, [open, children]);

  return (
    <div className={`lv-accordion ${open ? 'open' : ''}`}>
      <button
        className="lv-accordion-header"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span>{title}</span>
        {icon === 'plus' ? (
          <span className="lv-acc-plus" aria-hidden="true" />
        ) : (
          <svg className="lv-acc-chevron" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </button>
      <div className="lv-accordion-body" ref={bodyRef}>
        <div className="lv-accordion-body-inner">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ProductDetail — Louis Vuitton inspired
   Reusable across Women/Men/Discover/etc.
───────────────────────────────────────────────────────── */
const ProductDetail = ({ product, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? null);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const timerRef = useRef(null);
  const heroRef = useRef(null);

  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const images = product.images || [product.image];
  const total = images.length;

  /* mount + lock scroll */
  useEffect(() => {
    const t = setTimeout(() => setIsActive(true), 20);
    document.body.style.overflow = 'hidden';
    return () => { clearTimeout(t); document.body.style.overflow = ''; };
  }, []);

  /* ── auto-rotate every 2 seconds ── */
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveImg(prev => (prev + 1) % total);
    }, 2000);
  }, [total]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  /* close with animation */
  const handleClose = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setTimeout(onClose, 550);
  };

  /* ESC to close */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* cart */
  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart({ ...product, selectedColor }, selectedSize || 'OS');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1800);
  };

  const handleThumbClick = (i) => {
    setActiveImg(i);
    startTimer();
  };

  if (!product) return null;

  const shortDesc = product.description || '';
  const longDesc = product.longDescription ||
    `${shortDesc} Crafted with meticulous attention to detail, this piece embodies the spirit of timeless design — bridging heritage with contemporary relevance. Each element is thoughtfully considered to deliver an unparalleled experience of quality and elegance.`;

  return (
    <div className={`lv-page ${isActive ? 'active' : ''}`}>

      {/* ══ LEFT — Image hero with auto-rotate ══ */}
      <div className="lv-left" ref={heroRef}>
        <div className="lv-image-stack">
          {images.map((src, i) => (
            <div
              key={i}
              className={`lv-image-frame ${i === activeImg ? 'is-active' : ''}`}
            >
              <img
                src={src}
                alt={`${product.name} — view ${i + 1}`}
                draggable="false"
              />
            </div>
          ))}
        </div>

        {/* Image counter */}
        {total > 1 && (
          <div className="lv-counter">
            <span className="lv-counter-num">
              {String(activeImg + 1).padStart(2, '0')}
            </span>
            <span className="lv-counter-sep">/</span>
            <span className="lv-counter-total">
              {String(total).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Progress bar */}
        {total > 1 && (
          <div className="lv-progress">
            {images.map((_, i) => (
              <button
                key={i}
                className={`lv-progress-bar ${i === activeImg ? 'active' : ''} ${i < activeImg ? 'done' : ''}`}
                onClick={() => handleThumbClick(i)}
                aria-label={`View image ${i + 1}`}
              >
                <span className="lv-progress-fill" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══ RIGHT — Details panel ══ */}
      <div className="lv-right">

        {/* Top bar with close */}
        <div className="lv-topbar">
          <button className="lv-close" onClick={handleClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <button
            className={`lv-wish-top ${isInWishlist(product.id) ? 'active' : ''}`}
            onClick={() => toggleWishlist(product)}
            aria-label="Add to wishlist"
          >
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="1.4">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        <div className="lv-content">

          {/* SKU */}
          {product.sku && <div className="lv-sku">{product.sku}</div>}

          {/* Name */}
          <h1 className="lv-name">{product.name}</h1>

          {/* Price */}
          <div className="lv-price-block">
            <div className="lv-price">{product.price}</div>
            <div className="lv-tax">(M.R.P. incl. of all taxes)</div>
          </div>

          {/* Colours */}
          {product.colors?.length > 0 && (
            <div className="lv-section">
              <div className="lv-section-head">
                <span className="lv-section-label">Colours</span>
                <span className="lv-section-value">{selectedColor?.name}</span>
              </div>
              <div className="lv-swatches">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    className={`lv-swatch ${selectedColor?.name === color.name ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color.name}
                  >
                    <span
                      className="lv-swatch-inner"
                      style={{ background: color.value }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="lv-section">
              <div className="lv-section-head">
                <span className="lv-section-label">Size</span>
                {selectedSize && (
                  <span className="lv-section-value">{selectedSize}</span>
                )}
              </div>
              <div className="lv-sizes">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className={`lv-size ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            className={`lv-cta ${showSuccess ? 'success' : ''}`}
            onClick={handleAddToCart}
            disabled={showSuccess}
          >
            <span className="lv-cta-text">
              {showSuccess ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Added to Bag
                </>
              ) : 'Add to Bag'}
            </span>
          </button>

          {/* Concierge */}
          <p className="lv-concierge">
            Our Digital Concierge is available if you have any question on this product.
            <a href="#contact" className="lv-link"> Contact us</a>
          </p>

          {/* Description */}
          <div className="lv-desc">
            <p className={`lv-desc-text ${descExpanded ? 'expanded' : ''}`}>
              {longDesc}
            </p>
            <button
              className="lv-read-more"
              onClick={() => setDescExpanded(v => !v)}
            >
              {descExpanded ? 'Read Less' : 'Read More'}
            </button>
          </div>

          {/* Accordions */}
          <div className="lv-accordions">
            <Accordion title="Find in Store" icon="plus">
              <p>Locate this product at a boutique near you. Enter your city or pincode to discover availability.</p>
              <button className="lv-inline-btn">Search Stores →</button>
            </Accordion>

            <Accordion title="Delivery & Returns">
              <ul>
                <li>Complimentary shipping on all orders</li>
                <li>Delivered in 3–5 business days</li>
                <li>Free returns within 30 days</li>
                <li>Items must be unworn and in original packaging</li>
              </ul>
            </Accordion>

            <Accordion title="Gifting">
              <ul>
                <li>Signature gift packaging available</li>
                <li>Personalised message card</li>
                <li>Discreet pricing on receipt</li>
              </ul>
            </Accordion>

            <Accordion title="Care & Maintenance">
              <ul>
                <li>Store in dust bag when not in use</li>
                <li>Avoid prolonged exposure to sunlight</li>
                <li>Clean with soft, dry cloth</li>
                <li>Professional care recommended</li>
              </ul>
            </Accordion>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;