// src/services/checkoutService.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const placeOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      // Customer
      customerName:  orderData.name,
      customerEmail: orderData.email,
      phone:         orderData.phone,
      userId:        orderData.userId || null,

      // Shipping
      address:  orderData.address,
      city:     orderData.city,
      state:    orderData.state,
      pincode:  orderData.pincode,
      country:  orderData.country || 'India',

      // Items (your cart array)
      items: orderData.cart.map(item => ({
        id:            item.id,
        name:          item.name,
        price:         item.price,
        quantity:      item.quantity,
        selectedSize:  item.selectedSize,
        selectedColor: item.selectedColor || null,
        image:         item.image || null,
      })),

      // Payment
      totalAmount:   orderData.total,
      paymentMethod: orderData.paymentMethod || 'COD',
      paymentStatus: 'pending',

      // Meta
      status:    'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, orderId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const getAllOrders = async () => {
  try {
    console.log('🟢 Fetching orders...');
    
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    console.log('🟢 Snapshot size:', snapshot.size);
    
    const orders = [];
    snapshot.forEach((doc) => {
      console.log('🟢 Order:', doc.id, doc.data());
      orders.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      });
    });
    
    console.log('🟢 Total orders:', orders.length);
    return { success: true, data: orders };
  } catch (error) {
    console.error('🔴 Error fetching orders:', error);
    return { success: false, error: error.message };
  }
};