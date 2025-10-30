'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <h1 className="text-xl font-bold">Movie Booking</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/movies">
              <Button variant="ghost" size="sm">Movies</Button>
            </Link>
            <Link href="/theaters">
              <Button variant="ghost" size="sm">Theaters</Button>
            </Link>
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, <span className="font-medium text-foreground">{user?.name}</span>
                  {user?.role && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {user.role === 'theater_owner' ? 'Theater Owner' : user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  )}
                </span>
                {(user?.role === 'theater_owner' || user?.role === 'admin') && (
                  <Link href="/movies/add">
                    <Button size="sm">Add Movie</Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold tracking-tight">
            Book Your Favorite <span className="text-primary">Movies</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Experience the magic of cinema. Book your tickets online with ease and enjoy the show!
          </p>
          
          <div className="flex gap-4 justify-center pt-6">
            <Link href="/movies">
              <Button size="lg" className="text-lg px-8">
                Browse Movies
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/signup">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign Up
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center space-y-3 p-6 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
            <div className="text-4xl">🎟️</div>
            <h3 className="font-semibold text-lg">Easy Booking</h3>
            <p className="text-muted-foreground">
              Book your tickets in just a few clicks with our simple and intuitive interface
            </p>
          </div>
          <div className="text-center space-y-3 p-6 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
            <div className="text-4xl">🏛️</div>
            <h3 className="font-semibold text-lg">Multiple Theaters</h3>
            <p className="text-muted-foreground">
              Choose from a wide range of theaters and showtimes near you
            </p>
          </div>
          <div className="text-center space-y-3 p-6 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
            <div className="text-4xl">💺</div>
            <h3 className="font-semibold text-lg">Select Your Seats</h3>
            <p className="text-muted-foreground">
              Pick your preferred seats with our interactive seat selection system
            </p>
          </div>
        </div>

        {/* Role-based Information */}
        {isAuthenticated && user && (
          <div className="mt-16 p-6 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
            <h3 className="text-2xl font-bold mb-4">Your Dashboard</h3>
            {user.role === 'admin' && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  As an admin, you have full access to manage users, theaters, and movies.
                </p>
                <div className="flex gap-3">
                  <Link href="/admin/theaters">
                    <Button variant="outline">
                      Manage Theaters
                    </Button>
                  </Link>
                  <Link href="/movies">
                    <Button variant="outline">
                      Manage Movies
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            {user.role === 'theater_owner' && (
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Welcome to your theater management dashboard. You can add movies and manage showtimes.
                </p>
                {user.theaterDetails?.theaterName && (
                  <p className="text-sm">
                    <span className="font-medium">Theater:</span> {user.theaterDetails.theaterName}
                  </p>
                )}
              </div>
            )}
            {user.role === 'user' && (
              <p className="text-muted-foreground">
                Start browsing movies and book your tickets for the latest shows!
              </p>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Movie Booking. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
