import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import emailjs from "@emailjs/browser";

/* ===========================
   ORDERS
=========================== */

// Get all orders
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const orders = [];

    snapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt:
          docSnap.data().createdAt?.toDate?.() ||
          new Date(docSnap.data().createdAt),
      });
    });

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

// Get single order
export const getOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    return {
      success: true,
      data: {
        id: orderSnap.id,
        ...orderSnap.data(),
        createdAt:
          orderSnap.data().createdAt?.toDate?.() ||
          new Date(orderSnap.data().createdAt),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, "orders", orderId);

    await updateDoc(orderRef, {
      status,
      updatedAt: new Date(),
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete order
export const deleteOrder = async (orderId) => {
  try {
    const orderRef = doc(db, "orders", orderId);

    await deleteDoc(orderRef);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  try {
    const ordersRef = collection(db, "orders");

    const q = query(
      ordersRef,
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const orders = [];

    snapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt:
          docSnap.data().createdAt?.toDate?.() ||
          new Date(docSnap.data().createdAt),
      });
    });

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/* ===========================
   USERS
=========================== */

// Get all users
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const users = [];

    snapshot.forEach((docSnap) => {
      users.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/* ===========================
   DASHBOARD STATS
=========================== */

export const getDashboardStats = async () => {
  try {
    const [ordersResult, usersResult] = await Promise.all([
      getAllOrders(),
      getAllUsers(),
    ]);

    if (!ordersResult.success) {
      throw new Error(ordersResult.error);
    }

    const orders = ordersResult.data;
    const users = usersResult.success ? usersResult.data : [];

    const totalRevenue = orders.reduce((sum, order) => {
      const amount = parseFloat(
        String(order.totalAmount || order.total || 0)
          .replace("₹", "")
          .replace(/,/g, "")
      );

      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const statusCounts = orders.reduce((acc, order) => {
      const status = order.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);

      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    }).reverse();

    const revenueByDay = last7Days.map((day) => {
      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt).toLocaleDateString(
          "en-IN",
          {
            month: "short",
            day: "numeric",
          }
        );

        return orderDate === day;
      });

      const revenue = dayOrders.reduce((sum, order) => {
        const amount = parseFloat(
          String(order.totalAmount || order.total || 0)
            .replace("₹", "")
            .replace(/,/g, "")
        );

        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      return {
        day,
        revenue,
        orders: dayOrders.length,
      };
    });

    return {
      success: true,
      data: {
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: users.length,
        pendingOrders: statusCounts.pending || 0,
        processingOrders: statusCounts.processing || 0,
        shippedOrders: statusCounts.shipped || 0,
        deliveredOrders: statusCounts.delivered || 0,
        cancelledOrders: statusCounts.cancelled || 0,
        revenueByDay,
        statusCounts,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/* ===========================
   EMAILJS - ORDER EMAIL
=========================== */

export const sendOrderEmail = async (order) => {
  try {
    const itemsHTML = (order.items || [])
      .map(
        (item) => `
      <div class="item">
        <img src="${item.image}" alt="${item.name}" class="item-img"/>
        <div class="item-details">
          <p class="item-name">${item.name}</p>
          <p class="item-meta">Size: ${item.selectedSize}</p>
          <p class="item-meta">Qty: ${item.quantity}</p>
          <p class="item-price">${item.price}</p>
        </div>
      </div>
    `
      )
      .join("");

    const total =
      Number(order.total) ||
      Number(order.totalAmount) ||
      0;

    const templateParams = {
      to_email: order.userEmail || "",
      to_name:
        order.address?.fullName?.split(" ")[0] || "Customer",

      order_id: order.id,

      order_date:
        order.date ||
        new Date(order.createdAt).toLocaleDateString("en-IN"),

      payment_method:
        (order.paymentMethod || "N/A") +
        (order.paymentDetails?.transactionId
          ? ` · TXN: ${order.paymentDetails.transactionId}`
          : ""),

      items_html: itemsHTML,

      subtotal: total.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),

      total: total.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      }),

      customer_name: order.address?.fullName || "",

      address_line: order.address?.addressLine || "",

      city: order.address?.city || "",

      state: order.address?.state || "",

      pincode: order.address?.pincode || "",

      phone: order.address?.phone || "",
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    console.log("✅ Order email sent to", templateParams.to_email);

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Order email error:", error);

    return {
      success: false,
      error: error.message || error,
    };
  }
};