// Front.jsx
import { useState } from 'react'
import './Front.css'
import bannerImage from '../images/512.jpg'
import image6 from '../images/5.jpg'
import Women from './Women'
import Men from './Men'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import image7 from '../images/507.jpeg'
import video515 from '../images/515.mp4'

function Front() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      {/* ✅ NAVBAR */}
      <Navbar />

      <div className="front-page">
        {/* Banner Section */}
        <div className="front-container">
          
          {/* TEXT OUTSIDE IMAGE - BOTTOM RIGHT CORNER */}
          <div className="outside-text">
            <h1>DISCOVER THE PREMIUMNESS</h1>
            <p>SUMMER 2026</p>
          </div>

          {/* IMAGE BANNER */}
          <div 
            className={`banner ${isHovered ? 'hovered' : ''}`}
            style={{ backgroundImage: `url(${bannerImage})` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="banner-overlay"></div>
          </div>
        </div>

        {/* Women Collection Section */}
        <Women />

        {/* Extra Section */}
        <div className="extra-section">
          <img src={image7} alt="New Collection" className="extra-image" />
          <h2 className="collection-overlay">
            NEW COLLECTION <span className="arrow">→</span>
          </h2>
        </div>

        {/* Men Section */}
        <Men />

        {/* ✅ VIDEO SECTION - ZARA STYLE */}
        <div className="video-section">
          <div className="video-container">
            <video 
              className="background-video" 
              autoPlay 
              loop 
              muted 
              playsInline
            >
              <source src={video515} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            <div className="video-text-overlay">
              <h1>LOUDLY WORN</h1>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}

export default Front