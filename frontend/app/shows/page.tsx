'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllShows, Show, formatShowDateTime, formatTime, getNext7Days } from '@/lib/shows';
import { getAllMovies, Movie } from '@/lib/movies';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, Film, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ShowsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    movie: '',
    date: new Date().toISOString().split('T')[0],
    format: ''
  });

  const dates = getNext7Days();

  useEffect(() => {
    fetchShows();
    fetchMovies();
  }, [filters]);

  const fetchShows = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.movie) params.movie = filters.movie;
      if (filters.date) params.date = filters.date;
      if (filters.format) params.format = filters.format;
      
      const response = await getAllShows(params);
      setShows(response.data as Show[]);
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await getAllMovies({ status: 'now_showing', limit: 100 });
      setMovies(response.data as Movie[]);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const groupShowsByTheater = () => {
    const grouped: { [key: string]: { theater: any; shows: Show[] } } = {};
    
    shows.forEach(show => {
      const theaterId = show.theater._id;
      if (!grouped[theaterId]) {
        grouped[theaterId] = {
          theater: show.theater,
          shows: []
        };
      }
      grouped[theaterId].shows.push(show);
    });

    return Object.values(grouped);
  };

  const groupedShows = groupShowsByTheater();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Movie Shows</h1>
              <p className="text-sm text-muted-foreground">Find and book your favorite movies</p>
            </div>
            {user && (user.role === 'theater_owner' || user.role === 'admin') && (
              <Link href="/shows/add">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Show
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b bg-white dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Movie Filter */}
            <div>
              <Select value={filters.movie} onValueChange={(value) => setFilters({ ...filters, movie: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Movies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Movies</SelectItem>
                  {movies.map((movie) => (
                    <SelectItem key={movie._id} value={movie._id}>
                      {movie.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div>
              <Select value={filters.date} onValueChange={(value) => setFilters({ ...filters, date: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Date" />
                </SelectTrigger>
                <SelectContent>
                  {dates.map((day) => (
                    <SelectItem key={day.date} value={day.date}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format Filter */}
            <div>
              <Select value={filters.format} onValueChange={(value) => setFilters({ ...filters, format: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Formats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Formats</SelectItem>
                  <SelectItem value="2D">2D</SelectItem>
                  <SelectItem value="3D">3D</SelectItem>
                  <SelectItem value="IMAX">IMAX</SelectItem>
                  <SelectItem value="4DX">4DX</SelectItem>
                  <SelectItem value="Dolby Atmos">Dolby Atmos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Shows List */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading shows...</p>
            </div>
          </div>
        ) : shows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Shows Found</h3>
              <p className="text-muted-foreground mb-4">
                There are no shows available for the selected filters.
              </p>
              {user && (user.role === 'theater_owner' || user.role === 'admin') && (
                <Link href="/shows/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Show
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {groupedShows.map((group) => (
              <Card key={group.theater._id}>
                <CardContent className="p-6">
                  {/* Theater Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b">
                    <div>
                      <h2 className="text-xl font-bold">{group.theater.theaterName}</h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {group.theater.address.city}, {group.theater.address.state}
                      </p>
                    </div>
                    <Badge variant="outline">{group.shows.length} Shows</Badge>
                  </div>

                  {/* Shows for this theater */}
                  <div className="space-y-4">
                    {group.shows.map((show) => (
                      <div
                        key={show._id}
                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        {/* Movie Poster */}
                        <div className="flex-shrink-0">
                          <img
                            src={show.movie.posterUrl}
                            alt={show.movie.title}
                            className="w-24 h-36 object-cover rounded-md"
                          />
                        </div>

                        {/* Show Details */}
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">{show.movie.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="secondary">{show.movie.rating}</Badge>
                              <Badge variant="outline">{show.format}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {show.movie.duration} min
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(show.showDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(show.showTime)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Ticket className="w-4 h-4" />
                              {show.screen.screenName}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Starting from</p>
                              <p className="text-lg font-bold text-primary">
                                ₹{Math.min(...show.seatLayout.categories.map(c => c.price))}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                variant={show.availableSeats && show.availableSeats > 20 ? 'default' : 'destructive'}
                              >
                                {show.availableSeats || show.screen.totalSeats - show.bookedSeats.length} seats available
                              </Badge>
                              <Link href={`/booking/${show._id}`}>
                                <Button>Book Now</Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

