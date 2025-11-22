'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Globe, Menu, X, User, LogOut, LayoutDashboard, ChevronLeft } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface NavigationProps {
  variant?: 'default' | 'tourist' | 'student' | 'admin'
  showBackButton?: boolean
  backHref?: string
}

export default function Navigation({ variant = 'default', showBackButton = false, backHref = '/' }: NavigationProps) {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className={`border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'shadow-lg shadow-black/10' : ''
    }`}>
      <div className="container mx-auto px-4 py-3 md:py-3.5">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="p-1 rounded-lg bg-white/10 text-white backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-xl md:text-2xl font-sans font-semibold text-white tracking-tight transition-all duration-300 group-hover:text-white/90">
              WanderNest
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            {showBackButton && (
              <Link href={backHref}>
                <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-white/90 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent" aria-label="Go back">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </Link>
            )}

            {!session && variant === 'default' && (
              <>
                <Link href="/student">
                  <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-white/90 border border-white/20 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    I&apos;m a Student
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button className="rounded-full px-5 py-2 h-auto bg-white/15 hover:bg-white/25 border border-white/30 text-white font-sans text-sm font-semibold transition-all backdrop-blur-sm">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'tourist' && (
              <>
                <Link href="/">
                  <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-white/90 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button className="rounded-full px-5 py-2 h-auto bg-white/15 hover:bg-white/25 border border-white/30 text-white font-sans text-sm font-semibold transition-all backdrop-blur-sm">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'student' && (
              <>
                <Link href="/">
                  <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-white/90 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                  </Button>
                </Link>
                <Link href="/student/signin">
                  <Button variant="ghost" className="rounded-full px-5 py-2 h-auto text-white/90 border border-white/20 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    Sign In
                  </Button>
                </Link>
              </>
            )}

            {session && (
              <>
                {session.user?.userType === 'tourist' && (
                  <Link href="/tourist/dashboard">
                    <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-white/90 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                {session.user?.userType === 'student' && (
                  <Link href="/student/dashboard">
                    <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-white/90 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2 pl-3 border-l border-white/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white font-semibold text-sm backdrop-blur-sm">
                      {session.user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-white max-w-[120px] truncate">
                      {session.user?.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="rounded-full h-auto w-auto p-2 hover:bg-red-500/20 hover:text-red-300 text-white/80 transition-all"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t border-white/20 pt-4 animate-fade-in-up bg-white/5 backdrop-blur-md rounded-lg shadow-lg">
            {showBackButton && (
              <Link href={backHref} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-full text-white/90 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </Link>
            )}

            {!session && variant === 'default' && (
              <>
                <Link href="/student" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full rounded-full text-white/90 border border-white/20 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    I&apos;m a Student
                  </Button>
                </Link>
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-sans text-sm font-semibold transition-all backdrop-blur-sm">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'tourist' && (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-full text-white/90 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </Link>
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-sans text-sm font-semibold transition-all backdrop-blur-sm">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'student' && (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-full text-white/90 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </Link>
                <Link href="/student/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full rounded-full text-white/90 border border-white/20 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    Sign In
                  </Button>
                </Link>
              </>
            )}

            {session && (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 border border-white/20 rounded-full backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white font-semibold text-sm backdrop-blur-sm">
                    {session.user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {session.user?.name}
                  </span>
                </div>
                {session.user?.userType === 'tourist' && (
                  <Link href="/tourist/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-full text-white/90 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                {session.user?.userType === 'student' && (
                  <Link href="/student/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-full text-white/90 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="w-full justify-start rounded-full hover:bg-red-500/20 hover:text-red-300 text-white/90 transition-all font-sans text-sm font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
