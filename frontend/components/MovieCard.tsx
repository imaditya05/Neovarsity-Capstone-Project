import { Movie, formatDuration } from '@/lib/movies';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Clock, Star } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function MovieCard({ movie, showActions = false, onEdit, onDelete }: MovieCardProps) {
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
          alt={movie.title}
          className="w-full h-[400px] object-cover"
        />
        <Badge 
          className={`absolute top-2 right-2 ${getStatusBadgeColor(movie.status)} text-white`}
        >
          {getStatusLabel(movie.status)}
        </Badge>
        {movie.averageRating > 0 && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{movie.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <CardHeader>
        <h3 className="text-xl font-bold line-clamp-1">{movie.title}</h3>
        <div className="flex flex-wrap gap-1 mt-2">
          {movie.genre.slice(0, 3).map((g) => (
            <Badge key={g} variant="outline" className="text-xs">
              {g}
            </Badge>
          ))}
          {movie.genre.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{movie.genre.length - 3}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {movie.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(movie.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(movie.releaseDate).getFullYear()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">{movie.rating}</Badge>
          <span className="text-muted-foreground">{movie.language}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {!showActions ? (
          <Link href={`/movies/${movie._id}`} className="w-full">
            <Button className="w-full">View Details</Button>
          </Link>
        ) : (
          <>
            <Link href={`/movies/${movie._id}`} className="flex-1">
              <Button variant="outline" className="w-full">View</Button>
            </Link>
            {onEdit && (
              <Button variant="default" onClick={() => onEdit(movie._id)} className="flex-1">
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={() => onDelete(movie._id)} className="flex-1">
                Delete
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}

