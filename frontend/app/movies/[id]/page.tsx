'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMovieById, Movie, formatDuration, formatDate } from '@/lib/movies';
import { getShowsByMovie, Show, formatTime, getNext7Days } from '@/lib/shows';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Star, Film, Users, ArrowLeft, MapPin, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  const dates = getNext7Days();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const response = await getMovieById(params.id as string);
        setMovie(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMovie();
    }
  }, [params.id]);

  useEffect(() => {
    const fetchShows = async () => {
      if (!params.id) return;
      
      try {
        setShowsLoading(true);
        const response = await getShowsByMovie(params.id as string, { date: selectedDate });
        const showsData = Array.isArray(response.data) ? response.data : (response.data as any).shows || [];
        setShows(showsData);
      } catch (err) {
        console.error('Error fetching shows:', err);
      } finally {
        setShowsLoading(false);
      }
    };

    fetchShows();
  }, [params.id, selectedDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-muted-foreground mb-4">{error || 'Movie not found'}</p>
          <Link href="/movies">
            <Button>Back to Movies</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'now_showing':
        return 'bg-green-500';
      case 'coming_soon':
        return 'bg-blue-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'now_showing':
        return 'Now Showing';
      case 'coming_soon':
        return 'Coming Soon';
      case 'ended':
        return 'Ended';
      default:
        return status;
    }
  };

  const canEdit = isAuthenticated && movie.addedBy && 
    (user?.role === 'admin' || (user?.role === 'theater_owner' && movie.addedBy._id === user.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/movies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Movies
            </Button>
          </Link>
        </div>
      </header>

      {/* Movie Details */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="md:col-span-1">
            <div className="sticky top-8">
              <img
                src={movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
                alt={movie.title}
                className="w-full rounded-lg shadow-xl"
              />
              {movie.trailerUrl && (
                <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block">
                  <Button className="w-full" variant="outline">
                    <Film className="w-4 h-4 mr-2" />
                    Watch Trailer
                  </Button>
                </a>
              )}
              {movie.status === 'now_showing' && (
                <Button className="w-full mt-2" size="lg">
                  Book Tickets
                </Button>
              )}
              {canEdit && (
                <Link href={`/movies/edit/${movie._id}`} className="block mt-2">
                  <Button className="w-full" variant="secondary">
                    Edit Movie
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            <div className="space-y-6">
              {/* Title and Status */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-4xl font-bold">{movie.title}</h1>
                  <Badge className={`${getStatusBadgeColor(movie.status)} text-white`}>
                    {getStatusLabel(movie.status)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {movie.genre.map((g) => (
                    <Badge key={g} variant="secondary">{g}</Badge>
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold">{formatDuration(movie.duration)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Release Date</p>
                        <p className="font-semibold">{formatDate(movie.releaseDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <p className="font-semibold">{movie.rating}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Language</p>
                        <p className="font-semibold">{movie.language}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Average Rating */}
              {movie.averageRating > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                        <div>
                          <p className="text-3xl font-bold">{movie.averageRating.toFixed(1)}</p>
                          <p className="text-sm text-muted-foreground">{movie.totalReviews} reviews</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
                  <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
                </CardContent>
              </Card>

              {/* Cast & Crew */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Cast & Crew</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Director</p>
                      <p className="font-semibold">{movie.director}</p>
                    </div>
                    {movie.producers && movie.producers.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Producers</p>
                        <p className="font-semibold">{movie.producers.join(', ')}</p>
                      </div>
                    )}
                    {movie.cast && movie.cast.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Cast</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {movie.cast.map((actor, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="font-semibold">{actor.name}</span>
                              <span className="text-muted-foreground">{actor.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Theater Info */}
              {movie.theater && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">Theater Information</h2>
                    <div>
                      <p className="font-semibold text-lg">{movie.theater.theaterName}</p>
                      <p className="text-muted-foreground">{movie.theater.city}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Shows Section */}
        {movie.status === 'now_showing' && (
          <div className="mt-8">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">Book Tickets</h2>

                {/* Date Selector */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                  {dates.map((day) => (
                    <Button
                      key={day.date}
                      variant={selectedDate === day.date ? 'default' : 'outline'}
                      onClick={() => setSelectedDate(day.date)}
                      className="whitespace-nowrap"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>

                {/* Shows List */}
                {showsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : shows.length === 0 ? (
                  <div className="text-center py-8">
                    <Film className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No shows available for this date</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shows.reduce((acc: any[], show) => {
                      const theaterId = show.theater._id;
                      const existing = acc.find(item => item.theater._id === theaterId);
                      
                      if (existing) {
                        existing.shows.push(show);
                      } else {
                        acc.push({
                          theater: show.theater,
                          shows: [show]
                        });
                      }
                      
                      return acc;
                    }, []).map((group: any) => (
                      <div key={group.theater._id} className="border rounded-lg p-4">
                        {/* Theater Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{group.theater.theaterName}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {group.theater.address.city}, {group.theater.address.state}
                            </p>
                          </div>
                        </div>

                        {/* Show Times */}
                        <div className="flex flex-wrap gap-3">
                          {group.shows.map((show: Show) => (
                            <Link key={show._id} href={`/booking/${show._id}`}>
                              <Button variant="outline" className="flex flex-col items-start h-auto py-2 px-4">
                                <span className="font-bold text-lg">{formatTime(show.showTime)}</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Badge variant="secondary" className="text-xs">{show.format}</Badge>
                                  <span className="flex items-center gap-1">
                                    <Ticket className="w-3 h-3" />
                                    ₹{Math.min(...show.seatLayout.categories.map(c => c.price))}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground mt-1">
                                  {show.availableSeats || show.screen.totalSeats - show.bookedSeats.length} seats
                                </span>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

