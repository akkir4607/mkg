import React, { useState, useEffect, useRef } from 'react';
import './Login.css';
import img09 from '../images/135.jpg';
import Navbar from '../components/Navbar';
import {
  loginUser,
  registerUser,
  resetPassword,
  logoutUser,
  verifyOTP,
  resendOTP,
} from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';

const Login = () => {
  const { isLoggedIn, currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [formTransitioning, setFormTransitioning] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [regData, setRegData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    address: '', city: '', state: '', zipCode: '', country: '',
    agreeTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [regStep, setRegStep] = useState(1);
  const [stepDirection, setStepDirection] = useState('forward');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loggingOut, setLoggingOut] = useState(false);

  // OTP state
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (showOTP && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0]?.focus(), 400);
    }
  }, [showOTP]);

  const switchForm = (toRegister) => {
    setFormTransitioning(true);
    setError('');
    setMessage('');
    setFieldErrors({});
    setTimeout(() => {
      setIsRegister(toRegister);
      if (!toRegister) setRegStep(1);
      setTimeout(() => setFormTransitioning(false), 50);
    }, 300);
  };

  // ─── OTP Handlers ──────────────────────────────────────
  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOTP = [...otp];
    newOTP[index] = value.slice(-1);
    setOtp(newOTP);
    setError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOTP = [...otp];
    for (let i = 0; i < 6; i++) newOTP[i] = pasted[i] || '';
    setOtp(newOTP);
    const lastIndex = Math.min(pasted.length, 5);
    otpRefs.current[lastIndex]?.focus();
  };

  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setOtpLoading(true);
    setError('');
    const user = auth.currentUser;
    if (!user) {
      setError('Session expired. Please login again.');
      setOtpLoading(false);
      handleBackToLogin();
      return;
    }
    const result = await verifyOTP(user.uid, code);
    if (result.success) {
      setMessage('✓ Verified successfully! Redirecting...');
      setOtpLoading(false);
      setTimeout(() => navigate('/'), 1500);
    } else {
      setError(result.error);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setOtpLoading(true);
    setError('');
    setMessage('');
    const result = await resendOTP();
    if (result.success) {
      setMessage('New code sent to your email!');
      setResendCooldown(30);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } else {
      setError(result.error);
    }
    setOtpLoading(false);
  };

  const handleBackToLogin = async () => {
    await logoutUser();
    setShowOTP(false);
    setOtp(['', '', '', '', '', '']);
    setOtpEmail('');
    setIsRegister(false);
    setRegStep(1);
    setError('');
    setMessage('');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutUser();
    setLoggingOut(false);
    setMessage('Signed out successfully.');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    const result = await loginUser(email.trim(), password);
    if (result.success) {
      if (result.requiresVerification) {
        setOtpEmail(email.trim());
        setShowOTP(true);
        setMessage('Verification code sent to your email.');
        setLoading(false);
      } else {
        setMessage('Login successful! Redirecting...');
        setLoading(false);
        setTimeout(() => navigate('/'), 1200);
      }
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleRegChange = (field, value) => {
    setRegData((prev) => ({ ...prev, [field]: value }));
    setError('');
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const validateStep1 = () => {
    const errs = {};
    if (!regData.firstName.trim()) errs.firstName = 'First name is required';
    if (!regData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!regData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email))
      errs.email = 'Invalid email format';
    if (!regData.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^[\d\s\-+()]{7,15}$/.test(regData.phone))
      errs.phone = 'Invalid phone number';
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!regData.password) errs.password = 'Password is required';
    else if (regData.password.length < 8) errs.password = 'Minimum 8 characters';
    if (!regData.confirmPassword) errs.confirmPassword = 'Please confirm password';
    else if (regData.password !== regData.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    if (!regData.address.trim()) errs.address = 'Address is required';
    if (!regData.city.trim()) errs.city = 'City is required';
    if (!regData.zipCode.trim()) errs.zipCode = 'ZIP code is required';
    if (!regData.country.trim()) errs.country = 'Country is required';
    return errs;
  };

  const nextStep = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setStepDirection('forward');
    setFormTransitioning(true);
    setTimeout(() => {
      setRegStep(2);
      setTimeout(() => setFormTransitioning(false), 50);
    }, 250);
  };

  const prevStep = () => {
    setStepDirection('backward');
    setFieldErrors({});
    setFormTransitioning(true);
    setTimeout(() => {
      setRegStep(1);
      setTimeout(() => setFormTransitioning(false), 50);
    }, 250);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    if (!regData.agreeTerms) {
      setError('Please agree to the terms & conditions');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    const result = await registerUser({
      ...regData,
      email: regData.email.trim(),
    });
    if (result.success) {
      setOtpEmail(regData.email.trim());
      setShowOTP(true);
      setMessage('Account created! Check your email for the verification code.');
      setLoading(false);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    const result = await resetPassword(email.trim());
    if (result.success) {
      setMessage('Password reset email sent! Check your inbox.');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const getPasswordStrength = (pw) => {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: 'WEAK', color: '#dc3545' };
    if (score <= 2) return { level: 2, label: 'FAIR', color: '#fd7e14' };
    if (score <= 3) return { level: 3, label: 'GOOD', color: '#ffc107' };
    if (score <= 4) return { level: 4, label: 'STRONG', color: '#198754' };
    return { level: 5, label: 'VERY STRONG', color: '#0d6efd' };
  };

  const strength = getPasswordStrength(regData.password);

  const EyeOff = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  const EyeOn = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  // ─── OTP SCREEN ────────────────────────────────────────
  if (showOTP) {
    return (
      <>
        <Navbar />
        <div className="login-container">
          <div className="login-left">
            <div className="login-form-wrapper">
              <div className="zara-logo"><h1>AYRA</h1></div>

              <div className="login-form form-enter">
                <div className="otp-header">
                  <div className="otp-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <h2>Verify Your Email</h2>
                  <p className="otp-description">
                    Enter the 6-digit code sent to<br />
                    <strong>{otpEmail}</strong>
                  </p>
                  <p className="otp-hint">📬 Check your inbox (and spam folder)</p>
                </div>

                {error && <div className="alert-message alert-error">{error}</div>}
                {message && <div className="alert-message alert-success">{message}</div>}

                <form onSubmit={handleVerifyOTP}>
                  <div className="otp-inputs">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        onPaste={index === 0 ? handleOTPPaste : undefined}
                        className={`otp-input ${digit ? 'filled' : ''}`}
                        disabled={otpLoading}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>

                  <div className="resend-section">
                    {resendCooldown > 0 ? (
                      <span className="resend-cooldown">
                        Resend code in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="forgot-link"
                        onClick={handleResendOTP}
                        disabled={otpLoading}
                      >
                        Didn't receive it? Resend code
                      </button>
                    )}
                  </div>

                  <div className="button-group">
                    <button
                      type="submit"
                      className="login-btn"
                      disabled={otpLoading || otp.join('').length !== 6}
                    >
                      {otpLoading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
                    </button>
                    <button
                      type="button"
                      className="register-btn"
                      onClick={handleBackToLogin}
                      disabled={otpLoading}
                    >
                      ← BACK
                    </button>
                  </div>
                </form>
              </div>

              <div className="help-section">
                <a href="#help" className="help-link">NEED HELP?</a>
              </div>
            </div>
          </div>

          <div className="login-right">
            <div className="model-image">
              <img src={img09} alt="Fashion editorial" className="model-img"
                loading="eager" draggable="false" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── LOGGED-IN CARD ────────────────────────────────────
  if (isLoggedIn) {
    const displayName =
      userData?.firstName ||
      currentUser?.displayName?.split(' ')[0] ||
      currentUser?.email?.split('@')[0] ||
      'there';

    return (
      <>
        <Navbar />
        <div className="login-container">
          <div className="login-left">
            <div className="login-form-wrapper">
              <div className="zara-logo"><h1>AYRA</h1></div>

              <div className="login-form form-enter">
                <h2>Welcome Back</h2>
                {message && <div className="alert-message alert-success">{message}</div>}

                <div className="logged-in-card">
                  <div className="user-avatar">{displayName.charAt(0).toUpperCase()}</div>
                  <p className="logged-in-greeting">Hello, <strong>{displayName}</strong></p>
                  <p className="logged-in-email">{currentUser?.email}</p>
                </div>

                <div className="button-group">
                  <button type="button" className="login-btn" onClick={() => navigate('/')}>
                    CONTINUE SHOPPING
                  </button>
                  <button
                    type="button"
                    className="register-btn"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    {loggingOut ? 'SIGNING OUT...' : 'SIGN OUT'}
                  </button>
                </div>
              </div>

              <div className="help-section">
                <a href="#help" className="help-link">NEED HELP?</a>
              </div>
            </div>
          </div>

          <div className="login-right">
            <div className="model-image">
              <img src={img09} alt="Fashion editorial" className="model-img"
                loading="eager" draggable="false" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── LOGIN / REGISTER FORM ─────────────────────────────
  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-left">
          <div className="login-form-wrapper">
            <div className="zara-logo"><h1>AYRA</h1></div>

            <div className={`login-form ${formTransitioning ? 'form-exit' : 'form-enter'}`}>
              {!isRegister ? (
                <>
                  <h2>Log In</h2>
                  {error && <div className="alert-message alert-error">{error}</div>}
                  {message && <div className="alert-message alert-success">{message}</div>}

                  <form onSubmit={handleLoginSubmit} noValidate>
                    <div className="input-group">
                      <input
                        type="email"
                        placeholder="EMAIL"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        className="login-input"
                        disabled={loading}
                        autoComplete="email"
                        inputMode="email"
                      />
                    </div>

                    <div className="input-group">
                      <input
                        type="password"
                        placeholder="PASSWORD"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="login-input"
                        disabled={loading}
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="forgot-password">
                      <button
                        type="button"
                        className="forgot-link"
                        onClick={handleForgotPassword}
                        disabled={loading}
                      >
                        Forgot your password?
                      </button>
                    </div>

                    <div className="button-group">
                      <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'LOGGING IN...' : 'LOG IN'}
                      </button>
                      <button
                        type="button"
                        className="register-btn"
                        onClick={() => switchForm(true)}
                        disabled={loading}
                      >
                        CREATE ACCOUNT
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="reg-header">
                    <h2>Create Account</h2>
                    <div className="step-indicator">
                      <div className={`step-dot ${regStep >= 1 ? 'active' : ''}`} />
                      <div className="step-line">
                        <div className={`step-line-fill ${regStep >= 2 ? 'filled' : ''}`} />
                      </div>
                      <div className={`step-dot ${regStep >= 2 ? 'active' : ''}`} />
                    </div>
                    <span className="step-label">
                      {regStep === 1 ? 'PERSONAL DETAILS' : 'SECURITY & ADDRESS'}
                    </span>
                  </div>

                  {error && <div className="alert-message alert-error">{error}</div>}
                  {message && <div className="alert-message alert-success">{message}</div>}

                  <form
                    onSubmit={regStep === 1
                      ? (e) => { e.preventDefault(); nextStep(); }
                      : handleRegisterSubmit
                    }
                    noValidate
                  >
                    <div className={`step-content ${
                      formTransitioning
                        ? stepDirection === 'forward' ? 'step-exit-left' : 'step-exit-right'
                        : stepDirection === 'forward' ? 'step-enter-right' : 'step-enter-left'
                    }`}>

                      {regStep === 1 ? (
                        <div className="reg-fields">
                          <div className="input-row">
                            <div className="input-group half">
                              <input
                                type="text"
                                placeholder="FIRST NAME"
                                value={regData.firstName}
                                onChange={(e) => handleRegChange('firstName', e.target.value)}
                                className={`login-input ${fieldErrors.firstName ? 'input-error' : ''}`}
                                disabled={loading}
                                autoComplete="given-name"
                              />
                              {fieldErrors.firstName && (
                                <span className="field-error">{fieldErrors.firstName}</span>
                              )}
                            </div>
                            <div className="input-group half">
                              <input
                                type="text"
                                placeholder="LAST NAME"
                                value={regData.lastName}
                                onChange={(e) => handleRegChange('lastName', e.target.value)}
                                className={`login-input ${fieldErrors.lastName ? 'input-error' : ''}`}
                                disabled={loading}
                                autoComplete="family-name"
                              />
                              {fieldErrors.lastName && (
                                <span className="field-error">{fieldErrors.lastName}</span>
                              )}
                            </div>
                          </div>

                          <div className="input-group">
                            <input
                              type="email"
                              placeholder="EMAIL ADDRESS"
                              value={regData.email}
                              onChange={(e) => handleRegChange('email', e.target.value)}
                              className={`login-input ${fieldErrors.email ? 'input-error' : ''}`}
                              disabled={loading}
                              autoComplete="email"
                              inputMode="email"
                            />
                            {fieldErrors.email && (
                              <span className="field-error">{fieldErrors.email}</span>
                            )}
                          </div>

                          <div className="input-group">
                            <input
                              type="tel"
                              placeholder="PHONE NUMBER"
                              value={regData.phone}
                              onChange={(e) => handleRegChange('phone', e.target.value)}
                              className={`login-input ${fieldErrors.phone ? 'input-error' : ''}`}
                              disabled={loading}
                              autoComplete="tel"
                              inputMode="tel"
                            />
                            {fieldErrors.phone && (
                              <span className="field-error">{fieldErrors.phone}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="reg-fields">
                          <div className="input-group password-group">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="PASSWORD"
                              value={regData.password}
                              onChange={(e) => handleRegChange('password', e.target.value)}
                              className={`login-input ${fieldErrors.password ? 'input-error' : ''}`}
                              disabled={loading}
                              autoComplete="new-password"
                            />
                            <button type="button" className="toggle-pw"
                              onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                              {showPassword ? <EyeOff /> : <EyeOn />}
                            </button>
                            {fieldErrors.password && (
                              <span className="field-error">{fieldErrors.password}</span>
                            )}
                            {regData.password && (
                              <div className="password-strength">
                                <div className="strength-bars">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                      key={i}
                                      className={`strength-bar ${i <= strength.level ? 'active' : ''}`}
                                      style={{ backgroundColor: i <= strength.level ? strength.color : undefined }}
                                    />
                                  ))}
                                </div>
                                <span className="strength-label" style={{ color: strength.color }}>
                                  {strength.label}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="input-group password-group">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="CONFIRM PASSWORD"
                              value={regData.confirmPassword}
                              onChange={(e) => handleRegChange('confirmPassword', e.target.value)}
                              className={`login-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                              disabled={loading}
                              autoComplete="new-password"
                            />
                            <button type="button" className="toggle-pw"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                              {showConfirmPassword ? <EyeOff /> : <EyeOn />}
                            </button>
                            {fieldErrors.confirmPassword && (
                              <span className="field-error">{fieldErrors.confirmPassword}</span>
                            )}
                          </div>

                          <div className="address-divider"><span>SHIPPING ADDRESS</span></div>

                          <div className="input-group">
                            <input
                              type="text"
                              placeholder="STREET ADDRESS"
                              value={regData.address}
                              onChange={(e) => handleRegChange('address', e.target.value)}
                              className={`login-input ${fieldErrors.address ? 'input-error' : ''}`}
                              disabled={loading}
                              autoComplete="street-address"
                            />
                            {fieldErrors.address && (
                              <span className="field-error">{fieldErrors.address}</span>
                            )}
                          </div>

                          <div className="input-row">
                            <div className="input-group half">
                              <input
                                type="text"
                                placeholder="CITY"
                                value={regData.city}
                                onChange={(e) => handleRegChange('city', e.target.value)}
                                className={`login-input ${fieldErrors.city ? 'input-error' : ''}`}
                                disabled={loading}
                                autoComplete="address-level2"
                              />
                              {fieldErrors.city && (
                                <span className="field-error">{fieldErrors.city}</span>
                              )}
                            </div>
                            <div className="input-group half">
                              <input
                                type="text"
                                placeholder="STATE"
                                value={regData.state}
                                onChange={(e) => handleRegChange('state', e.target.value)}
                                className="login-input"
                                disabled={loading}
                                autoComplete="address-level1"
                              />
                            </div>
                          </div>

                          <div className="input-row">
                            <div className="input-group half">
                              <input
                                type="text"
                                placeholder="ZIP CODE"
                                value={regData.zipCode}
                                onChange={(e) => handleRegChange('zipCode', e.target.value)}
                                className={`login-input ${fieldErrors.zipCode ? 'input-error' : ''}`}
                                disabled={loading}
                                autoComplete="postal-code"
                                inputMode="numeric"
                              />
                              {fieldErrors.zipCode && (
                                <span className="field-error">{fieldErrors.zipCode}</span>
                              )}
                            </div>
                            <div className="input-group half">
                              <input
                                type="text"
                                placeholder="COUNTRY"
                                value={regData.country}
                                onChange={(e) => handleRegChange('country', e.target.value)}
                                className={`login-input ${fieldErrors.country ? 'input-error' : ''}`}
                                disabled={loading}
                                autoComplete="country-name"
                              />
                              {fieldErrors.country && (
                                <span className="field-error">{fieldErrors.country}</span>
                              )}
                            </div>
                          </div>

                          <label className="checkbox-group">
                            <input
                              type="checkbox"
                              checked={regData.agreeTerms}
                              onChange={(e) => handleRegChange('agreeTerms', e.target.checked)}
                              disabled={loading}
                            />
                            <span className="custom-checkbox">
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="currentColor"
                                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            <span className="checkbox-label">
                              I agree to the{' '}
                              <a href="#terms" className="terms-link">Terms & Conditions</a>
                              {' '}and{' '}
                              <a href="#privacy" className="terms-link">Privacy Policy</a>
                            </span>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="button-group">
                      {regStep === 1 ? (
                        <>
                          <button type="submit" className="login-btn" disabled={loading}>
                            CONTINUE
                          </button>
                          <button
                            type="button"
                            className="register-btn"
                            onClick={() => switchForm(false)}
                            disabled={loading}
                          >
                            BACK TO LOG IN
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                          </button>
                          <button
                            type="button"
                            className="register-btn"
                            onClick={prevStep}
                            disabled={loading}
                          >
                            ← BACK
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </>
              )}
            </div>

            <div className="help-section">
              <a href="#help" className="help-link">NEED HELP?</a>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="model-image">
            <img src={img09} alt="Fashion editorial" className="model-img"
              loading="eager" draggable="false" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;