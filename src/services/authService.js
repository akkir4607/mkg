import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { auth, db } from '../firebase/config';

// ─────────────────────────────────────────
// GENERATE 6-DIGIT OTP
// ─────────────────────────────────────────
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─────────────────────────────────────────
// SEND OTP via EmailJS
// ─────────────────────────────────────────
export const sendOTP = async (email, uid, firstName = 'there') => {
  try {
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await setDoc(doc(db, 'otps', uid), {
      otp,
      email,
      expiresAt,
      attempts: 0,
      createdAt: serverTimestamp(),
    });

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        to_name: firstName,
        otp_code: otp,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    console.log(`✅ OTP email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return {
      success: false,
      error: 'Failed to send verification email. Please try again.',
    };
  }
};

// ─────────────────────────────────────────
// VERIFY OTP
// ─────────────────────────────────────────
export const verifyOTP = async (uid, enteredOTP) => {
  try {
    const otpDoc = await getDoc(doc(db, 'otps', uid));

    if (!otpDoc.exists()) {
      return {
        success: false,
        error: 'No verification code found. Please request a new one.',
      };
    }

    const data = otpDoc.data();

    if (Date.now() > data.expiresAt) {
      await deleteDoc(doc(db, 'otps', uid));
      return { success: false, error: 'Code expired. Please request a new one.' };
    }

    if (data.attempts >= 5) {
      await deleteDoc(doc(db, 'otps', uid));
      return {
        success: false,
        error: 'Too many attempts. Please request a new code.',
      };
    }

    if (data.otp !== enteredOTP) {
      await updateDoc(doc(db, 'otps', uid), {
        attempts: data.attempts + 1,
      });
      return {
        success: false,
        error: `Invalid code. ${4 - data.attempts} attempt(s) remaining.`,
      };
    }

    await updateDoc(doc(db, 'users', uid), {
      emailVerified: true,
      verifiedAt: serverTimestamp(),
    });

    await deleteDoc(doc(db, 'otps', uid));

    return { success: true };
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    return { success: false, error: 'Verification failed. Please try again.' };
  }
};

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
export const registerUser = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    address,
    city,
    state,
    zipCode,
    country,
  } = userData;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      phone,
      address: { street: address, city, state, zipCode, country },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      role: 'customer',
      emailVerified: false,
      orders: [],
      wishlist: [],
    });

    const otpResult = await sendOTP(email, user.uid, firstName);

    return {
      success: true,
      user,
      requiresVerification: true,
      emailSent: otpResult.success,
    };
  } catch (error) {
    console.error('❌ Register error:', error);
    return { success: false, error: getErrorMessage(error.code, error.message) };
  }
};

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (userDoc.exists() && !userDoc.data().emailVerified) {
      const firstName = userDoc.data().firstName || 'there';
      const otpResult = await sendOTP(email, user.uid, firstName);
      return {
        success: true,
        user,
        requiresVerification: true,
        emailSent: otpResult.success,
      };
    }

    return { success: true, user, requiresVerification: false };
  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, error: getErrorMessage(error.code, error.message) };
  }
};

// ─────────────────────────────────────────
// RESEND OTP
// ─────────────────────────────────────────
export const resendOTP = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No active session. Please login again.' };
    }
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const firstName = userDoc.exists() ? userDoc.data().firstName : 'there';
    const result = await sendOTP(user.email, user.uid, firstName);
    return result;
  } catch (error) {
    return { success: false, error: 'Failed to resend code.' };
  }
};

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to sign out.' };
  }
};

// ─────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code, error.message) };
  }
};

// ─────────────────────────────────────────
// GET USER DATA
// ─────────────────────────────────────────
export const getUserData = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'User data not found.' };
    }
  } catch (error) {
    return { success: false, error: 'Failed to fetch user data.' };
  }
};

// ─────────────────────────────────────────
// AUTH LISTENER
// ─────────────────────────────────────────
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ─────────────────────────────────────────
// ERROR MESSAGES
// ─────────────────────────────────────────
const getErrorMessage = (code, originalMessage) => {
  const errors = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/operation-not-allowed': 'Email/Password sign-in is not enabled.',
  };
  return errors[code] || originalMessage || 'Something went wrong. Please try again.';
};