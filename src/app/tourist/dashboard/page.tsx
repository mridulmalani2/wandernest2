'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FlowCard } from '@/components/ui/FlowCard';
import { TrendingUp, Calendar, MapPin, Users, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface TouristBooking {
  id: string;
  city: string;
  dates: { start: string; end: string };
  numberOfGuests: number;
  serviceType: string;
  budget: number | null;
  status: 'pending' | 'matched' | 'confirmed' | 'completed';
  guideName?: string;
  createdAt: string;
}

export default function TouristDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<TouristBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/booking');
      return;
    }

    if (status === 'authenticated') {
      fetch('/api/tourist/bookings')
        .then(res => res.json())
        .then(data => {
          setBookings(data.bookings || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-liquid-dark-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => b.status === 'confirmed' || b.status === 'matched').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalSpent: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.budget || 0), 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'matched': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1920&q=80"
          alt="Vintage compass and travel map"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-28 pb-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-light tracking-tight text-white mb-3">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Traveler'}
          </h1>
          <p className="text-lg font-light text-gray-300">
            Your trips and bookings at a glance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <FlowCard padding="md" hover variant="dark">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Total Bookings</p>
                <p className="text-4xl font-light text-white">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </FlowCard>

          <FlowCard padding="md" hover variant="dark">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Upcoming</p>
                <p className="text-4xl font-light text-white">{stats.upcoming}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </FlowCard>

          <FlowCard padding="md" hover variant="dark">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Completed</p>
                <p className="text-4xl font-light text-white">{stats.completed}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </FlowCard>

          <FlowCard padding="md" hover variant="dark">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Total Spent</p>
                <p className="text-4xl font-light text-white">€{stats.totalSpent}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-gray-900" />
              </div>
            </div>
          </FlowCard>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light text-white">Your Trips</h2>
            <button
              onClick={() => router.push('/booking')}
              className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
            >
              New Booking
            </button>
          </div>

          {bookings.length === 0 ? (
            <FlowCard padding="lg" variant="dark">
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No bookings yet</h3>
                <p className="text-gray-400 font-light mb-6">
                  Start planning your next adventure
                </p>
                <button
                  onClick={() => router.push('/booking')}
                  className="px-8 py-3 rounded-xl bg-white text-black hover:bg-gray-200 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                >
                  Create Booking
                </button>
              </div>
            </FlowCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((booking) => (
                <FlowCard key={booking.id} padding="md" hover variant="dark" className="group">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-medium text-white mb-1 capitalize group-hover:text-blue-400 transition-colors">
                          {booking.city}
                        </h3>
                        {booking.guideName && (
                          <p className="text-sm text-gray-300 font-light">
                            Guide: {booking.guideName}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="h-4 w-4 shrink-0 text-gray-500" />
                          <span className="font-light">
                            {new Date(booking.dates.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            {booking.dates.end && ` - ${new Date(booking.dates.end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Users className="h-4 w-4 shrink-0 text-gray-500" />
                          <span className="font-light">{booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'guest' : 'guests'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="h-4 w-4 shrink-0 text-gray-500" />
                          <span className="font-light capitalize">{booking.serviceType.replace('_', ' ')}</span>
                        </div>
                        <div className="text-lg font-medium text-white">
                          {booking.budget ? `€${booking.budget}` : 'Price TBD'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <button
                        onClick={() => {
                          if (booking.status === 'matched') {
                            router.push(`/booking/select-guide?requestId=${booking.id}`);
                          } else {
                            router.push(`/booking/pending?requestId=${booking.id}`);
                          }
                        }}
                        className="text-sm font-medium text-white hover:text-blue-300 transition-colors flex items-center gap-1 group/btn"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </FlowCard>
              ))}
            </div>
          )}
        </div>
      </div >
    </div >
  );
}
