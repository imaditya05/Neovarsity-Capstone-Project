'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { createTheater, TheaterFormData, THEATER_FACILITIES } from '@/lib/theaters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AddTheaterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<TheaterFormData>();

  // Check authorization
  if (user && user.role !== 'theater_owner' && user.role !== 'admin') {
    router.push('/theaters');
    return null;
  }

  const handleFacilityToggle = (facility: string) => {
    setSelectedFacilities(prev => {
      if (prev.includes(facility)) {
        return prev.filter(f => f !== facility);
      } else {
        return [...prev, facility];
      }
    });
  };

  const onSubmit = async (data: TheaterFormData) => {
    console.log('Form submitted!', data);
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const theaterData: TheaterFormData = {
        ...data,
        facilities: selectedFacilities,
        address: {
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          zipCode: data.address.zipCode,
          country: 'India'
        }
      };

      console.log('Sending theater data:', theaterData);
      const response = await createTheater(theaterData);
      console.log('Theater created successfully:', response);
      setSuccess('Theater created successfully! It will be visible after admin approval.');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/theaters');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating theater:', err);
      setError(err.response?.data?.message || 'Failed to create theater');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/theaters">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Theaters
            </Button>
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Add New Theater</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your theater will be reviewed by admin before going live
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit, (errors) => {
              console.log('Form validation errors:', errors);
              setError('Please fill in all required fields');
            })} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm">
                  {success}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="theaterName">Theater Name *</Label>
                  <Input
                    id="theaterName"
                    {...register('theaterName', { required: 'Theater name is required' })}
                    placeholder="Enter theater name"
                  />
                  {errors.theaterName && <p className="text-sm text-destructive">{errors.theaterName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe your theater"
                    rows={3}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Address</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    {...register('address.street', { required: 'Street address is required' })}
                    placeholder="123 Main Street"
                  />
                  {errors.address?.street && <p className="text-sm text-destructive">{errors.address.street.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register('address.city', { required: 'City is required' })}
                      placeholder="Mumbai"
                    />
                    {errors.address?.city && <p className="text-sm text-destructive">{errors.address.city.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      {...register('address.state', { required: 'State is required' })}
                      placeholder="Maharashtra"
                    />
                    {errors.address?.state && <p className="text-sm text-destructive">{errors.address.state.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    {...register('address.zipCode')}
                    placeholder="400001"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Contact Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...register('contact.phone', { 
                        required: 'Phone is required',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Please enter a valid 10-digit phone number'
                        }
                      })}
                      placeholder="9876543210"
                    />
                    {errors.contact?.phone && <p className="text-sm text-destructive">{errors.contact.phone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('contact.email')}
                      placeholder="info@theater.com"
                    />
                  </div>
                </div>
              </div>

              {/* License */}
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number *</Label>
                <Input
                  id="licenseNumber"
                  {...register('licenseNumber', { required: 'License number is required' })}
                  placeholder="Enter license number"
                />
                {errors.licenseNumber && <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>}
              </div>

              {/* Facilities */}
              <div className="space-y-2">
                <Label>Facilities</Label>
                <div className="flex flex-wrap gap-2 border rounded-lg p-4">
                  {THEATER_FACILITIES.map((facility) => (
                    <Badge
                      key={facility}
                      variant={selectedFacilities.includes(facility) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleFacilityToggle(facility)}
                    >
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Theater'}
                </Button>
                <Link href="/theaters">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>

              {user?.role === 'theater_owner' && (
                <p className="text-sm text-muted-foreground text-center">
                  Your theater will be pending approval by admin
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

