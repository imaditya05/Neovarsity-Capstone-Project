import api from './api';

// TypeScript Interfaces
export interface BookingSeat {
  seatNumber: string;
  category: string;
  price: number;
}

export interface ContactDetails {
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  show: {
    _id: string;
    showDate: string;
    showTime: string;
    format: string;
    screen: {
      screenNumber: number;
      screenName: string;
      totalSeats: number;
    };
  };
  movie: {
    _id: string;
    title: string;
    posterUrl: string;
    duration: number;
    rating: string;
    language?: string;
  };
  theater: {
    _id: string;
    theaterName: string;
    address: {
      street?: string;
      city: string;
      state: string;
      zipCode?: string;
    };
  };
  showDate: string;
  showTime: string;
  seats: BookingSeat[];
  totalSeats: number;
  subtotal: number;
  convenienceFee: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'upi' | 'wallet' | 'netbanking' | 'cash';
  paymentId?: string;
  paymentDate?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  bookingStatus: 'confirmed' | 'cancelled' | 'completed';
  bookingNumber: string;
  qrCode?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refundAmount: number;
  contactDetails: ContactDetails;
  seatNumbers?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  showId: string;
  seats: string[]; // Array of seat numbers
  contactDetails?: ContactDetails;
}

export interface BookingsResponse {
  success: boolean;
  count: number;
  total?: number;
  page?: number;
  pages?: number;
  data: Booking[];
  message?: string;
}

export interface BookingResponse {
  success: boolean;
  data: Booking;
  message?: string;
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
  data: {
    booking: Booking;
    refundAmount: number;
  };
}

export interface BookingStatsResponse {
  success: boolean;
  data: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    revenue: {
      totalRevenue: number;
      avgBookingValue: number;
    };
    statusBreakdown: Array<{ _id: string; count: number }>;
  };
}

// API Functions

// Create new booking
export const createBooking = async (data: CreateBookingData): Promise<BookingResponse> => {
  const response = await api.post('/api/bookings', data);
  return response.data;
};

// Get user's bookings
export const getMyBookings = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<BookingsResponse> => {
  const response = await api.get('/api/bookings/my-bookings', { params });
  return response.data;
};

// Get single booking by ID
export const getBookingById = async (id: string): Promise<BookingResponse> => {
  const response = await api.get(`/api/bookings/${id}`);
  return response.data;
};

// Cancel booking
export const cancelBooking = async (
  id: string,
  reason?: string
): Promise<CancelBookingResponse> => {
  const response = await api.put(`/api/bookings/${id}/cancel`, { reason });
  return response.data;
};

// Get all bookings (Admin only)
export const getAllBookings = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<BookingsResponse> => {
  const response = await api.get('/api/bookings/admin/all', { params });
  return response.data;
};

// Get booking statistics (Admin only)
export const getBookingStats = async (): Promise<BookingStatsResponse> => {
  const response = await api.get('/api/bookings/admin/stats');
  return response.data;
};

// Utility functions

// Format booking date and time
export const formatBookingDateTime = (showDate: string, showTime: string): string => {
  const date = new Date(showDate);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Convert 24h time to 12h
  const [hours, minutes] = showTime.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${dateStr} at ${hour12}:${minutes} ${ampm}`;
};

// Get booking status color
export const getBookingStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500';
    case 'cancelled':
      return 'bg-red-500';
    case 'completed':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

// Get payment status color
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'failed':
      return 'bg-red-500';
    case 'refunded':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

// Calculate refund policy
export const getRefundPolicy = (showDate: string, showTime: string): {
  canCancel: boolean;
  refundPercentage: number;
  message: string;
} => {
  const showDateTime = new Date(showDate + ' ' + showTime);
  const now = new Date();
  const hoursUntilShow = (showDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilShow < 0) {
    return {
      canCancel: false,
      refundPercentage: 0,
      message: 'Show has already started'
    };
  } else if (hoursUntilShow < 2) {
    return {
      canCancel: false,
      refundPercentage: 0,
      message: 'Cannot cancel within 2 hours of show time'
    };
  } else if (hoursUntilShow < 24) {
    return {
      canCancel: true,
      refundPercentage: 50,
      message: '50% refund (less than 24 hours to show)'
    };
  } else {
    return {
      canCancel: true,
      refundPercentage: 100,
      message: 'Full refund available'
    };
  }
};

