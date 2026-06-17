import { useEffect, useState } from 'react'
import './Preloader.css'

const Preloader = ({ onLoadingComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Total animation duration: 3 seconds
    const timer = setTimeout(() => {
      setIsAnimating(false)
      setTimeout(() => {
        onLoadingComplete()
      }, 500) // Wait for fade out
    }, 3000)

    return () => clearTimeout(timer)
  }, [onLoadingComplete])

  return (
    <div className={`preloader ${!isAnimating ? 'preloader--hidden' : ''}`}>
      <div className="preloader__content">
        <h1 className="preloader__text">LOUDLY WORN</h1>
      </div>
      <div className="preloader__wipe"></div>
    </div>
  )
}

export default Preloader