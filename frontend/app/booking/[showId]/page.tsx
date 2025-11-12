'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getShowById, getShowSeats, Show, Seat } from '@/lib/shows';
import { createBooking } from '@/lib/bookings';
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
      return 'bg-blue-500 hover:bg-blue-600 cursor-pointer';
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

    setBooking(true);
    setError('');

    try {
      const response = await createBooking({
        showId: params.showId as string,
        seats: selectedSeats
      });

      // Redirect to booking confirmation
      router.push(`/booking/confirm/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
      // Refresh seats to get latest availability
      fetchShowDetails();
    } finally {
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

                {/* Legend */}
                <div className="flex gap-6 justify-center mb-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-sm">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                    <span className="text-sm">Booked</span>
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
                            title={`${seat.seatNumber} - ${seat.category} - ₹${seat.price}`}
                          >
                            {seat.seatNumber.substring(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Category Info */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Seat Categories</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {show.seatLayout.categories.map((category, index) => (
                      <div key={index} className="text-center p-3 border rounded-lg">
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-lg font-bold text-primary">₹{category.price}</p>
                      </div>
                    ))}
                  </div>
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
                      {selectedSeats.map(seatNumber => (
                        <Badge key={seatNumber} variant="default">
                          {seatNumber}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                {selectedSeats.length > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({selectedSeats.length} seats)</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Convenience Fee</span>
                      <span>₹{convenienceFee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
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

                {/* Book Button */}
                <Button
                  onClick={handleBooking}
                  disabled={selectedSeats.length === 0 || booking}
                  className="w-full"
                  size="lg"
                >
                  {booking ? 'Processing...' : `Book ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

