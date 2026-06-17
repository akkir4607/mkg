import React, { useState } from 'react';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    message: '',
    contactNumber: ''
  });
  const [focusedField, setFocusedField] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, submitting, success, error

  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 day delivery."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all unused items in original packaging. Returns are free and easy to initiate from your account."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 100 countries worldwide. International shipping times vary by location, typically 7-14 business days."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track orders directly from your account dashboard."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and select Buy Now Pay Later options."
    },
    {
      question: "Can I modify my order after placing it?",
      answer: "Orders can be modified within 1 hour of placement. After that, please contact our support team for assistance."
    },
    {
      question: "Do you offer gift wrapping?",
      answer: "Yes, gift wrapping is available for a small fee during checkout. We also include personalized gift messages at no extra cost."
    },
    {
      question: "How do I use a discount code?",
      answer: "Enter your discount code at checkout in the promo code field. Codes are case-sensitive and cannot be combined with other offers."
    },
    {
      question: "What if my item arrives damaged?",
      answer: "We're sorry if that happens! Contact us within 48 hours with photos of the damage, and we'll send a replacement or full refund immediately."
    },
    {
      question: "Do you have a loyalty program?",
      answer: "Yes! Our rewards program offers points on every purchase, exclusive discounts, early access to sales, and special birthday perks."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('submitting');

    try {
      // Replace 'YOUR_FORM_ID' with your actual Formspree form ID
      const response = await fetch('https://formspree.io/f/xvzanavl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.fullName,
          message: formData.message,
          phone: formData.contactNumber
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ fullName: '', message: '', contactNumber: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .faq-item {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) backwards;
        }

        .faq-item:nth-child(1) { animation-delay: 0.1s; }
        .faq-item:nth-child(2) { animation-delay: 0.15s; }
        .faq-item:nth-child(3) { animation-delay: 0.2s; }
        .faq-item:nth-child(4) { animation-delay: 0.25s; }
        .faq-item:nth-child(5) { animation-delay: 0.3s; }
        .faq-item:nth-child(6) { animation-delay: 0.35s; }
        .faq-item:nth-child(7) { animation-delay: 0.4s; }
        .faq-item:nth-child(8) { animation-delay: 0.45s; }
        .faq-item:nth-child(9) { animation-delay: 0.5s; }
        .faq-item:nth-child(10) { animation-delay: 0.55s; }

        .header {
          animation: fadeIn 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
        }

        .form-container {
          animation: fadeInUp 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) 0.6s backwards;
        }

        .faq-answer {
          animation: slideDown 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header} className="header">
          <h1 style={styles.title}>Support</h1>
          <p style={styles.subtitle}>We're here to help with any questions you might have</p>
        </header>

        {/* FAQ Section */}
        <section style={styles.faqSection}>
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div style={styles.faqList}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={styles.faqItem}
                className="faq-item"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  style={{
                    ...styles.faqQuestion,
                    ...(openFaq === index ? styles.faqQuestionOpen : {})
                  }}
                >
                  <span style={styles.questionText}>{faq.question}</span>
                  <span style={{
                    ...styles.icon,
                    transform: openFaq === index ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}>
                    +
                  </span>
                </button>
                {openFaq === index && (
                  <div style={styles.faqAnswer} className="faq-answer">
                    <p style={styles.answerText}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section style={styles.formSection} className="form-container">
          <h2 style={styles.sectionTitle}>Still need help?</h2>
          <p style={styles.formSubtitle}>Send us a message and we'll get back to you shortly</p>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
                required
                style={{
                  ...styles.input,
                  ...(focusedField === 'fullName' ? styles.inputFocused : {})
                }}
                placeholder="Enter your full name"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>What you want to ask/share</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                required
                rows="5"
                style={{
                  ...styles.textarea,
                  ...(focusedField === 'message' ? styles.inputFocused : {})
                }}
                placeholder="Tell us how we can help you..."
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                onFocus={() => setFocusedField('contactNumber')}
                onBlur={() => setFocusedField(null)}
                required
                style={{
                  ...styles.input,
                  ...(focusedField === 'contactNumber' ? styles.inputFocused : {})
                }}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <button type="submit" style={styles.submitButton} disabled={submitStatus === 'submitting'}>
              {submitStatus === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>

            {submitStatus === 'success' && (
              <div style={styles.successMessage}>
                ✓ Thank you! We'll get back to you soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div style={styles.errorMessage}>
                × Something went wrong. Please try again.
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: '#fafafa',
    fontFamily: "'Manrope', sans-serif",
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '60px 24px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '80px',
  },
  title: {
    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
    fontFamily: "'Instrument Serif', serif",
    fontWeight: '400',
    color: '#0a0a0a',
    marginBottom: '16px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 2vw, 1.125rem)',
    color: '#666',
    fontWeight: '400',
  },
  faqSection: {
    marginBottom: '100px',
  },
  sectionTitle: {
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontFamily: "'Instrument Serif', serif",
    fontWeight: '400',
    color: '#0a0a0a',
    marginBottom: '40px',
    letterSpacing: '-0.01em',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  faqItem: {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e5e5e5',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
  },
  faqQuestion: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 28px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
  },
  faqQuestionOpen: {
    background: '#fafafa',
  },
  questionText: {
    fontSize: '1.0625rem',
    fontWeight: '500',
    color: '#0a0a0a',
    lineHeight: '1.5',
    paddingRight: '20px',
  },
  icon: {
    fontSize: '1.75rem',
    color: '#666',
    fontWeight: '300',
    transition: 'transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
    minWidth: '24px',
  },
  faqAnswer: {
    overflow: 'hidden',
  },
  answerText: {
    padding: '0 28px 28px 28px',
    fontSize: '0.9375rem',
    color: '#666',
    lineHeight: '1.7',
  },
  formSection: {
    background: '#fff',
    borderRadius: '24px',
    padding: 'clamp(32px, 5vw, 48px)',
    border: '1px solid #e5e5e5',
  },
  formSubtitle: {
    fontSize: '0.9375rem',
    color: '#666',
    marginBottom: '40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#0a0a0a',
    letterSpacing: '0.01em',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    fontSize: '1rem',
    color: '#0a0a0a',
    background: '#fafafa',
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
    fontFamily: "'Manrope', sans-serif",
  },
  textarea: {
    width: '100%',
    padding: '16px 20px',
    fontSize: '1rem',
    color: '#0a0a0a',
    background: '#fafafa',
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
    fontFamily: "'Manrope', sans-serif",
    resize: 'vertical',
  },
  inputFocused: {
    background: '#fff',
    borderColor: '#0a0a0a',
  },
  submitButton: {
    padding: '18px 32px',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#fafafa',
    background: '#0a0a0a',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
    marginTop: '12px',
    fontFamily: "'Manrope', sans-serif",
  },
  successMessage: {
    padding: '16px 20px',
    background: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '12px',
    color: '#166534',
    fontSize: '0.9375rem',
    textAlign: 'center',
    animation: 'fadeInUp 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
  },
  errorMessage: {
    padding: '16px 20px',
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: '12px',
    color: '#991b1b',
    fontSize: '0.9375rem',
    textAlign: 'center',
    animation: 'fadeInUp 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
  },
};