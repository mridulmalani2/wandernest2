'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/approvals', label: 'Approvals', icon: '✓' },
  { href: '/admin/requests', label: 'Requests', icon: '🧭' },
  { href: '/admin/students', label: 'Students', icon: '👥' },
  { href: '/admin/reports', label: 'Reports', icon: '⚠️' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
]

export default function AdminNav() {
  const pathname = usePathname()

  // Mirror the admin token into a same-site cookie on every nav render so
  // middleware and server components consistently see the session.
  useEffect(() => {
    const token = window.localStorage.getItem('adminToken')
    if (!token) return

    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `admin-token=${token}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 8}${secureFlag}`
  }, [pathname])

  const handleLogout = () => {
    window.localStorage.removeItem('adminToken')
    window.localStorage.removeItem('adminUser')
    document.cookie = 'admin-token=; Path=/; Max-Age=0; SameSite=Lax'
    window.location.href = '/admin/login'
  }
  // Keep the http-only admin cookie in sync so navigating between admin routes
  // doesn't accidentally drop the session. Some browsers may block the
  // Set-Cookie response, so we mirror the token from localStorage into a
  // same-site cookie when needed.
  useEffect(() => {
    const token = localStorage.getItem('adminToken')

    if (!token) return

    const hasCookie = document.cookie.split('; ').some((entry) => entry.startsWith('admin-token='))

    if (!hasCookie) {
      document.cookie = `admin-token=${token}; path=/; SameSite=Lax`
    }
  }, [])

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/approvals', label: 'Approvals', icon: '✓' },
    { href: '/admin/requests', label: 'Requests', icon: '🧭' },
    { href: '/admin/students', label: 'Students', icon: '👥' },
    { href: '/admin/reports', label: 'Reports', icon: '⚠️' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">TourWiseCo Admin</span>
            </div>
            <div className="hidden sm:flex sm:space-x-8">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                const baseClasses =
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                const activeClasses = isActive
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${baseClasses} ${activeClasses}`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
