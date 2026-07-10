/* ─── Product card ──────────────────────────────────────── */
const ProductCard = ({ product, onProductClick, index }) => {
  const [isVisible, setIsVisible]     = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering]   = useState(false);
  const cardRef = useRef(null);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image];
  const hasMultiple = images.length > 1;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setIsVisible(true), index * 100); },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => { if (cardRef.current) observer.unobserve(cardRef.current); };
  }, [index]);

  // Crossfade to the 2nd photo on hover, fade back on mouse-leave
  useEffect(() => {
    if (!hasMultiple) return;
    setCurrentIndex(isHovering ? 1 : 0);
  }, [isHovering, hasMultiple]);

  const handleArrow = (e, dir) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + dir + images.length) % images.length);
  };

  return (
    <div
      ref={cardRef}
      className={`product-card ${isVisible ? 'visible' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="product-image-wrapper" onClick={() => onProductClick(product)}>
        <div className="image-overlay" />

        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={product.name}
            className={`product-img ${i === currentIndex ? 'active' : ''}`}
          />
        ))}

        {hasMultiple && (
          <>
            <button
              className="product-nav-arrow left"
              onClick={(e) => handleArrow(e, -1)}
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className="product-nav-arrow right"
              onClick={(e) => handleArrow(e, 1)}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

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