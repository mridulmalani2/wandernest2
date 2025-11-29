'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminNav() {
  const pathname = usePathname()

  // Keep the admin cookie fresh on every navigation so server-side route checks
  // (middleware + /admin page) never see a missing token. Some browsers may
  // block the login Set-Cookie response, and the httpOnly cookie isn't
  // readable from JS, so we mirror the token from localStorage into a
  // same-site cookie on each route render with an explicit max-age.
  useEffect(() => {
    const token = localStorage.getItem('adminToken')

    if (!token) return

    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `admin-token=${token}; path=/; SameSite=Lax; Max-Age=${60 * 60 * 8}${secureFlag}`
  }, [pathname])

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/approvals', label: 'Approvals', icon: '✓' },
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => {
                localStorage.removeItem('adminToken')
                localStorage.removeItem('adminUser')
                document.cookie = 'admin-token=; path=/; Max-Age=0; SameSite=Lax'
                window.location.href = '/admin/login'
              }}
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
