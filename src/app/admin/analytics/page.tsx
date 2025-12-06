'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

interface AnalyticsData {
  demandSupplyRatio: Array<{
    city: string
    supply: number
    demand: number
    ratio: number
  }>
  responseTime: {
    avgHours: number
  }
  matchSuccess: {
    totalRequests: number
    matchedRequests: number
    successRate: number
  }
  avgPriceByService: Array<{
    serviceType: string
    avgPrice: number
    count: number
  }>
  platformMetrics: {
    totalStudents: number
    approvedStudents: number
    pendingStudents: number
    totalRequests: number
    activeRequests: number
    totalReviews: number
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      // Note: We are using localStorage for admin auth currently. 
      // Future improvement: move to httpOnly cookies for better security.
      const token = localStorage.getItem('adminToken')

      if (!token) {
        router.replace('/admin/login')
        return
      }

      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal,
      })

      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        router.replace('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('Analytics fetch error:', err)
      setError('Unable to load analytics data. Please try again later.')
    } finally {
      if (signal && !signal.aborted) {
        setLoading(false)
      }
    }
  }, [router])

  useEffect(() => {
    const controller = new AbortController()
    fetchAnalytics(controller.signal)

    return () => {
      controller.abort()
    }
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error || 'No data available'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="mt-2 text-gray-600">Monitor key metrics and performance indicators.</p>
        </div>

        {/* Platform Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.platformMetrics.totalStudents}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {data.platformMetrics.approvedStudents} approved, {data.platformMetrics.pendingStudents} pending
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.platformMetrics.totalRequests}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {data.platformMetrics.activeRequests} active requests
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Match Success Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.matchSuccess.successRate.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {data.matchSuccess.matchedRequests} of {data.matchSuccess.totalRequests} matched
            </p>
          </div>
        </div>

        {/* Response Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Response Time</h2>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600">
                  {data.responseTime.avgHours.toFixed(1)}
                </p>
                <p className="text-gray-600 mt-2">hours</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Average time from request creation to student acceptance
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Total Reviews</h2>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-5xl font-bold text-yellow-600">
                  {data.platformMetrics.totalReviews}
                </p>
                <p className="text-gray-600 mt-2">reviews submitted</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Total number of reviews from tourists
            </p>
          </div>
        </div>

        {/* Demand-Supply Ratio by City */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demand-Supply Ratio by City</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supply (Students)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demand (Requests)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ratio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visual
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.demandSupplyRatio.map((city) => (
                  <tr key={city.city}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {city.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {city.supply}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {city.demand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {city.ratio.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${city.ratio > 2 ? 'bg-red-500' :
                                city.ratio > 1 ? 'bg-yellow-500' :
                                  'bg-green-500'
                              }`}
                            style={{ width: `${Math.min(100, (city.ratio / 3) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {city.ratio > 2 ? 'High' : city.ratio > 1 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.demandSupplyRatio.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No data available yet
              </div>
            )}
          </div>
        </div>

        {/* Average Price by Service Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Price by Service Type</h2>
          <div className="space-y-4">
            {data.avgPriceByService.map((service) => (
              <div key={service.serviceType} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 capitalize">
                      {service.serviceType.replace('_', ' ')}
                    </h3>
                    <p className="text-xs text-gray-500">{service.count} transaction(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${service.avgPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">average price</p>
                  </div>
                </div>
              </div>
            ))}
            {data.avgPriceByService.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No pricing data available yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
