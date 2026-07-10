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

  const goToSlide = useCallback((index) => {
    setActiveSlide(index)
    setCycleKey((k) => k + 1)
  }, [])

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
      setCycleKey((k) => k + 1)
    }, SLIDE_DURATION)
    return () => clearTimeout(timeoutRef.current)
  }, [activeSlide])

  return (
    <>
      <Navbar />

      <div className="front-page">
        {/* ✅ HERO + STICKY REVEAL WRAPPER
            The hero carousel is sticky-pinned inside this tall wrapper.
            As you scroll, the category grid slides up over the pinned hero. */}
        <section className="hero-sticky-wrap">
          {/* HERO CAROUSEL — pinned while you scroll */}
          <div className="hero">
            {slides.map((slide, index) => (
              <Link
                to={slide.link}
                key={slide.link}
                className={`hero-slide ${index === activeSlide ? 'hero-slide--active' : ''}`}
                aria-hidden={index !== activeSlide}
                tabIndex={index === activeSlide ? 0 : -1}
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

          {/* CATEGORY GRID — slides up over the hero as you scroll */}
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

        {/* Women Collection Section */}
        <Women />

        {/* New Collection Section */}
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