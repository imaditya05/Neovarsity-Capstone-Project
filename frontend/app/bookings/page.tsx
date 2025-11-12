'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyBookings, Booking, cancelBooking, getRefundPolicy } from '@/lib/bookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Film, Ticket, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/bookings');
      return;
    }
    
    fetchBookings();
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      setBookings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId, 'Cancelled by user');
      fetchBookings(); // Refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                <h1 className="text-xl font-bold">Movie Booking</h1>
              </Link>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/movies">
                <Button variant="ghost" size="sm">Movies</Button>
              </Link>
              <Link href="/shows">
                <Button variant="ghost" size="sm">Shows</Button>
              </Link>
              {user && (
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.name}
                </span>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">My Bookings</h2>
          <p className="text-muted-foreground">View and manage your movie bookings</p>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive mb-6">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't booked any movie tickets yet.
              </p>
              <Link href="/shows">
                <Button>Browse Shows</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const refundPolicy = getRefundPolicy(booking.showDate, booking.showTime);
              const showDateTime = new Date(booking.showDate + ' ' + booking.showTime);
              const isPast = showDateTime < new Date();

              return (
                <Card key={booking._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Movie Poster */}
                      <div className="flex-shrink-0">
                        <img
                          src={booking.movie.posterUrl}
                          alt={booking.movie.title}
                          className="w-32 rounded-lg"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold">{booking.movie.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Booking #{booking.bookingNumber}
                            </p>
                          </div>
                          {getStatusBadge(booking.bookingStatus)}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.theater.theaterName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Film className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.show.screen.screenName}</span>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(booking.showDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.showTime}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">
                            {booking.totalSeats} Seat{booking.totalSeats > 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="outline">
                            {booking.seats.map(s => s.seatNumber).join(', ')}
                          </Badge>
                          <Badge variant="outline">
                            ₹{booking.totalAmount}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Link href={`/booking/confirm/${booking._id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>

                          {booking.bookingStatus === 'confirmed' && !isPast && refundPolicy.canCancel && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={cancellingId === booking._id}
                            >
                              <X className="w-4 h-4 mr-2" />
                              {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                            </Button>
                          )}

                          {booking.bookingStatus === 'confirmed' && !isPast && !refundPolicy.canCancel && (
                            <p className="text-xs text-muted-foreground flex items-center">
                              Cannot cancel: {refundPolicy.message}
                            </p>
                          )}

                          {booking.bookingStatus === 'cancelled' && booking.refundAmount > 0 && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Refund: ₹{booking.refundAmount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

