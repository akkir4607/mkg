import { useState, useContext, useEffect } from 'react';
import { CartContext } from '../App';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sendOrderEmail } from '../services/orderService';
import './ShoppingBag.css';

function ShoppingBag({ isOpen, onClose }) {
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

  // Confirmed order ID (for confirmation screen)
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  // ─── Load user address from Firebase ────────────────────
  useEffect(() => {
    if (isLoggedIn && userData) {
      const accountAddress = {
        id: 'account-default',
        name: 'Home',
        fullName:
          userData.fullName || `${userData.firstName} ${userData.lastName}`,
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

  // ─── Handlers ───────────────────────────────────────────
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
      name: '',
      fullName: '',
      phone: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
    });
  };

  const handleProceedToAddress = () => {
    if (!isLoggedIn) {
      onClose();
      navigate('/login');
      return;
    }
    if (cart.length > 0) {
      setCheckoutStep('address');
    }
  };

  const handleProceedToPayment = () => {
    if (selectedAddressId) {
      setCheckoutStep('payment');
    }
  };

  // ─── Build Order Object ──────────────────────────────────
  const buildOrder = (paymentDetails = null) => {
    const selectedAddress = addresses.find(
      (addr) => addr.id === selectedAddressId
    );

    const paymentLabel =
      selectedPayment === 'cod'
        ? 'Cash on Delivery'
        : 'UPI (QR Code)';

    return {
      id: `LW${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
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
      status:
        selectedPayment === 'cod' ? 'pending' : 'pending_verification',
      paymentMethod: paymentLabel,
      paymentDetails,
      address: selectedAddress,
    };
  };

  // ─── Save Order to localStorage ──────────────────────────
  const saveOrderToStorage = (order) => {
    const existingOrders = JSON.parse(
      localStorage.getItem('orders') || '[]'
    );
    const updatedOrders = [order, ...existingOrders];
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  // ─── Place Order Handler ─────────────────────────────────
  const handlePlaceOrder = async () => {
    setPaymentError('');
    setTxnError('');

    if (!selectedPayment) return;

    // Validate transaction ID for UPI
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

      // Send confirmation email (non-blocking — won't break order if fails)
      try {
        await sendOrderEmail(order);
      } catch (emailErr) {
        console.warn('Email failed (order still placed):', emailErr);
      }

      setConfirmedOrderId(order.id);
      setProcessing(false);
      setCheckoutStep('confirmation');

      // Auto-close after 3.5s
      setTimeout(() => {
        cart.forEach((item) => removeFromCart(item.id, item.selectedSize));
        setCheckoutStep('cart');
        setSelectedPayment('');
        setTransactionId('');
        setTxnError('');
        setConfirmedOrderId('');
        onClose();
      }, 3500);
    } catch (error) {
      console.error('❌ Order error:', error);
      setPaymentError('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setCheckoutStep('cart');
    setSelectedPayment('');
    setTransactionId('');
    setTxnError('');
    setPaymentError('');
    onClose();
  };

  const handleLoginRedirect = () => {
    onClose();
    navigate('/login');
  };

  // ─── YOUR UPI ID ─────────────────────────────────────────
  const UPI_ID = 'yourname@upi'; // 🔁 Replace with your actual UPI ID

  // ═══════════════════════════════════════════════════════
  // CART VIEW
  // ═══════════════════════════════════════════════════════
  const renderCartView = () => (
    <>
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Your shopping bag is empty</p>
          </div>
        ) : (
          cart.map((item, index) => (
            <div
              key={`${item.id}-${item.selectedSize}`}
              className="cart-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="cart-item-image">
                <img src={item.image} alt={item.name} />
              </div>

              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-item-size">Size: {item.selectedSize}</p>
                <p className="cart-item-price">{item.price}</p>

                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.selectedSize,
                        item.quantity - 1
                      )
                    }
                    className="qty-btn"
                  >
                    −
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.selectedSize,
                        item.quantity + 1
                      )
                    }
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="remove-item"
                onClick={() => removeFromCart(item.id, item.selectedSize)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="cart-total">
            <span>SUBTOTAL</span>
            <span className="total-price">
              ₹{' '}
              {getCartTotal().toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <button className="checkout-btn" onClick={handleProceedToAddress}>
            {isLoggedIn ? 'PROCEED TO CHECKOUT' : 'LOGIN TO CHECKOUT'}
          </button>
        </div>
      )}
    </>
  );

  // ═══════════════════════════════════════════════════════
  // ADDRESS VIEW
  // ═══════════════════════════════════════════════════════
  const renderAddressView = () => (
    <>
      <div className="checkout-content">
        <div className="checkout-header-nav">
          <button
            className="back-btn"
            onClick={() => setCheckoutStep('cart')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            BACK
          </button>
          <div className="checkout-steps">
            <span className="step active">1. ADDRESS</span>
            <span className="step">2. PAYMENT</span>
          </div>
        </div>

        <div className="address-section">
          <h3>DELIVERY ADDRESS</h3>

          {userData && (
            <div className="account-badge">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>
                Signed in as <strong>{userData.firstName}</strong>
              </span>
            </div>
          )}

          <div className="address-list">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`address-card ${
                  selectedAddressId === address.id ? 'selected' : ''
                }`}
                onClick={() => setSelectedAddressId(address.id)}
              >
                <div className="address-radio">
                  <div
                    className={`radio-circle ${
                      selectedAddressId === address.id ? 'checked' : ''
                    }`}
                  >
                    {selectedAddressId === address.id && (
                      <div className="radio-dot"></div>
                    )}
                  </div>
                </div>
                <div className="address-info">
                  <div className="address-name-tag">
                    {address.name}
                    {address.fromAccount && (
                      <span className="default-tag">FROM ACCOUNT</span>
                    )}
                  </div>
                  <p className="address-full-name">{address.fullName}</p>
                  <p className="address-details">{address.addressLine}</p>
                  <p className="address-details">
                    {address.city}
                    {address.state && `, ${address.state}`}
                    {address.pincode && ` - ${address.pincode}`}
                  </p>
                  {address.country && address.fromAccount && (
                    <p className="address-details">{address.country}</p>
                  )}
                  {address.phone && (
                    <p className="address-phone">{address.phone}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!showAddressForm ? (
            <button
              className="add-address-btn"
              onClick={() => setShowAddressForm(true)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              USE A DIFFERENT ADDRESS
            </button>
          ) : (
            <form className="address-form" onSubmit={handleAddAddress}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Address Label (e.g., Office, Other)"
                  value={newAddress.name}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAddress.fullName}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      fullName: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newAddress.phone}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Address Line (House No., Street)"
                  value={newAddress.addressLine}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      addressLine: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-row-split">
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      pincode: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddressForm(false)}
                >
                  CANCEL
                </button>
                <button type="submit" className="save-btn">
                  SAVE ADDRESS
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="cart-footer">
        <div className="cart-total">
          <span>TOTAL</span>
          <span className="total-price">
            ₹{' '}
            {getCartTotal().toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <button
          className="checkout-btn"
          onClick={handleProceedToPayment}
          disabled={!selectedAddressId}
        >
          CONTINUE TO PAYMENT
        </button>
      </div>
    </>
  );

  // ═══════════════════════════════════════════════════════
  // PAYMENT VIEW
  // ═══════════════════════════════════════════════════════
  const renderPaymentView = () => {
    const total = getCartTotal();

    return (
      <>
        <div className="checkout-content">
          <div className="checkout-header-nav">
            <button
              className="back-btn"
              onClick={() => setCheckoutStep('address')}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              BACK
            </button>
            <div className="checkout-steps">
              <span className="step completed">1. ADDRESS</span>
              <span className="step active">2. PAYMENT</span>
            </div>
          </div>

          <div className="payment-section">
            <h3>PAYMENT METHOD</h3>

            {/* ── Amount Strip ─────────────────────── */}
            <div className="payment-amount-strip">
              <span className="payment-amount-label">ORDER TOTAL</span>
              <span className="payment-amount-value">
                ₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="payment-options">

              {/* ══ Option 1: UPI QR ══════════════════ */}
              <div
                className={`payment-card ${
                  selectedPayment === 'upi_qr' ? 'selected' : ''
                }`}
                onClick={() => {
                  setSelectedPayment('upi_qr');
                  setPaymentError('');
                  setTxnError('');
                }}
              >
                <div className="payment-radio">
                  <div
                    className={`radio-circle ${
                      selectedPayment === 'upi_qr' ? 'checked' : ''
                    }`}
                  >
                    {selectedPayment === 'upi_qr' && (
                      <div className="radio-dot" />
                    )}
                  </div>
                </div>
                <div className="payment-info">
                  <div className="payment-icon">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <path
                        d="M14 14h2v2h-2zM18 14h3M14 18h3M18 18v3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4>
                      UPI / QR CODE
                      <span className="recommended-tag">RECOMMENDED</span>
                    </h4>
                    <p>Scan QR with any UPI app</p>
                  </div>
                </div>
              </div>

              {/* ── UPI QR Expanded Panel ─────────────── */}
              {selectedPayment === 'upi_qr' && (
                <div className="upi-qr-panel">

                  {/* QR Image */}
                  <div className="qr-image-wrap">
                    <img
                      src="/qr-code.png"
                      alt="Scan to pay AYRA"
                      className="qr-image"
                    />
                    <p className="qr-scan-hint">
                      Scan with GPay, PhonePe, Paytm or any UPI app
                    </p>
                  </div>

                  {/* Amount Badge */}
                  <div className="qr-amount-badge">
                    Pay exactly&nbsp;
                    <strong>
                      ₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  {/* UPI ID Copy Row */}
                  <div className="upi-id-row">
                    <span className="upi-id-label">UPI ID</span>
                    <div className="upi-id-copy-wrap">
                      <span className="upi-id-value">{UPI_ID}</span>
                      <button
                        className="copy-btn"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await navigator.clipboard.writeText(UPI_ID);
                            setQrCopied(true);
                            setTimeout(() => setQrCopied(false), 2000);
                          } catch {
                            /* clipboard blocked */
                          }
                        }}
                      >
                        {qrCopied ? '✓ COPIED' : 'COPY'}
                      </button>
                    </div>
                  </div>

                  {/* Steps */}
                  <ol className="upi-steps">
                    <li>Open any UPI app on your phone</li>
                    <li>Scan the QR code above</li>
                    <li>
                      Enter amount:{' '}
                      <strong>
                        ₹ {total.toLocaleString('en-IN')}
                      </strong>
                    </li>
                    <li>Complete the payment</li>
                    <li>
                      Copy the <strong>Transaction ID</strong> from your
                      app
                    </li>
                    <li>Paste it below and place your order</li>
                  </ol>

                  {/* Transaction ID Input */}
                  <div className="txn-input-wrap">
                    <label className="txn-label">
                      TRANSACTION ID (UTR NUMBER)
                    </label>
                    <input
                      type="text"
                      className={`txn-input ${
                        txnError ? 'txn-input-error' : ''
                      }`}
                      placeholder="e.g. 428219376541"
                      value={transactionId}
                      onChange={(e) => {
                        setTransactionId(e.target.value);
                        if (txnError) setTxnError('');
                      }}
                      maxLength={30}
                    />
                    {txnError && (
                      <p className="txn-error-msg">⚠ {txnError}</p>
                    )}
                    <p className="txn-help">
                      Find this in your UPI app under payment history
                    </p>
                  </div>
                </div>
              )}

              {/* ══ Option 2: Cash on Delivery ════════ */}
              <div
                className={`payment-card ${
                  selectedPayment === 'cod' ? 'selected' : ''
                }`}
                onClick={() => {
                  setSelectedPayment('cod');
                  setPaymentError('');
                  setTxnError('');
                }}
              >
                <div className="payment-radio">
                  <div
                    className={`radio-circle ${
                      selectedPayment === 'cod' ? 'checked' : ''
                    }`}
                  >
                    {selectedPayment === 'cod' && (
                      <div className="radio-dot" />
                    )}
                  </div>
                </div>
                <div className="payment-info">
                  <div className="payment-icon">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="6" width="20" height="13" rx="2" />
                      <circle cx="12" cy="12.5" r="2.5" />
                      <path
                        d="M6 12.5h.01M18 12.5h.01"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4>CASH ON DELIVERY</h4>
                    <p>Pay when your order arrives</p>
                  </div>
                </div>
              </div>

            </div>{/* end payment-options */}

            {/* Order Summary */}
            <div className="order-summary">
              <h4>ORDER SUMMARY</h4>
              <div className="summary-row">
                <span>Subtotal ({cart.length} items)</span>
                <span>
                  ₹{' '}
                  {total.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="summary-row">
                <span>Delivery Charges</span>
                <span className="free-text">FREE</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>
                  ₹{' '}
                  {total.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Global error */}
            {paymentError && (
              <div className="payment-error">⚠ {paymentError}</div>
            )}
          </div>
        </div>

        {/* ── Footer Button ─────────────────────────── */}
        <div className="cart-footer">
          <button
            className="checkout-btn"
            onClick={handlePlaceOrder}
            disabled={
              !selectedPayment ||
              processing ||
              (selectedPayment === 'upi_qr' && !transactionId.trim())
            }
          >
            {processing ? (
              <span className="btn-loading">
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </span>
            ) : selectedPayment === 'cod' ? (
              'PLACE ORDER'
            ) : selectedPayment === 'upi_qr' ? (
              `CONFIRM PAYMENT — ₹ ${total.toLocaleString('en-IN')}`
            ) : (
              'SELECT PAYMENT METHOD'
            )}
          </button>
        </div>
      </>
    );
  };

  // ═══════════════════════════════════════════════════════
  // CONFIRMATION VIEW
  // ═══════════════════════════════════════════════════════
  const renderConfirmationView = () => (
    <div className="confirmation-content">
      <div className="success-animation">
        <svg className="checkmark" viewBox="0 0 52 52">
          <circle
            className="checkmark-circle"
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />
          <path
            className="checkmark-check"
            fill="none"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>
      </div>
      <h2>ORDER PLACED!</h2>
      <p>Thank you for your purchase.</p>

      {/* Show pending note for UPI */}
      {selectedPayment === 'upi_qr' && (
        <p className="order-pending-note">
          We'll verify your payment and confirm shortly.
        </p>
      )}

      <p className="order-id">Order ID: #{confirmedOrderId}</p>

      <p className="order-email-note">
        A confirmation email has been sent to your inbox.
      </p>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // LOGIN REQUIRED VIEW
  // ═══════════════════════════════════════════════════════
  const renderLoginRequiredView = () => (
    <div className="login-required-view">
      <div className="login-required-icon">
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h3>Sign in to continue</h3>
      <p>
        Please sign in to complete your purchase. Your cart items will be
        saved.
      </p>
      <button className="checkout-btn" onClick={handleLoginRedirect}>
        SIGN IN TO CONTINUE
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'active' : ''}`}
        onClick={handleClose}
      />

      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>
            {checkoutStep === 'cart' && 'SHOPPING BAG'}
            {checkoutStep === 'address' && 'CHECKOUT'}
            {checkoutStep === 'payment' && 'CHECKOUT'}
            {checkoutStep === 'confirmation' && 'SUCCESS'}
          </h2>
          <button className="cart-close" onClick={handleClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {checkoutStep === 'cart' && renderCartView()}
        {checkoutStep === 'address' &&
          !isLoggedIn &&
          renderLoginRequiredView()}
        {checkoutStep === 'address' &&
          isLoggedIn &&
          renderAddressView()}
        {checkoutStep === 'payment' && renderPaymentView()}
        {checkoutStep === 'confirmation' && renderConfirmationView()}
      </div>
    </>
  );
}

export default ShoppingBag;