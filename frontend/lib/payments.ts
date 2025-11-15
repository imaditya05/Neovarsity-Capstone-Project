import api from './api';

// Types
export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentOrderResponse {
  success: boolean;
  data: RazorpayOrder;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    paymentId: string;
    signature: string;
    verified: boolean;
    paymentDetails?: {
      amount: number;
      currency: string;
      status: string;
      method: string;
      email?: string;
      contact?: string;
      created_at: number;
    };
  };
}

export interface RazorpayKeyResponse {
  success: boolean;
  key: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Get Razorpay key from backend
export const getRazorpayKey = async (): Promise<string> => {
  try {
    const response = await api.get<RazorpayKeyResponse>('/api/payments/key');
    return response.data.key;
  } catch (error) {
    console.error('Error fetching Razorpay key:', error);
    throw error;
  }
};

// Create payment order
export const createPaymentOrder = async (
  amount: number,
  receipt?: string,
  notes?: { [key: string]: string }
): Promise<PaymentOrderResponse> => {
  try {
    const response = await api.post<PaymentOrderResponse>('/api/payments/create-order', {
      amount,
      currency: 'INR',
      receipt,
      notes
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<PaymentVerificationResponse> => {
  try {
    const response = await api.post<PaymentVerificationResponse>(
      '/api/payments/verify',
      paymentData
    );
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Update booking with payment details
export const updateBookingPayment = async (
  bookingId: string,
  paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    paymentMethod?: string;
  }
): Promise<any> => {
  try {
    const response = await api.put(
      `/api/bookings/${bookingId}/payment`,
      paymentData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating booking payment:', error);
    throw error;
  }
};

// Initialize Razorpay checkout
export const initializeRazorpayPayment = async (
  options: Omit<RazorpayOptions, 'key'>
): Promise<void> => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Get Razorpay key
    const key = await getRazorpayKey();

    // Create Razorpay instance
    const razorpay = new window.Razorpay({
      ...options,
      key
    });

    // Open checkout
    razorpay.open();
  } catch (error) {
    console.error('Error initializing Razorpay:', error);
    throw error;
  }
};

