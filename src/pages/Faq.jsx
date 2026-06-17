import React, { useState } from 'react';
import './faq.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What services do you offer?",
      answer: "We provide comprehensive digital solutions including web development, design, and strategic consulting to help your business thrive in the digital landscape."
    },
    {
      question: "How long does a typical project take?",
      answer: "Project timelines vary based on scope and complexity. A standard website takes 4-6 weeks, while larger applications may require 2-3 months. We'll provide a detailed timeline during our initial consultation."
    },
    {
      question: "What is your pricing structure?",
      answer: "We offer flexible pricing models tailored to your needs. Whether you prefer project-based pricing, monthly retainers, or hourly rates, we'll find a structure that works for your budget and goals."
    },
    {
      question: "Do you provide ongoing support?",
      answer: "Absolutely. We offer maintenance packages and ongoing support to ensure your digital products continue to perform optimally. Our team is always available to assist with updates, improvements, and technical issues."
    },
    {
      question: "Can you work with existing systems?",
      answer: "Yes, we specialize in integrating with existing infrastructure. Whether it's legacy systems, third-party APIs, or modern cloud platforms, we ensure seamless compatibility and enhanced functionality."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h1 className="faq-title">Questions & Answers</h1>
        <p className="faq-subtitle">Everything you need to know</p>
      </div>
      
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${openIndex === index ? 'active' : ''}`}
          >
            <button 
              className="faq-question"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
            >
              <span>{faq.question}</span>
              <svg 
                className="faq-icon" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <div className="faq-answer-wrapper">
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;