import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <>
      {/* Navbar added */}
      <Navbarr />

      <div className="contact-container">
        <div className="contact-header">
          <h1>LOUDLY WORN SERVICES</h1>
          <p className="contact-subtitle">
            CHOOSE YOUR PREFERRED METHOD OF CONTACT AND CONNECT WITH US
          </p>
        </div>

        <div className="contact-methods">
          {/* PHONE */}
          <div className="contact-method">
            <h2>PHONE</h2>
            <p className="contact-hours">
              Monday - Saturday from 10 AM to 10 PM (EST).<br />
              Sunday from 10 AM to 9 PM (EST).
            </p>
            <a href="tel:+18774822430" className="contact-link">
              <span className="icon">📞</span> Call Us +1 (877) 482-2430
            </a>
          </div>

          {/* EMAIL */}
          <div className="contact-method">
            <h2>EMAIL</h2>
            <p className="contact-hours">
              Your inquiry will receive a response from a Client Advisor.
            </p>
            <a href="mailto:contact@example.com" className="contact-link">
              <span className="icon">✉️</span> Write Us
            </a>
          </div>

          {/* WHATSAPP */}
          <div className="contact-method">
            <h2>WHATSAPP</h2>
            <p className="contact-hours">
              Monday - Saturday from 10 AM to 10 PM (EST).<br />
              Sunday from 10 AM to 9 PM (EST).
            </p>
            <a href="https://wa.me/" className="contact-link">
              <span className="icon">📱</span> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
