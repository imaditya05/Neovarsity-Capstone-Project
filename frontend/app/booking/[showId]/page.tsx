'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getShowById, getShowSeats, Show, Seat } from '@/lib/shows';
import { createBooking } from '@/lib/bookings';
import { 
  createPaymentOrder, 
  verifyPayment, 
  updateBookingPayment,
  initializeRazorpayPayment,
  RazorpayResponse 
} from '@/lib/payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Film, ArrowLeft, Armchair } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SeatSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/booking/${params.showId}`);
      return;
    }
    
    fetchShowDetails();
  }, [params.showId, isAuthenticated]);

  const fetchShowDetails = async () => {
    try {
      setLoading(true);
      const [showResponse, seatsResponse] = await Promise.all([
        getShowById(params.showId as string),
        getShowSeats(params.showId as string)
      ]);
      
      setShow(showResponse.data);
      setSeats(seatsResponse.data.seats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load show details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 10) {
        setError('You can select a maximum of 10 seats');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
      setError('');
    }
  };

  const getSeatClass = (seat: Seat): string => {
    if (seat.isBooked) {
      return 'bg-gray-400 cursor-not-allowed';
    } else if (selectedSeats.includes(seat.seatNumber)) {
      return 'bg-green-500 hover:bg-green-600 cursor-pointer';
    } else {
      // Color code by category
      const category = seat.category?.toLowerCase() || 'standard';
      if (category.includes('premium') || category.includes('vip')) {
        return 'bg-purple-500 hover:bg-purple-600 cursor-pointer';
      } else if (category.includes('economy') || category.includes('budget')) {
        return 'bg-blue-500 hover:bg-blue-600 cursor-pointer';
      } else {
        // Standard/Regular
        return 'bg-cyan-500 hover:bg-cyan-600 cursor-pointer';
      }
    }
  };

  const calculateTotal = () => {
    let subtotal = 0;
    selectedSeats.forEach(seatNumber => {
      const seat = seats.find(s => s.seatNumber === seatNumber);
      if (seat) {
        subtotal += seat.price;
      }
    });
    
    const convenienceFee = show ? show.convenienceFee * selectedSeats.length : 0;
    return {
      subtotal,
      convenienceFee,
      total: subtotal + convenienceFee
    };
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    if (!show || !user) {
      setError('Missing show or user information');
      return;
    }

    setBooking(true);
    setError('');

    try {
      // Step 1: Create booking (with pending payment status)
      console.log('Creating booking...');
      const bookingResponse = await createBooking({
        showId: params.showId as string,
        seats: selectedSeats
      });

      const bookingId = bookingResponse.data._id;
      const totalAmount = calculateTotal().total;

      console.log('Booking created:', bookingId);

      // Step 2: Create Razorpay order
      console.log('Creating payment order...');
      const orderResponse = await createPaymentOrder(
        totalAmount,
        bookingId,
        {
          bookingId,
          showId: params.showId as string,
          userId: user._id || user.id
        }
      );

      console.log('Payment order created:', orderResponse.data.orderId);

      // Step 3: Initialize Razorpay payment
      await initializeRazorpayPayment({
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'Movie Booking',
        description: `Booking for ${show.movie.title}`,
        order_id: orderResponse.data.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            console.log('Payment successful, verifying...');
            
            // Step 4: Verify payment
            const verificationResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verificationResponse.success && verificationResponse.data.verified) {
              console.log('Payment verified, updating booking...');
              
              // Step 5: Update booking with payment details
              await updateBookingPayment(bookingId, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentMethod: verificationResponse.data.paymentDetails?.method
              });

              console.log('Booking payment updated successfully');
              
              // Step 6: Redirect to confirmation page
              router.push(`/booking/confirm/${bookingId}`);
            } else {
              setError('Payment verification failed. Please contact support.');
              setBooking(false);
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            setError('Payment verification failed. Please contact support with your booking ID: ' + bookingId);
            setBooking(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        notes: {
          bookingId,
          showId: params.showId as string
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled. Your seats are on hold for 10 minutes.');
            setBooking(false);
          }
        }
      });

    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process booking');
      // Refresh seats to get latest availability
      fetchShowDetails();
      setBooking(false);
    }
  };

  // Group seats by rows for display
  const groupedSeats = seats.reduce((acc, seat) => {
    const row = seat.seatNumber.charAt(0);
    if (!acc[row]) {
      acc[row] = [];
    }
    acc[row].push(seat);
    return acc;
  }, {} as { [key: string]: Seat[] });

  const rows = Object.keys(groupedSeats).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-muted-foreground mb-4">{error || 'Show not found'}</p>
          <Link href="/shows">
            <Button>Back to Shows</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { subtotal, convenienceFee, total } = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/movies/${show.movie._id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Seat Map - Left Side */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* Screen */}
                <div className="mb-8">
                  <div className="bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-t-3xl h-3 mb-2"></div>
                  <p className="text-center text-sm text-muted-foreground">Screen</p>
                </div>

                {/* Legend with Pricing */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-center mb-3">Seat Categories & Pricing</h3>
                  <div className="flex gap-4 justify-center flex-wrap">
                    {show.seatLayout.categories.map((category, index) => {
                      const categoryName = category.name.toLowerCase();
                      let colorClass = 'bg-cyan-500';
                      if (categoryName.includes('premium') || categoryName.includes('vip')) {
                        colorClass = 'bg-purple-500';
                      } else if (categoryName.includes('economy') || categoryName.includes('budget')) {
                        colorClass = 'bg-blue-500';
                      }
                      
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-6 h-6 ${colorClass} rounded`}></div>
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-primary font-bold">₹{category.price}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 justify-center mt-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded"></div>
                      <span className="text-xs">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-400 rounded"></div>
                      <span className="text-xs">Booked</span>
                    </div>
                  </div>
                </div>

                {/* Seats */}
                <div className="space-y-2">
                  {rows.map(row => (
                    <div key={row} className="flex items-center gap-2">
                      <span className="w-8 text-center font-bold text-sm">{row}</span>
                      <div className="flex gap-1 flex-wrap">
                        {groupedSeats[row].map(seat => (
                          <button
                            key={seat.seatNumber}
                            onClick={() => !seat.isBooked && toggleSeat(seat.seatNumber)}
                            disabled={seat.isBooked}
                            className={`w-8 h-8 text-xs font-semibold rounded transition-colors ${getSeatClass(seat)}`}
                            title={seat.isBooked ? `${seat.seatNumber} - Booked` : `${seat.seatNumber} - ${seat.category} - ₹${seat.price}`}
                          >
                            {seat.seatNumber.substring(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary - Right Side */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-6">
                {/* Movie Info */}
                <div>
                  <img
                    src={show.movie.posterUrl}
                    alt={show.movie.title}
                    className="w-full rounded-lg mb-4"
                  />
                  <h2 className="text-xl font-bold">{show.movie.title}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{show.movie.rating}</Badge>
                    <Badge variant="outline">{show.format}</Badge>
                  </div>
                </div>

                {/* Show Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{show.theater.theaterName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    <span>{show.screen.screenName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(show.showDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{show.showTime}</span>
                  </div>
                </div>

                {/* Selected Seats */}
                {selectedSeats.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Selected Seats</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(seatNumber => {
                        const seat = seats.find(s => s.seatNumber === seatNumber);
                        return (
                          <Badge key={seatNumber} variant="default" title={seat ? `${seat.category} - ₹${seat.price}` : seatNumber}>
                            {seatNumber}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                {selectedSeats.length > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <h3 className="font-semibold mb-2 text-sm">Price Breakdown</h3>
                    {/* Group selected seats by category */}
                    {(() => {
                      const seatsByCategory: { [key: string]: { count: number; price: number; total: number } } = {};
                      selectedSeats.forEach(seatNumber => {
                        const seat = seats.find(s => s.seatNumber === seatNumber);
                        if (seat) {
                          if (!seatsByCategory[seat.category]) {
                            seatsByCategory[seat.category] = { count: 0, price: seat.price, total: 0 };
                          }
                          seatsByCategory[seat.category].count++;
                          seatsByCategory[seat.category].total += seat.price;
                        }
                      });
                      
                      return Object.entries(seatsByCategory).map(([category, data]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span>{category} × {data.count}</span>
                          <span>₹{data.total}</span>
                        </div>
                      ));
                    })()}
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-medium">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Convenience Fee</span>
                      <span>₹{convenienceFee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total Amount</span>
                      <span className="text-primary">₹{total}</span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Payment Button */}
                <Button
                  onClick={handleBooking}
                  disabled={selectedSeats.length === 0 || booking}
                  className="w-full"
                  size="lg"
                >
                  {booking ? 'Processing...' : selectedSeats.length > 0 ? `Proceed to Pay ₹${calculateTotal().total}` : 'Select Seats'}
                </Button>
                {selectedSeats.length > 0 && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    You will be redirected to secure payment gateway
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

