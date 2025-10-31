'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTheaters, Theater } from '@/lib/theaters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Film, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';

export default function AdminTheatersPage() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const { user, isAuthenticated } = useAuth();

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const response = await getAllTheaters({
        status: filter === 'all' ? undefined : filter,
      });
      setTheaters(response.data);
    } catch (error) {
      console.error('Error fetching theaters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTheaters();
    }
  }, [filter, user]);

  const handleApprove = async (theaterId: string) => {
    try {
      await api.put(`/api/theaters/${theaterId}/status`, { status: 'approved' });
      fetchTheaters();
    } catch (error) {
      console.error('Error approving theater:', error);
    }
  };

  const handleReject = async (theaterId: string) => {
    try {
      await api.put(`/api/theaters/${theaterId}/status`, { status: 'rejected' });
      fetchTheaters();
    } catch (error) {
      console.error('Error rejecting theater:', error);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-lg">Access Denied. Admin only.</p>
            <Link href="/">
              <Button className="w-full mt-4">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost">← Back to Home</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Theater Management</h1>
          <p className="text-muted-foreground">
            Review and approve theater registrations
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            Approved
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>

        {/* Theaters Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-slate-800 h-80 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : theaters.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-muted-foreground">
              No {filter !== 'all' ? filter : ''} theaters found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {theaters.map((theater) => (
              <Card key={theater._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{theater.theaterName}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{theater.address.city}, {theater.address.state}</span>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(theater.status)} text-white`}>
                      {theater.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>License:</strong> {theater.licenseNumber}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {theater.contact.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Film className="w-4 h-4" />
                      {theater.screens.length} Screens
                    </div>
                  </div>

                  {theater.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {theater.facilities.map((facility) => (
                        <Badge key={facility} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Link href={`/theaters/${theater._id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      View Details
                    </Button>
                  </Link>
                  {theater.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(theater._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(theater._id)}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

