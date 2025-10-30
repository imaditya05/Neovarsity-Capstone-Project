'use client';

import { useEffect, useState } from 'react';
import { getAllMovies, Movie, GENRES, STATUSES } from '@/lib/movies';
import MovieCard from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user, isAuthenticated } = useAuth();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await getAllMovies({
        search: searchTerm || undefined,
        genre: selectedGenre || undefined,
        status: selectedStatus || undefined,
        page,
        limit: 12
      });
      setMovies(response.data);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page, selectedGenre, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMovies();
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedStatus('');
    setPage(1);
  };

  const canAddMovie = isAuthenticated && (user?.role === 'theater_owner' || user?.role === 'admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              <h1 className="text-xl font-bold">Movie Booking</h1>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated && user && (
              <span className="text-sm text-muted-foreground">
                {user.name}
              </span>
            )}
            <Link href="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
            {canAddMovie && (
              <Link href="/movies/add">
                <Button size="sm">Add Movie</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Browse Movies</h2>
          <p className="text-muted-foreground">Discover your next favorite movie</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All Genres</SelectItem>
                    {GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All Status</SelectItem>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button type="submit">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-700 h-[400px] rounded-t-lg"></div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-b-lg space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-muted-foreground mb-4">No movies found</p>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search term</p>
            {canAddMovie && (
              <Link href="/movies/add">
                <Button>Add Your First Movie</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'default' : 'outline'}
                          onClick={() => setPage(pageNum)}
                          size="sm"
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum}>...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

