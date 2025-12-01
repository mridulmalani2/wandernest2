'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FlowCard } from '@/components/ui/FlowCard';
import { TrendingUp, Calendar, Users, Clock, MapPin, Star } from 'lucide-react';

interface StudentRequest {
  id: string;
  touristName: string;
  city: string;
  dates: { start: string; end: string };
  numberOfGuests: number;
  serviceType: string;
  totalBudget: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/student/signin');
      return;
    }

    if (status === 'authenticated') {
      fetch('/api/student/requests')
        .then(res => res.json())
        .then(data => {
          setRequests(data.requests || []);
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
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalEarnings: requests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.totalBudget, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-liquid-light to-white relative">
        {/* Subtle Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a1f3a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-light tracking-tight text-liquid-dark-primary mb-3">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'Guide'}
            </h1>
            <p className="text-lg font-light text-gray-600">
              Manage your bookings and grow your guide business
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <FlowCard padding="lg" hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-light text-gray-600 mb-1">Pending Requests</p>
                  <p className="text-4xl font-light text-liquid-dark-primary">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </FlowCard>

            <FlowCard padding="lg" hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-light text-gray-600 mb-1">Accepted</p>
                  <p className="text-4xl font-light text-liquid-dark-primary">{stats.accepted}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </FlowCard>

            <FlowCard padding="lg" hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-light text-gray-600 mb-1">Completed</p>
                  <p className="text-4xl font-light text-liquid-dark-primary">{stats.completed}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </FlowCard>

            <FlowCard padding="lg" hover variant="elevated">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-light text-gray-600 mb-1">Total Earnings</p>
                  <p className="text-4xl font-light text-liquid-dark-primary">€{stats.totalEarnings}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-liquid-dark-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-liquid-dark-primary" />
                </div>
              </div>
            </FlowCard>
          </div>

          {/* Requests List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-liquid-dark-primary">Your Requests</h2>

            {requests.length === 0 ? (
              <FlowCard padding="lg">
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-liquid-light mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-liquid-dark-secondary" />
                  </div>
                  <h3 className="text-xl font-medium text-liquid-dark-primary mb-2">No requests yet</h3>
                  <p className="text-gray-600 font-light">
                    Your booking requests will appear here once tourists start submitting them
                  </p>
                </div>
              </FlowCard>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {requests.map((request) => (
                  <FlowCard key={request.id} padding="lg" hover>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-liquid-dark-primary">
                              {request.touristName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-3 py-1 rounded-full border font-medium capitalize ${getStatusColor(request.status)}`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span className="font-light capitalize">{request.city}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span className="font-light">
                              {new Date(request.dates.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4 shrink-0" />
                            <span className="font-light">{request.numberOfGuests} guests</span>
                          </div>
                          <div className="text-lg font-medium text-liquid-dark-primary">
                            €{request.totalBudget}
                          </div>
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button className="px-6 py-2 rounded-full bg-liquid-dark-primary text-white hover:shadow-md transition-all duration-300">
                            Accept
                          </button>
                          <button className="px-6 py-2 rounded-full border-2 border-gray-300 text-gray-700 hover:border-liquid-dark-primary/30 transition-all duration-300">
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </FlowCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
