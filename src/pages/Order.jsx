import { useState, useEffect } from 'react';
import './Order.css';

function Order() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = () => {
    const updatedOrders = orders.map(order => 
      order.id === selectedOrder.id 
        ? { ...order, status: 'cancelled' }
        : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setShowCancelModal(false);
    setSelectedOrder(null);
  };

  const closeModal = () => {
    setShowTrackingModal(false);
    setShowCancelModal(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'in-transit':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getTrackingSteps = (status) => {
    const steps = [
      { label: 'Order Placed', completed: true },
      { label: 'Confirmed', completed: status !== 'pending' },
      { label: 'Shipped', completed: status === 'in-transit' || status === 'delivered' },
      { label: 'Out for Delivery', completed: status === 'delivered' },
      { label: 'Delivered', completed: status === 'delivered' }
    ];
    return steps;
  };

  return (
    <div className="order-page">
      <div className="order-container">
        <h1 className="order-title">MY ORDERS</h1>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <p>No orders yet</p>
            <span>When you place orders, they will appear here</span>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-id">ORDER #{order.id}</span>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                    {order.status.toUpperCase().replace('-', ' ')}
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="order-item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="order-item-details">
                        <h4>{item.name}</h4>
                        <p>Size: {item.selectedSize}</p>
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <div className="order-item-price">
                        {item.price}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>TOTAL</span>
                    <span className="total-amount">₹ {order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="order-actions">
                    <button 
                      className="track-btn"
                      onClick={() => handleTrackOrder(order)}
                      disabled={order.status === 'cancelled'}
                    >
                      TRACK ORDER
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelOrder(order)}
                      disabled={order.status === 'cancelled' || order.status === 'delivered'}
                    >
                      CANCEL ORDER
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <>
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="modal tracking-modal">
            <div className="modal-header">
              <h2>TRACK ORDER</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div className="tracking-info">
                <span className="tracking-id">Order #{selectedOrder.id}</span>
                <span className="tracking-date">{selectedOrder.date}</span>
              </div>

              <div className="tracking-timeline">
                {getTrackingSteps(selectedOrder.status).map((step, index) => (
                  <div key={index} className={`tracking-step ${step.completed ? 'completed' : ''}`}>
                    <div className="step-indicator">
                      <div className="step-dot">
                        {step.completed && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      {index < getTrackingSteps(selectedOrder.status).length - 1 && (
                        <div className="step-line"></div>
                      )}
                    </div>
                    <div className="step-label">{step.label}</div>
                  </div>
                ))}
              </div>

              <div className="delivery-info">
                <h4>DELIVERY ADDRESS</h4>
                <p>{selectedOrder.address.fullName}</p>
                <p>{selectedOrder.address.addressLine}</p>
                <p>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</p>
                <p>{selectedOrder.address.phone}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedOrder && (
        <>
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="modal cancel-modal">
            <div className="modal-header">
              <h2>CANCEL ORDER</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div className="cancel-warning">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>Are you sure you want to cancel this order?</p>
                <span>Order #{selectedOrder.id}</span>
              </div>

              <div className="modal-actions">
                <button className="modal-btn-secondary" onClick={closeModal}>
                  KEEP ORDER
                </button>
                <button className="modal-btn-primary" onClick={confirmCancelOrder}>
                  YES, CANCEL
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Order;