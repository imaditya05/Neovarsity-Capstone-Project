'use client';

import { useEffect, useState } from 'react';
import { getAllTheaters, Theater } from '@/lib/theaters';
import TheaterCard from '@/components/TheaterCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function TheatersPage() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const { user, isAuthenticated } = useAuth();

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const response = await getAllTheaters({
        search: searchTerm || undefined,
        city: selectedCity || undefined,
      });
      setTheaters(response.data);
    } catch (error) {
      console.error('Error fetching theaters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaters();
  }, [selectedCity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTheaters();
  };

  const canAddTheater = isAuthenticated && (user?.role === 'theater_owner' || user?.role === 'admin');

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
            <Link href="/movies">
              <Button variant="ghost" size="sm">Movies</Button>
            </Link>
            <Link href="/theaters">
              <Button variant="ghost" size="sm">Theaters</Button>
            </Link>
            {canAddTheater && (
              <Link href="/theaters/add">
                <Button size="sm">Add Theater</Button>
              </Link>
            )}
            {isAuthenticated && user && (
              <span className="text-sm text-muted-foreground">{user.name}</span>
            )}
            <Link href="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Browse Theaters</h2>
          <p className="text-muted-foreground">Find theaters near you</p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search theaters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="City (e.g., Mumbai)"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Theaters Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-slate-800 h-64 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : theaters.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-muted-foreground mb-4">No theaters found</p>
            {canAddTheater && (
              <Link href="/theaters/add">
                <Button>Add Your Theater</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {theaters.map((theater) => (
              <TheaterCard key={theater._id} theater={theater} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

