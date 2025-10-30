import { Theater } from '@/lib/theaters';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapPin, Phone, Film } from 'lucide-react';

interface TheaterCardProps {
  theater: Theater;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TheaterCard({ theater, showActions = false, onEdit, onDelete }: TheaterCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold">{theater.theaterName}</h3>
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
        {theater.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {theater.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Film className="w-4 h-4 text-muted-foreground" />
            <span>{theater.screens.length} Screens</span>
          </div>
          {theater.totalCapacity && (
            <span className="text-muted-foreground">
              {theater.totalCapacity} seats
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>{theater.contact.phone}</span>
        </div>

        {theater.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {theater.facilities.slice(0, 3).map((facility) => (
              <Badge key={facility} variant="outline" className="text-xs">
                {facility}
              </Badge>
            ))}
            {theater.facilities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{theater.facilities.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!showActions ? (
          <Link href={`/theaters/${theater._id}`} className="w-full">
            <Button className="w-full" variant="outline">View Details</Button>
          </Link>
        ) : (
          <>
            <Link href={`/theaters/${theater._id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">View</Button>
            </Link>
            {onEdit && (
              <Button variant="default" onClick={() => onEdit(theater._id)} className="flex-1" size="sm">
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={() => onDelete(theater._id)} className="flex-1" size="sm">
                Delete
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}

