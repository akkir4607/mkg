import emailjs from '@emailjs/browser';

export const sendOrderEmail = async (order) => {
  try {
    const itemsHTML = order.items
      .map(
        (item) => `
        <div class="item">
          <img src="${item.image}" alt="${item.name}" class="item-img" />
          <div class="item-details">
            <p class="item-name">${item.name}</p>
            <p class="item-meta">Size: ${item.selectedSize}</p>
            <p class="item-meta">Qty: ${item.quantity}</p>
            <p class="item-price">${item.price}</p>
          </div>
        </div>
      `
      )
      .join('');

    const templateParams = {
      to_email: order.userEmail || '',
      to_name:
        order.address?.fullName?.split(' ')[0] || 'Customer',
      order_id: order.id,
      order_date: order.date,
      payment_method:
        order.paymentMethod +
        (order.paymentDetails?.transactionId
          ? ` · TXN: ${order.paymentDetails.transactionId}`
          : ''),
      items_html: itemsHTML,
      subtotal: order.total.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
      }),
      total: order.total.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
      }),
      customer_name: order.address?.fullName || '',
      address_line: order.address?.addressLine || '',
      city: order.address?.city || '',
      state: order.address?.state || '',
      pincode: order.address?.pincode || '',
      phone: order.address?.phone || '',
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Order email sent to', templateParams.to_email);
    return { success: true };
  } catch (error) {
    console.error('❌ Order email error:', error);
    return { success: false, error };
  }
};