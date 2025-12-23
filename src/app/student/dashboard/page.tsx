'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FlowCard } from '@/components/ui/FlowCard';
import { TrendingUp, Calendar, Users, Clock, MapPin, Star } from 'lucide-react';
import Image from 'next/image';

import { ProfileCompletionAlert } from '@/components/student/ProfileCompletionAlert';
import { PendingStatusAlert } from '@/components/student/PendingStatusAlert';
import Footer from '@/components/Footer';

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
  const [profileCompleteness, setProfileCompleteness] = useState<number>(100); // Default to 100 to avoid flash
  const [studentStatus, setStudentStatus] = useState<string>('APPROVED'); // Default to approved to avoid flash on logic check

  useEffect(() => {
    const controller = new AbortController();

    const checkAuthAndFetch = async () => {
      // Avoid fetch if session is loading or if we already have a session and just need data
      if (status === 'loading') return;

      let isAuthenticated = status === 'authenticated';

      // Fallback: Check Custom Session via API if next-auth session is missing
      if (!isAuthenticated) {
        try {
          const res = await fetch('/api/student/auth/session-status', {
            signal: controller.signal
          });
          const data = await res.json();
          if (data.ok) {
            isAuthenticated = true;
            if (data.student?.profileCompleteness !== undefined) {
              setProfileCompleteness(data.student.profileCompleteness);
            }
            if (data.student?.status) {
              setStudentStatus(data.student.status);
            }
          }
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            console.error('Session check failed', error);
          }
        }
      }

      // If aborted during auth check, stop here
      if (controller.signal.aborted) return;

      if (!isAuthenticated) {
        // Use replace to avoid back button loops
        router.replace('/student/signin');
        return;
      }

      // Fetch Data
      try {
        const res = await fetch('/api/student/requests', {
          signal: controller.signal
        });

        if (!res.ok) {
          throw new Error('Failed to fetch requests');
        }

        const data = await res.json();
        setRequests(data.requests || []);
        if (data.profileCompleteness !== undefined) {
          setProfileCompleteness(data.profileCompleteness);
        }
        // If the requests API returns status (it might not currently, but good to handle if updated)
        if (data.status) {
          setStudentStatus(data.status);
        } else {
          // If requests API doesn't return status, we rely on the session check above.
          // However, for NextAuth sessions, we might missed the custom session check.
          // NOTE: Ideally /api/student/requests should return the student object/status too.
          // For now we will assume if we are here we are authenticated.
          // But let's do a quick separate check if we are on NextAuth and didn't run the custom check
          if (isAuthenticated && session?.user && studentStatus === 'APPROVED') {
            // Determine if we need to fetch status explicitly for NextAuth users? 
            // Currently session-status API handles logic for custom token. 
            // For NextAuth, the user object might need to carry it or we fetch it.
            // To be safe, let's fetch it via a dedicated calls or reuse session-status if it supports NextAuth cookie?
            // Actually session-status logic relies on 'student_session_token' cookie which NextAuth doesn't use.
            // We should rely on a separate /api/student/me or similar if requests doesn't provide it.

            // For this iteration, let's assume session check covers it or we add a call.
            // Let's add a lightweight status check call here if we don't have it.
            const statusRes = await fetch('/api/student/auth/session-status', { signal: controller.signal });
            const statusData = await statusRes.json();
            if (statusData.student?.status) {
              setStudentStatus(statusData.student.status);
            }
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch requests', error);
        }
      } finally {
        // Ensure we don't update state if unmounted
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    checkAuthAndFetch();

    return () => {
      controller.abort();
    };
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
    <div className="min-h-screen bg-black relative flex flex-col">
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0"
      >
        <Image
          src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80"
          alt="Cozy reading nook with books"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-28 pb-12 relative z-10 flex-1 w-full">

        {/* Profile Completion Alert */}
        <ProfileCompletionAlert completeness={profileCompleteness} />

        {/* Pending Status Alert */}
        {studentStatus === 'PENDING_APPROVAL' && <PendingStatusAlert />}

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-light tracking-tight text-white mb-3">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Guide'}
          </h1>
          <p className="text-lg font-light text-gray-300">
            Manage your bookings and grow your student profile
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <FlowCard padding="lg" hover variant="dark">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-light text-gray-400 mb-1">Pending Requests</p>
                <p className="text-4xl font-light text-white">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </FlowCard>

          <FlowCard padding="lg" hover variant="dark">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-light text-gray-400 mb-1">Accepted</p>
                <p className="text-4xl font-light text-white">{stats.accepted}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </FlowCard>

          <FlowCard padding="lg" hover variant="dark">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-light text-gray-400 mb-1">Completed</p>
                <p className="text-4xl font-light text-white">{stats.completed}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </FlowCard>

          <FlowCard padding="lg" hover variant="dark">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-light text-gray-400 mb-1">Total Earnings</p>
                <p className="text-4xl font-light text-white">€{stats.totalEarnings}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </FlowCard>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-light text-white">Your Requests</h2>

          {requests.length === 0 ? (
            <FlowCard padding="lg" variant="dark">
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No requests yet</h3>
                <p className="text-gray-400 font-light">
                  Your booking requests will appear here once tourists start submitting them
                </p>
              </div>
            </FlowCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((request) => (
                <FlowCard key={request.id} padding="lg" hover variant="dark">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-white">
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
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="font-light capitalize">{request.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span className="font-light">
                            {new Date(request.dates.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="h-4 w-4 shrink-0" />
                          <span className="font-light">{request.numberOfGuests} guests</span>
                        </div>
                        <div className="text-lg font-medium text-white">
                          €{request.totalBudget}
                        </div>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => console.log('Accept', request.id)}
                          className="px-6 py-2 rounded-full bg-white text-black hover:shadow-md transition-all duration-300 font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => console.log('Decline', request.id)}
                          className="px-6 py-2 rounded-full border-2 border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                        >
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
      <Footer variant="minimal" />
    </div>
  );
}
