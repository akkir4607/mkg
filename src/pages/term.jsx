import React, { useState, useEffect } from 'react';
import './term.css';

const Terms = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "Use License",
      content: "Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to reverse engineer any software contained on our website; remove any copyright or other proprietary notations from the materials; or transfer the materials to another person or 'mirror' the materials on any other server."
    },
    {
      title: "Disclaimer",
      content: "The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
    },
    {
      title: "Limitations",
      content: "In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage."
    },
    {
      title: "Accuracy of Materials",
      content: "The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our website are accurate, complete, or current. We may make changes to the materials contained on our website at any time without notice."
    },
    {
      title: "Links",
      content: "We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk."
    },
    {
      title: "Modifications",
      content: "We may revise these terms of service for our website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service."
    },
    {
      title: "Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction and you irrevocably submit to the exclusive jurisdiction of the courts in that location."
    },
    {
      title: "Privacy Policy",
      content: "Your use of our website is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices."
    },
    {
      title: "Contact Information",
      content: "If you have any questions about these Terms and Conditions, please contact us at legal@example.com. We will respond to all inquiries within 48 hours during business days."
    }
  ];

  return (
    <div className="terms-container">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>
      
      <div className="terms-header">
        <h1 className="terms-title">Terms & Conditions</h1>
        <p className="terms-date">Last updated: February 10, 2026</p>
      </div>

      <div className="terms-content">
        <div className="terms-intro">
          <p>
            Please read these terms and conditions carefully before using our service. 
            Your access to and use of the service is conditioned on your acceptance of 
            and compliance with these terms.
          </p>
        </div>

        <div className="terms-sections">
          {sections.map((section, index) => (
            <section key={index} className="terms-section">
              <h2 className="section-title">
                <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
                {section.title}
              </h2>
              <p className="section-content">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="terms-footer">
          <div className="footer-divider"></div>
          <p className="footer-text">
            By continuing to use our services, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;