'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/bookings', label: 'Bookings', icon: '🧭' },
  { href: '/admin/approvals', label: 'Approvals', icon: '✓' },
  { href: '/admin/students', label: 'Students', icon: '👥' },
  { href: '/admin/reports', label: 'Reports', icon: '⚠️' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  // Mirror the admin token into a same-site cookie on every nav render so
  // middleware and server components consistently see the session.
  useEffect(() => {
    const token = window.localStorage.getItem('adminToken')
    if (!token) return

    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `admin-token=${token}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 8}${secureFlag}`
  }, [pathname])

  // Add scroll detection for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  return (
    <nav className={`border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-black/10' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <div className="flex items-center">
              <span className="text-xl font-bold text-white">TourWiseCo Admin</span>
            </div>
            <div className="hidden sm:flex sm:space-x-8">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                const baseClasses =
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                const activeClasses = isActive
                  ? 'border-white text-white'
                  : 'border-transparent text-white/70 hover:border-white/50 hover:text-white'

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
              className="text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
