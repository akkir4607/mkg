// Front.jsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Front.css'
import banner2002 from '../images/2002.jpeg'
import banner2003 from '../images/2003.png'
import banner2004 from '../images/2004.png'
import banner2005 from '../images/2005.jpg'
import Women from './Women'
import Men from './Men'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import image7 from '../images/2000.jpeg'
import video515 from '../images/515.mp4'
import stickyCat1 from '../images/10000.jpg'
import stickyCat2 from '../images/10001.jpg'
import stickyCat3 from '../images/10002.jpg'

const SLIDE_DURATION = 5000
const SWIPE_THRESHOLD = 40

const slides = [
  { image: banner2002, title: 'New Collection', subtitle: 'Where bold meets timeless', link: '/new-collection' },
  { image: banner2003, title: 'Summer Edit', subtitle: 'Light fabrics, loud attitude', link: '/summer-edit' },
  { image: banner2004, title: 'Street Style', subtitle: 'Worn loud, worn proud', link: '/street-style' },
  { image: banner2005, title: 'Signature Looks', subtitle: 'Define your own statement', link: '/signature-looks' },
]

const stickyCategories = [
  { image: stickyCat1, title: 'TOPS & SHIRTS', link: '/tops-shirts' },
  { image: stickyCat2, title: 'DRESSES', link: '/dresses' },
  { image: stickyCat3, title: 'ACCESSORIES', link: '/accessories' },
]

function useScrollReveal(threshold = 0.2) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, visible]
}

function Front() {
  const [collectionRef, collectionVisible] = useScrollReveal()
  const [activeSlide, setActiveSlide] = useState(0)
  const [cycleKey, setCycleKey] = useState(0)
  const timeoutRef = useRef(null)

  // Touch tracking refs — refs so they never cause re-renders
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const touchLocked = useRef(null) // 'swipe' | 'scroll' | null
  const didSwipe = useRef(false)   // prevent Link navigation after swipe

  // ── slide helpers ──────────────────────────────────────────
  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  const goToSlide = useCallback((index) => {
    resetTimer()
    setActiveSlide(index)
    setCycleKey((k) => k + 1)
  }, [resetTimer])

  const goPrev = useCallback((e) => {
    e?.preventDefault()
    resetTimer()
    setActiveSlide((p) => (p - 1 + slides.length) % slides.length)
    setCycleKey((k) => k + 1)
  }, [resetTimer])

  const goNext = useCallback((e) => {
    e?.preventDefault()
    resetTimer()
    setActiveSlide((p) => (p + 1) % slides.length)
    setCycleKey((k) => k + 1)
  }, [resetTimer])

  // Auto-advance
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveSlide((p) => (p + 1) % slides.length)
      setCycleKey((k) => k + 1)
    }, SLIDE_DURATION)
    return () => clearTimeout(timeoutRef.current)
  }, [activeSlide])

  // ── touch handlers (attached via useEffect for passive:false) ──
  const heroRef = useRef(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return

    const onTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchLocked.current = null
      didSwipe.current = false
    }

    const onTouchMove = (e) => {
      if (!touchStartX.current) return
      const dx = e.touches[0].clientX - touchStartX.current
      const dy = e.touches[0].clientY - touchStartY.current

      // Lock direction on first significant move
      if (!touchLocked.current) {
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
          touchLocked.current = 'swipe'
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
          touchLocked.current = 'scroll'
        }
      }

      // If it's a horizontal swipe, block page scroll
      if (touchLocked.current === 'swipe') {
        e.preventDefault()
      }
    }

    const onTouchEnd = (e) => {
      if (!touchStartX.current || touchLocked.current !== 'swipe') {
        touchStartX.current = null
        return
      }

      const dx = e.changedTouches[0].clientX - touchStartX.current

      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        didSwipe.current = true
        if (dx < 0) goNext()
        else goPrev()
      }

      touchStartX.current = null
      touchStartY.current = null
      touchLocked.current = null
    }

    // passive:false on move so we can call preventDefault
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [goNext, goPrev])

  // ── prevent Link click after a swipe ──────────────────────
  const handleSlideClick = useCallback((e) => {
    if (didSwipe.current) {
      e.preventDefault()
      didSwipe.current = false
    }
  }, [])

  return (
    <>
      <Navbar />

      <div className="front-page">
        <section className="hero-sticky-wrap">

          {/* HERO CAROUSEL */}
          <div className="hero" ref={heroRef}>
            {slides.map((slide, index) => (
              <Link
                to={slide.link}
                key={slide.link}
                className={`hero-slide ${index === activeSlide ? 'hero-slide--active' : ''}`}
                aria-hidden={index !== activeSlide}
                tabIndex={index === activeSlide ? 0 : -1}
                draggable="false"
                onClick={handleSlideClick}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="hero-slide__image"
                  draggable="false"
                />
                <div className="hero-slide__scrim" />
                <div className="hero-slide__content">
                  <h1 className="hero-slide__title">{slide.title}</h1>
                  <p className="hero-slide__subtitle">{slide.subtitle}</p>
                  <span className="hero-slide__cta">
                    Shop Now <span className="hero-slide__arrow">→</span>
                  </span>
                </div>
              </Link>
            ))}

            {/* ── PREV / NEXT ARROWS ── */}
            <button
              type="button"
              className="hero-nav hero-nav--prev"
              onClick={goPrev}
              aria-label="Previous slide"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              type="button"
              className="hero-nav hero-nav--next"
              onClick={goNext}
              aria-label="Next slide"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* ── PROGRESS DOTS ── */}
            <div className="hero-progress" role="tablist" aria-label="Choose banner slide">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === activeSlide}
                  aria-label={`Show slide ${index + 1}`}
                  className="hero-progress__track"
                  onClick={() => goToSlide(index)}
                >
                  {index < activeSlide && (
                    <span className="hero-progress__fill hero-progress__fill--full" />
                  )}
                  {index === activeSlide && (
                    <span
                      key={cycleKey}
                      className="hero-progress__fill hero-progress__fill--active"
                      style={{ animationDuration: `${SLIDE_DURATION}ms` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CATEGORY GRID */}
          <div className="sticky-reveal__grid">
            {stickyCategories.map((cat) => (
              <Link to={cat.link} key={cat.title} className="sticky-reveal__card">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="sticky-reveal__card-image"
                  loading="lazy"
                  draggable="false"
                />
                <div className="sticky-reveal__card-overlay" />
                <h3 className="sticky-reveal__card-title">{cat.title}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Women Collection */}
        <Women />

        {/* New Collection Banner */}
        <Link
          to="/new-collection"
          ref={collectionRef}
          className={`extra-section ${collectionVisible ? 'extra-section--visible' : ''}`}
        >
          <img src={image7} alt="New Collection" className="extra-image" />
          <h2 className="collection-overlay">
            NEW COLLECTION <span className="arrow">→</span>
          </h2>
        </Link>

        {/* Men Section */}
        <Men />

        {/* VIDEO SECTION */}
        <div className="video-section">
          <div className="video-container">
            <video className="background-video" autoPlay loop muted playsInline>
              <source src={video515} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-text-overlay">
              <h1>LOUDLY WORN</h1>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default Front