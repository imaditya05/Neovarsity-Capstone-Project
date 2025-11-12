'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { createShow, ShowFormData, generateSeatLayout, DEFAULT_SEAT_CATEGORIES, SHOW_FORMATS } from '@/lib/shows';
import { getMyTheaters, Theater } from '@/lib/theaters';
import { getAllMovies, Movie } from '@/lib/movies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface SeatCategory {
  name: string;
  price: number;
}

export default function AddShowPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedTheater, setSelectedTheater] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('2D');
  const [showDate, setShowDate] = useState('');
  const [showTime, setShowTime] = useState('');
  const [screenNumber, setScreenNumber] = useState(1);
  const [screenName, setScreenName] = useState('');
  const [rows, setRows] = useState(10);
  const [seatsPerRow, setSeatsPerRow] = useState(15);
  const [seatCategories, setSeatCategories] = useState<SeatCategory[]>([
    { name: 'Regular', price: 150 },
    { name: 'Premium', price: 200 },
    { name: 'VIP', price: 300 }
  ]);
  const [basePrice, setBasePrice] = useState(150);
  const [convenienceFee, setConvenienceFee] = useState(20);
  
  // Data
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Check authorization
  useEffect(() => {
    if (user && user.role !== 'theater_owner' && user.role !== 'admin') {
      router.push('/shows');
    }
  }, [user, router]);

  // Fetch movies and theaters
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, theatersRes] = await Promise.all([
          getAllMovies({ limit: 100, status: 'now_showing' }),
          getMyTheaters()
        ]);
        setMovies(moviesRes.data as Movie[]);
        setTheaters(theatersRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load movies and theaters');
      }
    };
    fetchData();
  }, []);

  const addSeatCategory = () => {
    setSeatCategories([...seatCategories, { name: '', price: 0 }]);
  };

  const removeSeatCategory = (index: number) => {
    setSeatCategories(seatCategories.filter((_, i) => i !== index));
  };

  const updateSeatCategory = (index: number, field: 'name' | 'price', value: string | number) => {
    const updated = [...seatCategories];
    updated[index][field] = value as never;
    setSeatCategories(updated);
  };

  const onSubmit = async () => {
    setError('');
    
    if (!selectedMovie) {
      setError('Please select a movie');
      return;
    }
    
    if (!selectedTheater) {
      setError('Please select a theater');
      return;
    }
    
    if (!showDate || !showTime) {
      setError('Please provide show date and time');
      return;
    }
    
    if (!screenName) {
      setError('Please provide screen name');
      return;
    }
    
    if (seatCategories.some(cat => !cat.name || cat.price <= 0)) {
      setError('All seat categories must have a name and valid price');
      return;
    }

    setLoading(true);

    try {
      const totalSeats = rows * seatsPerRow;
      
      // Generate seat layout with categories
      const seatLayout = generateSeatLayout(rows, seatsPerRow, seatCategories.map(cat => ({
        ...cat,
        seats: []
      })));

      const showData: ShowFormData = {
        movie: selectedMovie,
        theater: selectedTheater,
        screen: {
          screenNumber,
          screenName,
          totalSeats
        },
        showDate,
        showTime,
        seatLayout,
        basePrice,
        convenienceFee,
        format: selectedFormat as any
      };

      await createShow(showData);
      router.push('/shows');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create show');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/shows">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shows
            </Button>
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Add New Show</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Movie and Theater Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="movie">Movie *</Label>
                  <Select value={selectedMovie} onValueChange={setSelectedMovie}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select movie" />
                    </SelectTrigger>
                    <SelectContent>
                      {movies.map((movie) => (
                        <SelectItem key={movie._id} value={movie._id}>
                          {movie.title} ({movie.language})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theater">Theater *</Label>
                  <Select value={selectedTheater} onValueChange={setSelectedTheater}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theater" />
                    </SelectTrigger>
                    <SelectContent>
                      {theaters.map((theater) => (
                        <SelectItem key={theater._id} value={theater._id}>
                          {theater.theaterName} - {theater.address.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date, Time, Format */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="showDate">Show Date *</Label>
                  <Input
                    id="showDate"
                    type="date"
                    min={getMinDate()}
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="showTime">Show Time *</Label>
                  <Input
                    id="showTime"
                    type="time"
                    value={showTime}
                    onChange={(e) => setShowTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHOW_FORMATS.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Screen Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Screen Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="screenNumber">Screen Number *</Label>
                    <Input
                      id="screenNumber"
                      type="number"
                      min="1"
                      value={screenNumber}
                      onChange={(e) => setScreenNumber(parseInt(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="screenName">Screen Name *</Label>
                    <Input
                      id="screenName"
                      type="text"
                      placeholder="e.g., Audi 1, Screen A"
                      value={screenName}
                      onChange={(e) => setScreenName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Seat Layout */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seat Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rows">Number of Rows *</Label>
                    <Input
                      id="rows"
                      type="number"
                      min="1"
                      max="26"
                      value={rows}
                      onChange={(e) => setRows(parseInt(e.target.value))}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Rows will be labeled A-Z</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seatsPerRow">Seats per Row *</Label>
                    <Input
                      id="seatsPerRow"
                      type="number"
                      min="1"
                      value={seatsPerRow}
                      onChange={(e) => setSeatsPerRow(parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">
                    Total Seats: <span className="text-primary">{rows * seatsPerRow}</span>
                  </p>
                </div>
              </div>

              {/* Seat Categories & Pricing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Seat Categories & Pricing</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addSeatCategory}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>

                <div className="space-y-3">
                  {seatCategories.map((category, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Category name (e.g., Regular)"
                          value={category.name}
                          onChange={(e) => updateSeatCategory(index, 'name', e.target.value)}
                          required
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          min="0"
                          value={category.price || ''}
                          onChange={(e) => updateSeatCategory(index, 'price', parseFloat(e.target.value))}
                          required
                        />
                      </div>
                      {seatCategories.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSeatCategory(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Base Price & Convenience Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Default price (used if seat not in any category)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="convenienceFee">Convenience Fee</Label>
                  <Input
                    id="convenienceFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={convenienceFee}
                    onChange={(e) => setConvenienceFee(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating Show...' : 'Create Show'}
                </Button>
                <Link href="/shows">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

