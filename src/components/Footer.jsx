import React, { useState } from 'react';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle email submission
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3 className="footer-heading">MAY WE HELP YOU?

</h3>
          <ul className="footer-links">
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/order">My Order</a></li>
            <li><a href="/faq">FAQs</a></li>
            
          </ul>
          <ul className="footer-links footer-links-secondary">
            <li><a href="/runways">About Loudly Worn</a></li>
            <li><a href="/campaigns">CAMPAIGNS</a></li>
            <li><a href="/the-amiri-prize">THE AMIRI PRIZE</a></li>
            <li><a href="/store-locator">STORE LOCATOR</a></li>
            <li><a href="/stockists">STOCKISTS</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">CLIENT SERVICES</h3>
          <ul className="footer-links">
            <li><a href="/privacy-policy">PRIVACY POLICY</a></li>
            <li><a href="/term">TERMS & CONDITIONS</a></li>
            <li><a href="/shipping-returns">SHIPPING & RETURNS</a></li>
            <li><a href="/faq">FAQS</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">CONNECT</h3>
          <ul className="footer-links">
            <li><a href="/contact">CONTACT</a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">INSTAGRAM</a></li>
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">FACEBOOK</a></li>
            <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YOUTUBE</a></li>
            <li><a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TIK TOK</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LINKEDIN</a></li>
          </ul>
        </div>

        
      </div>
    </footer>
  );
};

export default Footer;