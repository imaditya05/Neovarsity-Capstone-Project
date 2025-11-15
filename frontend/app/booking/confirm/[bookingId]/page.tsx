'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBookingById, Booking, formatBookingDateTime } from '@/lib/bookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Clock, MapPin, Film, User, Mail, Phone, Ticket, Download } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    fetchBookingDetails();
  }, [params.bookingId, isAuthenticated]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await getBookingById(params.bookingId as string);
      setBooking(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-muted-foreground mb-4">{error || 'Booking not found'}</p>
          <Link href="/shows">
            <Button>Back to Shows</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Success Banner */}
      <div className="bg-green-500 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
          </div>
          <p className="text-green-50">Your tickets have been booked successfully</p>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Booking Number */}
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Booking Number</p>
              <p className="text-3xl font-bold text-primary">{booking.bookingNumber}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Confirmation sent to {booking.contactDetails.email}
              </p>
            </CardContent>
          </Card>

          {/* Movie & Show Details */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Movie Poster */}
                <div className="flex-shrink-0">
                  <img
                    src={booking.movie.posterUrl}
                    alt={booking.movie.title}
                    className="w-40 rounded-lg shadow-lg"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{booking.movie.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{booking.movie.rating}</Badge>
                      <Badge variant="outline">{booking.show.format}</Badge>
                      <Badge>{booking.movie.duration} min</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{booking.theater.theaterName}</p>
                          <p className="text-muted-foreground">
                            {booking.theater.address.city}, {booking.theater.address.state}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Film className="w-4 h-4 text-muted-foreground" />
                        <p>{booking.show.screen.screenName}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p>{new Date(booking.showDate).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p>{booking.showTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat & Payment Details */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Seats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Your Seats
                </h3>
                <div className="flex flex-wrap gap-2">
                  {booking.seats.map((seat, index) => (
                    <div key={index} className="px-4 py-2 bg-primary/10 rounded-lg text-center">
                      <p className="font-bold text-lg">{seat.seatNumber}</p>
                      <p className="text-xs text-muted-foreground">{seat.category}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({booking.totalSeats} tickets)</span>
                    <span>₹{booking.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Convenience Fee</span>
                    <span>₹{booking.convenienceFee}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Paid</span>
                    <span className="text-green-600">₹{booking.totalAmount}</span>
                  </div>
                  <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Payment Status</span>
                      <Badge 
                        variant="outline"
                        className={booking.paymentStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}
                      >
                        {booking.paymentStatus.toUpperCase()}
                      </Badge>
                    </div>
                    {booking.paymentMethod && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="font-medium">{booking.paymentMethod.toUpperCase()}</span>
                      </div>
                    )}
                    {booking.razorpay_payment_id && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Payment ID</span>
                        <span className="font-mono text-xs">{booking.razorpay_payment_id.substring(0, 20)}...</span>
                      </div>
                    )}
                    {booking.paymentDate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Payment Date</span>
                        <span>{new Date(booking.paymentDate).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{booking.contactDetails.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{booking.contactDetails.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{booking.contactDetails.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">Important Information</h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• Please arrive at the theater at least 15 minutes before showtime</li>
                <li>• Show your booking number at the counter to collect your tickets</li>
                <li>• Cancellation available up to 2 hours before show time</li>
                <li>• Outside food and beverages are not allowed</li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/bookings" className="flex-1">
              <Button variant="outline" className="w-full">
                View All Bookings
              </Button>
            </Link>
            <Link href="/shows" className="flex-1">
              <Button className="w-full">
                Book More Tickets
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

