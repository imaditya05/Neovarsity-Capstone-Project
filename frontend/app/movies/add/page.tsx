'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { createMovie, MovieFormData, GENRES, RATINGS, STATUSES } from '@/lib/movies';
import { getMyTheaters, Theater } from '@/lib/theaters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AddMoviePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [castMembers, setCastMembers] = useState<{ name: string; role: string }[]>([]);
  const [producers, setProducers] = useState<string[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [selectedTheater, setSelectedTheater] = useState<string>('');
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MovieFormData>();

  // Check authorization
  if (user && user.role !== 'theater_owner' && user.role !== 'admin') {
    router.push('/movies');
    return null;
  }

  // Fetch user's theaters
  useEffect(() => {
    const fetchTheaters = async () => {
      if (user?.role === 'theater_owner') {
        try {
          const response = await getMyTheaters();
          setTheaters(response.data);
        } catch (err) {
          console.error('Error fetching theaters:', err);
        }
      }
    };
    fetchTheaters();
  }, [user]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const addCastMember = () => {
    setCastMembers([...castMembers, { name: '', role: '' }]);
  };

  const removeCastMember = (index: number) => {
    setCastMembers(castMembers.filter((_, i) => i !== index));
  };

  const updateCastMember = (index: number, field: 'name' | 'role', value: string) => {
    const updated = [...castMembers];
    updated[index][field] = value;
    setCastMembers(updated);
  };

  const addProducer = () => {
    setProducers([...producers, '']);
  };

  const removeProducer = (index: number) => {
    setProducers(producers.filter((_, i) => i !== index));
  };

  const updateProducer = (index: number, value: string) => {
    const updated = [...producers];
    updated[index] = value;
    setProducers(updated);
  };

  const onSubmit = async (data: MovieFormData) => {
    setError('');
    
    if (selectedGenres.length === 0) {
      setError('Please select at least one genre');
      return;
    }

    setLoading(true);

    try {
      const movieData: MovieFormData = {
        ...data,
        genre: selectedGenres,
        duration: Number(data.duration),
        cast: castMembers.filter(c => c.name && c.role),
        producers: producers.filter(p => p.trim() !== ''),
        theater: selectedTheater || undefined
      };

      await createMovie(movieData);
      router.push('/movies');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create movie');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Form */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Add New Movie</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Movie Title *</Label>
                    <Input
                      id="title"
                      {...register('title', { required: 'Title is required' })}
                      placeholder="Enter movie title"
                    />
                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language *</Label>
                    <Input
                      id="language"
                      {...register('language', { required: 'Language is required' })}
                      placeholder="e.g., English, Hindi"
                    />
                    {errors.language && <p className="text-sm text-destructive">{errors.language.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description', { required: 'Description is required' })}
                    placeholder="Enter movie description"
                    rows={4}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Genres * (Select at least one)</Label>
                  <div className="flex flex-wrap gap-2 border rounded-lg p-4">
                    {GENRES.map((genre) => (
                      <Badge
                        key={genre}
                        variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleGenreToggle(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      {...register('duration', { required: 'Duration is required', min: 1 })}
                      placeholder="120"
                    />
                    {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="releaseDate">Release Date *</Label>
                    <Input
                      id="releaseDate"
                      type="date"
                      {...register('releaseDate', { required: 'Release date is required' })}
                    />
                    {errors.releaseDate && <p className="text-sm text-destructive">{errors.releaseDate.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating *</Label>
                    <Select onValueChange={(value) => setValue('rating', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {RATINGS.map((rating) => (
                          <SelectItem key={rating} value={rating}>
                            {rating}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select onValueChange={(value) => setValue('status', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
                </div>

                {/* Theater Selection for Theater Owners */}
                {user?.role === 'theater_owner' && theaters.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="theater">Theater (Optional)</Label>
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
                    <p className="text-xs text-muted-foreground">
                      Associate this movie with one of your theaters
                    </p>
                  </div>
                )}

                {user?.role === 'theater_owner' && theaters.length === 0 && (
                  <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      You don't have any theaters yet. <Link href="/theaters/add" className="underline font-medium">Create a theater</Link> to associate movies.
                    </p>
                  </div>
                )}
              </div>

              {/* Media Links */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Media</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="posterUrl">Poster URL</Label>
                    <Input
                      id="posterUrl"
                      {...register('posterUrl')}
                      placeholder="https://example.com/poster.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trailerUrl">Trailer URL</Label>
                    <Input
                      id="trailerUrl"
                      {...register('trailerUrl')}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>

              {/* Cast & Crew */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Cast & Crew</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="director">Director *</Label>
                  <Input
                    id="director"
                    {...register('director', { required: 'Director is required' })}
                    placeholder="Enter director name"
                  />
                  {errors.director && <p className="text-sm text-destructive">{errors.director.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Producers</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addProducer}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Producer
                    </Button>
                  </div>
                  {producers.map((producer, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={producer}
                        onChange={(e) => updateProducer(index, e.target.value)}
                        placeholder="Producer name"
                      />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeProducer(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Cast</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCastMember}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Cast Member
                    </Button>
                  </div>
                  {castMembers.map((cast, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={cast.name}
                        onChange={(e) => updateCastMember(index, 'name', e.target.value)}
                        placeholder="Actor name"
                      />
                      <Input
                        value={cast.role}
                        onChange={(e) => updateCastMember(index, 'role', e.target.value)}
                        placeholder="Character/Role"
                      />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeCastMember(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Movie'}
                </Button>
                <Link href="/movies">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

