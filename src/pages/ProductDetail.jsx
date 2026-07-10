// ProductDetail.jsx
import React, {
  useState, useEffect, useRef, useContext, useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext, WishlistContext } from '../App';
import './ProductDetail.css';

/* ─────────────────────────────────────────────────────────
   Accordion
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
            stroke="currentColor" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round">
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
   ProductDetail
───────────────────────────────────────────────────────── */
const ProductDetail = ({ product, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? null);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const timerRef = useRef(null);
  const successTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const heroRef = useRef(null);
  const isClosingRef = useRef(false);
  const didPushState = useRef(false);
  const rightPanelRef = useRef(null);

  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  /* ── Detect mobile ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 960);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Get images based on selected color ── */
  const getColorImages = useCallback((color) => {
    if (!color) return product.images || [product.image];
    // If color has its own images array, use those
    if (color.images?.length) return color.images;
    // If color has a single image, use that
    if (color.image) return [color.image];
    // Fallback to product images
    return product.images || [product.image];
  }, [product]);

  const [images, setImages] = useState(() => getColorImages(product.colors?.[0]));
  const total = images.length;
  const inWishlist = isInWishlist(product.id);

  /* ── Update images when color changes ── */
  const handleColorChange = useCallback((color) => {
    setSelectedColor(color);
    const newImages = getColorImages(color);
    setImages(newImages);
    setActiveImg(0);
    clearInterval(timerRef.current);
    // Restart timer after color change
    if (newImages.length > 1) {
      timerRef.current = setInterval(() => {
        setActiveImg(prev => (prev + 1) % newImages.length);
      }, 2800);
    }
  }, [getColorImages]);

  /* ── Trigger close with animation ── */
  const triggerClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsActive(false);
    clearInterval(timerRef.current);
    clearTimeout(successTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      document.body.style.overflow = '';
      onClose();
    }, 550);
  }, [onClose]);

  /* ── Push history state ── */
  useEffect(() => {
    window.history.pushState(
      { productDetailOpen: true },
      '',
      window.location.pathname + window.location.search
    );
    didPushState.current = true;

    const handlePopState = () => {
      didPushState.current = false;
      triggerClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [triggerClose]);

  /* ── Mount: animate in + lock scroll ── */
  useEffect(() => {
    const t = setTimeout(() => setIsActive(true), 20);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, []);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(successTimerRef.current);
      clearTimeout(closeTimerRef.current);
    };
  }, []);

  /* ── Auto-rotate images ── */
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveImg(prev => (prev + 1) % total);
    }, 2800);
  }, [total]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  /* ── Handle close ── */
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    if (didPushState.current) {
      window.history.back();
    } else {
      triggerClose();
    }
  }, [triggerClose]);

  /* ── ESC key ── */
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  /* ── Size validation ── */
  const validateSize = () => {
    if (product.sizes?.length && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 900);
      if (isMobile) {
        // On mobile, scroll the whole page
        const sizeEl = document.querySelector('.lv-sizes');
        if (sizeEl) {
          sizeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        document.querySelector('.lv-sizes')?.scrollIntoView({
          behavior: 'smooth', block: 'center',
        });
      }
      return false;
    }
    return true;
  };

  /* ── Add to Cart ── */
  const handleAddToCart = () => {
    if (!validateSize()) return;
    addToCart({ ...product, selectedColor }, selectedSize || 'OS');
    setShowSuccess(true);
    successTimerRef.current = setTimeout(() => {
      handleClose();
    }, 1700);
  };

  /* ── Buy Now → navigate to /cart ── */
  const handleBuyNow = () => {
    if (!validateSize()) return;
    if (buyNowLoading) return;

    setBuyNowLoading(true);
    addToCart({ ...product, selectedColor }, selectedSize || 'OS');

    setTimeout(() => {
      setBuyNowLoading(false);
      document.body.style.overflow = '';
      navigate('/cart', { replace: true });
      isClosingRef.current = true;
      clearInterval(timerRef.current);
      onClose();
    }, 420);
  };

  /* ── Wishlist toggle with animation ── */
  const handleWishlist = () => {
    toggleWishlist(product);
    if (!inWishlist) {
      setAddedToWishlist(true);
      setTimeout(() => setAddedToWishlist(false), 1200);
    }
  };

  const handleThumbClick = i => {
    setActiveImg(i);
    startTimer();
  };

  const goPrevImg = e => {
    e.stopPropagation();
    if (total <= 1) return;
    setActiveImg(prev => (prev - 1 + total) % total);
    startTimer();
  };

  const goNextImg = e => {
    e.stopPropagation();
    if (total <= 1) return;
    setActiveImg(prev => (prev + 1) % total);
    startTimer();
  };

  if (!product) return null;

  const shortDesc = product.description || '';
  const longDesc = product.longDescription ||
    `${shortDesc} Crafted with meticulous attention to detail, this piece embodies the spirit of timeless design — bridging heritage with contemporary relevance. Each element is thoughtfully considered to deliver an unparalleled experience of quality and elegance.`;

  return (
    <div className={`lv-page ${isActive ? 'active' : ''}`}>

      {/* ══ Mobile: Single scrollable column ══ */}
      {isMobile ? (
        <div className="lv-mobile-scroll" ref={rightPanelRef}>

          {/* Mobile Header */}
          <div className="lv-mobile-header">
            <button className="lv-back-btn-mobile" onClick={handleClose} aria-label="Go back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <span className="lv-mobile-brand">{product.brand || ''}</span>
            <button
              className={`lv-wish-mobile ${inWishlist ? 'active' : ''} ${addedToWishlist ? 'pulse' : ''}`}
              onClick={handleWishlist}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill={inWishlist ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="1.4">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {addedToWishlist && (
                <span className="lv-wish-toast">Added to wishlist</span>
              )}
            </button>
          </div>

          {/* Mobile Image Gallery */}
          <div className="lv-mobile-gallery" ref={heroRef}>
            <div className="lv-image-stack">
              {images.map((src, i) => (
                <div key={i}
                  className={`lv-image-frame ${i === activeImg ? 'is-active' : ''}`}>
                  <img src={src} alt={`${product.name} — view ${i + 1}`} draggable="false" />
                </div>
              ))}
            </div>

            {total > 1 && (
              <>
                <button className="lv-img-nav-arrow left" onClick={goPrevImg} aria-label="Previous">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className="lv-img-nav-arrow right" onClick={goNextImg} aria-label="Next">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}

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

            {/* Color indicator badge */}
            {selectedColor && (
              <div className="lv-color-badge">
                <span
                  className="lv-color-badge-dot"
                  style={{ background: selectedColor.value }}
                />
                <span>{selectedColor.name}</span>
              </div>
            )}
          </div>

          {/* Mobile Details */}
          <div className="lv-mobile-details">
            {product.sku && <div className="lv-sku">{product.sku}</div>}

            <h1 className="lv-name">{product.name}</h1>

            <div className="lv-price-block">
              <div className="lv-price">{product.price}</div>
              <div className="lv-tax">(M.R.P. incl. of all taxes)</div>
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="lv-section">
                <div className="lv-section-head">
                  <span className="lv-section-label">Colour</span>
                  <span className="lv-section-value">{selectedColor?.name}</span>
                </div>
                <div className="lv-swatches">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      className={`lv-swatch ${selectedColor?.name === color.name ? 'selected' : ''}`}
                      onClick={() => handleColorChange(color)}
                      aria-label={color.name}
                      title={color.name}
                    >
                      <span className="lv-swatch-inner" style={{ background: color.value }} />
                      {selectedColor?.name === color.name && (
                        <span className="lv-swatch-check" aria-hidden="true">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="lv-section">
                <div className="lv-section-head">
                  <span className="lv-section-label">
                    Size
                    {sizeError && (
                      <span className="lv-size-err-inline"> — please select a size</span>
                    )}
                  </span>
                  {selectedSize && !sizeError && (
                    <span className="lv-section-value">{selectedSize}</span>
                  )}
                </div>
                <div className={`lv-sizes ${sizeError ? 'shake' : ''}`}>
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`lv-size ${selectedSize === size ? 'selected' : ''} ${sizeError ? 'err' : ''}`}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizeError && (
              <p className="lv-size-err-below">
                ⚠ Please select a size before continuing.
              </p>
            )}

            {/* CTA Buttons */}
            <div className="lv-cta-row">
              <button
                className={`lv-cta ${showSuccess ? 'success' : ''}`}
                onClick={handleAddToCart}
                disabled={showSuccess || buyNowLoading}
              >
                <span className="lv-cta-text">
                  {showSuccess ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Added to Bag
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                      Add to Bag
                    </>
                  )}
                </span>
                {showSuccess && <span className="lv-cta-progress" aria-hidden="true" />}
              </button>

              <button
                className={`lv-buy-now ${buyNowLoading ? 'loading' : ''}`}
                onClick={handleBuyNow}
                disabled={showSuccess || buyNowLoading}
                aria-label="Buy now"
              >
                <span className="lv-cta-text">
                  {buyNowLoading ? (
                    <span className="lv-btn-dots">
                      <span /><span /><span />
                    </span>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z" />
                      </svg>
                      Buy Now
                    </>
                  )}
                </span>
              </button>
            </div>

            <p className="lv-concierge">
              Our Digital Concierge is available for any questions.
              <a href="#contact" className="lv-link"> Contact us</a>
            </p>

            {/* Description */}
            <div className="lv-desc">
              <p className={`lv-desc-text ${descExpanded ? 'expanded' : ''}`}>
                {longDesc}
              </p>
              <button className="lv-read-more" onClick={() => setDescExpanded(v => !v)}>
                {descExpanded ? 'Read Less ↑' : 'Read More ↓'}
              </button>
            </div>

            {/* Accordions */}
            <div className="lv-accordions">
              <Accordion title="Find in Store" icon="plus">
                <p>Locate this product at a boutique near you.</p>
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

      ) : (
        /* ══ DESKTOP: Side-by-side layout ══ */
        <>
          {/* LEFT — Images */}
          <div className="lv-left" ref={heroRef}>
            <button className="lv-back-btn" onClick={handleClose} aria-label="Go back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            {/* Color indicator */}
            {selectedColor && (
              <div className="lv-color-badge">
                <span
                  className="lv-color-badge-dot"
                  style={{ background: selectedColor.value }}
                />
                <span>{selectedColor.name}</span>
              </div>
            )}

            <div className="lv-image-stack">
              {images.map((src, i) => (
                <div key={i}
                  className={`lv-image-frame ${i === activeImg ? 'is-active' : ''}`}>
                  <img src={src} alt={`${product.name} — view ${i + 1}`} draggable="false" />
                </div>
              ))}
            </div>

            {total > 1 && (
              <>
                <button className="lv-img-nav-arrow left" onClick={goPrevImg} aria-label="Previous">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className="lv-img-nav-arrow right" onClick={goNextImg} aria-label="Next">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}

            {total > 1 && (
              <div className="lv-counter">
                <span className="lv-counter-num">{String(activeImg + 1).padStart(2, '0')}</span>
                <span className="lv-counter-sep">/</span>
                <span className="lv-counter-total">{String(total).padStart(2, '0')}</span>
              </div>
            )}

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

          {/* RIGHT — Details */}
          <div className="lv-right" ref={rightPanelRef}>
            <div className="lv-topbar">
              <button className="lv-close" onClick={handleClose} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <button
                className={`lv-wish-top ${inWishlist ? 'active' : ''} ${addedToWishlist ? 'pulse' : ''}`}
                onClick={handleWishlist}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24"
                  fill={inWishlist ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="1.4">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {addedToWishlist && (
                  <span className="lv-wish-toast">Added to wishlist</span>
                )}
              </button>
            </div>

            <div className="lv-content">
              {product.sku && <div className="lv-sku">{product.sku}</div>}

              <h1 className="lv-name">{product.name}</h1>

              <div className="lv-price-block">
                <div className="lv-price">{product.price}</div>
                <div className="lv-tax">(M.R.P. incl. of all taxes)</div>
              </div>

              {/* Colors */}
              {product.colors?.length > 0 && (
                <div className="lv-section">
                  <div className="lv-section-head">
                    <span className="lv-section-label">Colour</span>
                    <span className="lv-section-value">{selectedColor?.name}</span>
                  </div>
                  <div className="lv-swatches">
                    {product.colors.map(color => (
                      <button
                        key={color.name}
                        className={`lv-swatch ${selectedColor?.name === color.name ? 'selected' : ''}`}
                        onClick={() => handleColorChange(color)}
                        aria-label={color.name}
                        title={color.name}
                      >
                        <span className="lv-swatch-inner" style={{ background: color.value }} />
                        {selectedColor?.name === color.name && (
                          <span className="lv-swatch-check" aria-hidden="true">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div className="lv-section">
                  <div className="lv-section-head">
                    <span className="lv-section-label">
                      Size
                      {sizeError && (
                        <span className="lv-size-err-inline"> — please select a size</span>
                      )}
                    </span>
                    {selectedSize && !sizeError && (
                      <span className="lv-section-value">{selectedSize}</span>
                    )}
                  </div>
                  <div className={`lv-sizes ${sizeError ? 'shake' : ''}`}>
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        className={`lv-size ${selectedSize === size ? 'selected' : ''} ${sizeError ? 'err' : ''}`}
                        onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="lv-cta-row">
                <button
                  className={`lv-cta ${showSuccess ? 'success' : ''}`}
                  onClick={handleAddToCart}
                  disabled={showSuccess || buyNowLoading}
                >
                  <span className="lv-cta-text">
                    {showSuccess ? (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Added to Bag
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        Add to Bag
                      </>
                    )}
                  </span>
                  {showSuccess && <span className="lv-cta-progress" aria-hidden="true" />}
                </button>

                <button
                  className={`lv-buy-now ${buyNowLoading ? 'loading' : ''}`}
                  onClick={handleBuyNow}
                  disabled={showSuccess || buyNowLoading}
                  aria-label="Buy now"
                >
                  <span className="lv-cta-text">
                    {buyNowLoading ? (
                      <span className="lv-btn-dots">
                        <span /><span /><span />
                      </span>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z" />
                        </svg>
                        Buy Now
                      </>
                    )}
                  </span>
                </button>
              </div>

              {sizeError && (
                <p className="lv-size-err-below">
                  ⚠ Please select a size before continuing.
                </p>
              )}

              <p className="lv-concierge">
                Our Digital Concierge is available for any questions.
                <a href="#contact" className="lv-link"> Contact us</a>
              </p>

              {/* Description */}
              <div className="lv-desc">
                <p className={`lv-desc-text ${descExpanded ? 'expanded' : ''}`}>
                  {longDesc}
                </p>
                <button className="lv-read-more" onClick={() => setDescExpanded(v => !v)}>
                  {descExpanded ? 'Read Less ↑' : 'Read More ↓'}
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
        </>
      )}
    </div>
  );
};

export default ProductDetail;