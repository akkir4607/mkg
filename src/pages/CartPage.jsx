import { useState, useContext, useEffect } from 'react';
import { CartContext } from '../App';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sendOrderEmail } from '../services/orderService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './CartPage.css';

function CartPage() {
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);
  const { isLoggedIn, currentUser, userData } = useAuth();
  const navigate = useNavigate();

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [txnError, setTxnError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [qrCopied, setQrCopied] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  const UPI_ID = 'yourname@upi';

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [checkoutStep]);

  // Load user address from Firebase
  useEffect(() => {
    if (isLoggedIn && userData) {
      const accountAddress = {
        id: 'account-default',
        name: 'Home',
        fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone || '',
        addressLine: userData.address?.street || '',
        city: userData.address?.city || '',
        state: userData.address?.state || '',
        pincode: userData.address?.zipCode || '',
        country: userData.address?.country || '',
        isDefault: true,
        fromAccount: true,
      };
      setAddresses([accountAddress]);
      setSelectedAddressId('account-default');
    } else {
      setAddresses([]);
      setSelectedAddressId(null);
    }
  }, [isLoggedIn, userData]);

  const handleAddAddress = (e) => {
    e.preventDefault();
    const address = {
      id: `addr-${Date.now()}`,
      ...newAddress,
      isDefault: false,
      fromAccount: false,
    };
    setAddresses([...addresses, address]);
    setSelectedAddressId(address.id);
    setShowAddressForm(false);
    setNewAddress({
      name: '', fullName: '', phone: '',
      addressLine: '', city: '', state: '', pincode: '',
    });
  };

  const handleProceedToAddress = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (cart.length > 0) setCheckoutStep('address');
  };

  const handleProceedToPayment = () => {
    if (selectedAddressId) setCheckoutStep('payment');
  };

  const buildOrder = (paymentDetails = null) => {
    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
    const paymentLabel = selectedPayment === 'cod' ? 'Cash on Delivery' : 'UPI (QR Code)';
    return {
      id: `LW${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
      }),
      userId: currentUser?.uid || null,
      userEmail: currentUser?.email || null,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
      })),
      total: getCartTotal(),
      status: selectedPayment === 'cod' ? 'pending' : 'pending_verification',
      paymentMethod: paymentLabel,
      paymentDetails,
      address: selectedAddress,
    };
  };

  const saveOrderToStorage = (order) => {
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([order, ...existingOrders]));
  };

  const handlePlaceOrder = async () => {
    setPaymentError('');
    setTxnError('');
    if (!selectedPayment) return;

    if (selectedPayment === 'upi_qr') {
      if (!transactionId.trim()) {
        setTxnError('Please enter your UPI Transaction ID');
        return;
      }
      if (transactionId.trim().length < 6) {
        setTxnError('Transaction ID seems too short — please check');
        return;
      }
    }

    setProcessing(true);
    try {
      const order = buildOrder(
        selectedPayment === 'upi_qr'
          ? {
              transactionId: transactionId.trim().toUpperCase(),
              status: 'pending_verification',
              paymentMode: 'UPI QR',
            }
          : null
      );

      saveOrderToStorage(order);

      try {
        await sendOrderEmail(order);
      } catch (emailErr) {
        console.warn('Email failed (order still placed):', emailErr);
      }

      setConfirmedOrderId(order.id);
      setProcessing(false);
      setCheckoutStep('confirmation');

      setTimeout(() => {
        cart.forEach((item) => removeFromCart(item.id, item.selectedSize));
      }, 500);
    } catch (error) {
      console.error('❌ Order error:', error);
      setPaymentError('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  // ─── Step Indicator ─────────────────────────────────────
  const renderStepIndicator = () => (
    <div className="cp-steps-bar">
      <div className={`cp-step ${checkoutStep === 'cart' ? 'active' : ['address','payment','confirmation'].includes(checkoutStep) ? 'done' : ''}`}>
        <div className="cp-step-circle">
          {['address','payment','confirmation'].includes(checkoutStep) ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : '1'}
        </div>
        <span>BAG</span>
      </div>
      <div className="cp-step-line" />
      <div className={`cp-step ${checkoutStep === 'address' ? 'active' : ['payment','confirmation'].includes(checkoutStep) ? 'done' : ''}`}>
        <div className="cp-step-circle">
          {['payment','confirmation'].includes(checkoutStep) ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : '2'}
        </div>
        <span>ADDRESS</span>
      </div>
      <div className="cp-step-line" />
      <div className={`cp-step ${checkoutStep === 'payment' ? 'active' : checkoutStep === 'confirmation' ? 'done' : ''}`}>
        <div className="cp-step-circle">
          {checkoutStep === 'confirmation' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : '3'}
        </div>
        <span>PAYMENT</span>
      </div>
      <div className="cp-step-line" />
      <div className={`cp-step ${checkoutStep === 'confirmation' ? 'active done' : ''}`}>
        <div className="cp-step-circle">4</div>
        <span>CONFIRM</span>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // CART VIEW
  // ═══════════════════════════════════════════════════════
  const renderCartView = () => (
    <div className="cp-layout">
      {/* Left: Items */}
      <div className="cp-main">
        <h2 className="cp-section-title">YOUR BAG <span>({cart.length} {cart.length === 1 ? 'item' : 'items'})</span></h2>

        {cart.length === 0 ? (
          <div className="cp-empty">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h3>Your shopping bag is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <button className="cp-btn-primary" onClick={() => navigate('/women')}>
              SHOP NOW
            </button>
          </div>
        ) : (
          <div className="cp-items-list">
            {cart.map((item, index) => (
              <div
                key={`${item.id}-${item.selectedSize}`}
                className="cp-item"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="cp-item-image" onClick={() => navigate(`/product/${item.id}`)}>
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cp-item-body">
                  <div className="cp-item-top">
                    <div>
                      <h3 className="cp-item-name" onClick={() => navigate(`/product/${item.id}`)}>
                        {item.name}
                      </h3>
                      <p className="cp-item-size">SIZE: {item.selectedSize}</p>
                      <p className="cp-item-price">{item.price}</p>
                    </div>
                    <button className="cp-remove-btn" onClick={() => removeFromCart(item.id, item.selectedSize)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="cp-item-bottom">
                    <div className="cp-qty-controls">
                      <button className="cp-qty-btn" onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}>−</button>
                      <span className="cp-qty-val">{item.quantity}</span>
                      <button className="cp-qty-btn" onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}>+</button>
                    </div>
                    <span className="cp-item-subtotal">
                      ₹ {(parseFloat(item.price.replace('₹', '').replace(/,/g, '')) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Summary */}
      {cart.length > 0 && (
        <div className="cp-sidebar">
          <div className="cp-summary-card">
            <h3 className="cp-summary-title">ORDER SUMMARY</h3>
            <div className="cp-summary-row">
              <span>Subtotal ({cart.reduce((t, i) => t + i.quantity, 0)} items)</span>
              <span>₹ {getCartTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="cp-summary-row">
              <span>Delivery</span>
              <span className="cp-free-tag">FREE</span>
            </div>
            <div className="cp-summary-divider" />
            <div className="cp-summary-row cp-summary-total">
              <span>TOTAL</span>
              <span>₹ {getCartTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <button className="cp-btn-primary cp-proceed-btn" onClick={handleProceedToAddress}>
              {isLoggedIn ? 'PROCEED TO CHECKOUT' : 'LOGIN TO CHECKOUT'}
            </button>
            <button className="cp-btn-ghost" onClick={() => navigate('/women')}>
              CONTINUE SHOPPING
            </button>
          </div>

          {/* Trust badges */}
          <div className="cp-trust-badges">
            {[
              { icon: '🔒', text: 'Secure Checkout' },
              { icon: '🚚', text: 'Free Delivery' },
              { icon: '↩️', text: 'Easy Returns' },
            ].map((badge) => (
              <div key={badge.text} className="cp-badge">
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // ADDRESS VIEW
  // ═══════════════════════════════════════════════════════
  const renderAddressView = () => (
    <div className="cp-layout">
      <div className="cp-main">
        <div className="cp-back-row">
          <button className="cp-back-btn" onClick={() => setCheckoutStep('cart')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            BACK TO BAG
          </button>
        </div>

        <h2 className="cp-section-title">DELIVERY ADDRESS</h2>

        {userData && (
          <div className="cp-account-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Signed in as <strong>{userData.firstName}</strong>
          </div>
        )}

        <div className="cp-address-list">
          {addresses.map((address, i) => (
            <div
              key={address.id}
              className={`cp-address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
              onClick={() => setSelectedAddressId(address.id)}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="cp-radio">
                <div className={`cp-radio-circle ${selectedAddressId === address.id ? 'checked' : ''}`}>
                  {selectedAddressId === address.id && <div className="cp-radio-dot" />}
                </div>
              </div>
              <div className="cp-address-info">
                <div className="cp-address-tag">
                  {address.name}
                  {address.fromAccount && <span className="cp-from-account-tag">FROM ACCOUNT</span>}
                </div>
                <p className="cp-address-name">{address.fullName}</p>
                <p className="cp-address-line">{address.addressLine}</p>
                <p className="cp-address-line">
                  {address.city}{address.state && `, ${address.state}`}{address.pincode && ` - ${address.pincode}`}
                </p>
                {address.country && address.fromAccount && (
                  <p className="cp-address-line">{address.country}</p>
                )}
                {address.phone && <p className="cp-address-phone">{address.phone}</p>}
              </div>
            </div>
          ))}
        </div>

        {!showAddressForm ? (
          <button className="cp-add-address-btn" onClick={() => setShowAddressForm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            USE A DIFFERENT ADDRESS
          </button>
        ) : (
          <form className="cp-address-form" onSubmit={handleAddAddress}>
            <h4 className="cp-form-title">NEW DELIVERY ADDRESS</h4>
            <div className="cp-form-grid">
              <div className="cp-form-field cp-col-full">
                <label>Address Label</label>
                <input type="text" placeholder="e.g., Office, Other" value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })} required />
              </div>
              <div className="cp-form-field cp-col-full">
                <label>Full Name</label>
                <input type="text" placeholder="Recipient's full name" value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} required />
              </div>
              <div className="cp-form-field cp-col-full">
                <label>Phone Number</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} required />
              </div>
              <div className="cp-form-field cp-col-full">
                <label>Address</label>
                <input type="text" placeholder="House No., Street, Area" value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })} required />
              </div>
              <div className="cp-form-field">
                <label>City</label>
                <input type="text" placeholder="City" value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required />
              </div>
              <div className="cp-form-field">
                <label>State</label>
                <input type="text" placeholder="State" value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} required />
              </div>
              <div className="cp-form-field">
                <label>Pincode</label>
                <input type="text" placeholder="6-digit pincode" value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
              </div>
            </div>
            <div className="cp-form-actions">
              <button type="button" className="cp-btn-ghost" onClick={() => setShowAddressForm(false)}>CANCEL</button>
              <button type="submit" className="cp-btn-primary">SAVE ADDRESS</button>
            </div>
          </form>
        )}
      </div>

      {/* Right Summary */}
      <div className="cp-sidebar">
        <div className="cp-summary-card">
          <h3 className="cp-summary-title">ORDER SUMMARY</h3>
          {cart.slice(0, 3).map((item) => (
            <div key={`${item.id}-${item.selectedSize}`} className="cp-mini-item">
              <img src={item.image} alt={item.name} className="cp-mini-img" />
              <div className="cp-mini-info">
                <p className="cp-mini-name">{item.name}</p>
                <p className="cp-mini-meta">Size: {item.selectedSize} · Qty: {item.quantity}</p>
              </div>
              <span className="cp-mini-price">{item.price}</span>
            </div>
          ))}
          {cart.length > 3 && (
            <p className="cp-mini-more">+{cart.length - 3} more item{cart.length - 3 > 1 ? 's' : ''}</p>
          )}
          <div className="cp-summary-divider" />
          <div className="cp-summary-row cp-summary-total">
            <span>TOTAL</span>
            <span>₹ {getCartTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <button
            className="cp-btn-primary cp-proceed-btn"
            onClick={handleProceedToPayment}
            disabled={!selectedAddressId}
          >
            CONTINUE TO PAYMENT
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // PAYMENT VIEW
  // ═══════════════════════════════════════════════════════
  const renderPaymentView = () => {
    const total = getCartTotal();
    return (
      <div className="cp-layout">
        <div className="cp-main">
          <div className="cp-back-row">
            <button className="cp-back-btn" onClick={() => setCheckoutStep('address')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              BACK TO ADDRESS
            </button>
          </div>

          <h2 className="cp-section-title">PAYMENT METHOD</h2>

          {/* Amount strip */}
          <div className="cp-amount-strip">
            <span className="cp-amount-label">ORDER TOTAL</span>
            <span className="cp-amount-value">₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="cp-payment-options">
            {/* UPI QR */}
            <div
              className={`cp-payment-card ${selectedPayment === 'upi_qr' ? 'selected' : ''}`}
              onClick={() => { setSelectedPayment('upi_qr'); setPaymentError(''); setTxnError(''); }}
            >
              <div className="cp-radio">
                <div className={`cp-radio-circle ${selectedPayment === 'upi_qr' ? 'checked' : ''}`}>
                  {selectedPayment === 'upi_qr' && <div className="cp-radio-dot" />}
                </div>
              </div>
              <div className="cp-payment-info">
                <div className="cp-payment-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h2v2h-2zM18 14h3M14 18h3M18 18v3" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h4>UPI / QR CODE <span className="cp-recommended">RECOMMENDED</span></h4>
                  <p>Scan QR with any UPI app — GPay, PhonePe, Paytm</p>
                </div>
              </div>
            </div>

            {/* UPI Expanded Panel */}
            {selectedPayment === 'upi_qr' && (
              <div className="cp-upi-panel">
                <div className="cp-qr-wrap">
                  <img src="/qr-code.png" alt="Scan to pay" className="cp-qr-img" />
                  <p className="cp-qr-hint">Scan with GPay, PhonePe, Paytm or any UPI app</p>
                </div>

                <div className="cp-qr-amount">
                  Pay exactly <strong>₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>

                <div className="cp-upi-id-row">
                  <span className="cp-upi-label">UPI ID</span>
                  <div className="cp-upi-copy">
                    <span className="cp-upi-value">{UPI_ID}</span>
                    <button className="cp-copy-btn" onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await navigator.clipboard.writeText(UPI_ID);
                        setQrCopied(true);
                        setTimeout(() => setQrCopied(false), 2000);
                      } catch { /* blocked */ }
                    }}>
                      {qrCopied ? '✓ COPIED' : 'COPY'}
                    </button>
                  </div>
                </div>

                <ol className="cp-upi-steps">
                  <li>Open any UPI app on your phone</li>
                  <li>Scan the QR code above</li>
                  <li>Enter amount: <strong>₹ {total.toLocaleString('en-IN')}</strong></li>
                  <li>Complete the payment</li>
                  <li>Copy the <strong>Transaction ID</strong> from your app</li>
                  <li>Paste it below and place your order</li>
                </ol>

                <div className="cp-txn-wrap">
                  <label className="cp-txn-label">TRANSACTION ID (UTR NUMBER)</label>
                  <input
                    type="text"
                    className={`cp-txn-input ${txnError ? 'error' : ''}`}
                    placeholder="e.g. 428219376541"
                    value={transactionId}
                    onChange={(e) => { setTransactionId(e.target.value); if (txnError) setTxnError(''); }}
                    maxLength={30}
                  />
                  {txnError && <p className="cp-txn-error">⚠ {txnError}</p>}
                  <p className="cp-txn-help">Find this in your UPI app under payment history</p>
                </div>
              </div>
            )}

            {/* Cash on Delivery */}
            <div
              className={`cp-payment-card ${selectedPayment === 'cod' ? 'selected' : ''}`}
              onClick={() => { setSelectedPayment('cod'); setPaymentError(''); setTxnError(''); }}
            >
              <div className="cp-radio">
                <div className={`cp-radio-circle ${selectedPayment === 'cod' ? 'checked' : ''}`}>
                  {selectedPayment === 'cod' && <div className="cp-radio-dot" />}
                </div>
              </div>
              <div className="cp-payment-info">
                <div className="cp-payment-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="6" width="20" height="13" rx="2" />
                    <circle cx="12" cy="12.5" r="2.5" />
                    <path d="M6 12.5h.01M18 12.5h.01" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h4>CASH ON DELIVERY</h4>
                  <p>Pay when your order arrives at your door</p>
                </div>
              </div>
            </div>
          </div>

          {paymentError && <div className="cp-payment-error">⚠ {paymentError}</div>}
        </div>

        {/* Right: Summary */}
        <div className="cp-sidebar">
          <div className="cp-summary-card">
            <h3 className="cp-summary-title">ORDER SUMMARY</h3>
            {cart.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="cp-mini-item">
                <img src={item.image} alt={item.name} className="cp-mini-img" />
                <div className="cp-mini-info">
                  <p className="cp-mini-name">{item.name}</p>
                  <p className="cp-mini-meta">Size: {item.selectedSize} · Qty: {item.quantity}</p>
                </div>
                <span className="cp-mini-price">{item.price}</span>
              </div>
            ))}
            <div className="cp-summary-divider" />
            <div className="cp-summary-row">
              <span>Subtotal</span>
              <span>₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="cp-summary-row">
              <span>Delivery</span>
              <span className="cp-free-tag">FREE</span>
            </div>
            <div className="cp-summary-divider" />
            <div className="cp-summary-row cp-summary-total">
              <span>TOTAL</span>
              <span>₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Selected address preview */}
            {selectedAddressId && (() => {
              const addr = addresses.find(a => a.id === selectedAddressId);
              return addr ? (
                <div className="cp-addr-preview">
                  <p className="cp-addr-preview-label">DELIVERING TO</p>
                  <p className="cp-addr-preview-name">{addr.fullName}</p>
                  <p className="cp-addr-preview-line">{addr.addressLine}, {addr.city}</p>
                </div>
              ) : null;
            })()}

            <button
              className="cp-btn-primary cp-proceed-btn"
              onClick={handlePlaceOrder}
              disabled={
                !selectedPayment || processing ||
                (selectedPayment === 'upi_qr' && !transactionId.trim())
              }
            >
              {processing ? (
                <span className="cp-loading">
                  <span /><span /><span />
                </span>
              ) : selectedPayment === 'cod'
                ? 'PLACE ORDER'
                : selectedPayment === 'upi_qr'
                ? `CONFIRM PAYMENT — ₹ ${total.toLocaleString('en-IN')}`
                : 'SELECT PAYMENT METHOD'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // CONFIRMATION VIEW
  // ═══════════════════════════════════════════════════════
  const renderConfirmationView = () => (
    <div className="cp-confirmation">
      <div className="cp-success-ring">
        <svg className="cp-checkmark" viewBox="0 0 52 52">
          <circle className="cp-check-circle" cx="26" cy="26" r="25" fill="none" />
          <path className="cp-check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>

      <h1 className="cp-confirm-title">ORDER PLACED!</h1>
      <p className="cp-confirm-sub">Thank you for shopping with us.</p>

      {selectedPayment === 'upi_qr' && (
        <div className="cp-pending-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          We'll verify your UPI payment and confirm shortly.
        </div>
      )}

      <div className="cp-order-id-badge">
        ORDER ID: #{confirmedOrderId}
      </div>

      <p className="cp-confirm-email">A confirmation has been sent to your email.</p>

      <div className="cp-confirm-actions">
        <button className="cp-btn-primary" onClick={() => navigate('/order')}>
          VIEW MY ORDERS
        </button>
        <button className="cp-btn-ghost" onClick={() => navigate('/')}>
          BACK TO HOME
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // LOGIN REQUIRED
  // ═══════════════════════════════════════════════════════
  const renderLoginRequired = () => (
    <div className="cp-login-required">
      <div className="cp-lock-icon">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h3>Sign in to continue</h3>
      <p>Please sign in to complete your purchase. Your cart items will be saved.</p>
      <button className="cp-btn-primary" onClick={() => navigate('/login')}>
        SIGN IN TO CONTINUE
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <>
      <Navbar />
      <div className="cart-page">
        {/* Page Header */}
        <div className="cp-page-header">
          <h1 className="cp-page-title">
            {checkoutStep === 'cart' && 'SHOPPING BAG'}
            {checkoutStep === 'address' && 'CHECKOUT'}
            {checkoutStep === 'payment' && 'CHECKOUT'}
            {checkoutStep === 'confirmation' && 'ORDER CONFIRMED'}
          </h1>
          {checkoutStep !== 'confirmation' && renderStepIndicator()}
        </div>

        <div className="cp-container">
          {checkoutStep === 'cart' && renderCartView()}
          {checkoutStep === 'address' && !isLoggedIn && renderLoginRequired()}
          {checkoutStep === 'address' && isLoggedIn && renderAddressView()}
          {checkoutStep === 'payment' && renderPaymentView()}
          {checkoutStep === 'confirmation' && renderConfirmationView()}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CartPage;