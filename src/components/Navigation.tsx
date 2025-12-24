'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, LayoutDashboard, ChevronLeft, UserCircle, Home } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

interface NavigationProps {
  variant?: 'default' | 'tourist' | 'student' | 'admin'
  showBackButton?: boolean
  backHref?: string
}

export default function Navigation({ variant = 'default', showBackButton = false, backHref = '/' }: NavigationProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [studentSession, setStudentSession] = useState<{ email: string; name?: string | null } | null>(null)
  const isProduction =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    if (session) {
      const userType = session.user?.userType;
      let callbackUrl = '/';
      if (userType === 'student') {
        callbackUrl = '/student/signin';
      } else if (userType === 'tourist') {
        callbackUrl = '/booking';
      }
      try {
        await signOut({ callbackUrl, redirect: true })
      } catch (error) {
        console.error('Failed to sign out', error)
      }
    } else {
      try {
        const res = await fetch('/api/student/auth/signout', { method: 'POST' });
        if (!res.ok) {
          throw new Error('Sign out failed');
        }

        setStudentSession(null)
        router.push('/student/signin')
        router.refresh()
      } catch (error) {
        console.error('Failed to sign out', error);
      }
    }
  }

  useEffect(() => {
    // If the student authenticated via OTP (no NextAuth session), fetch their status for nav affordances
    if (session || variant !== 'student') return

    let isMounted = true

    const loadStudentSession = async () => {
      try {
        const res = await fetch('/api/student/auth/session-status')
        if (!res.ok) return

        const data = await res.json()
        if (isMounted && data.ok && data.email) {
          setStudentSession({ email: data.email, name: data.student?.name })
        }
      } catch (error) {
        console.error('Failed to load student session', error)
      }
    }

    loadStudentSession()

    return () => {
      isMounted = false
    }
  }, [session, variant, pathname])

  return (
    <header className={`nav-glass-dark fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-black/10' : ''
      }`}>
      <div className="container mx-auto px-4 py-2 md:py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Image
                src="/images/logo-large.png"
                alt="TourWiseCo Logo"
                fill
                className="object-cover"
                sizes="32px"
                priority
              />
            </motion.div>
            <motion.span
              className="text-base md:text-lg font-sans font-semibold text-blue-50 tracking-tight"
              whileHover={{ opacity: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              TourWiseCo
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">

            {showBackButton && (
              <Link href={backHref}>
                <Button variant="ghost" className="rounded-full px-3 py-1 h-auto text-blue-50 hover:bg-white/10 hover:text-white transition-all font-sans text-xs font-medium focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent" aria-label="Go back">
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
              </Link>
            )}

            {!session && variant === 'default' && (
              <>
                <Link href="/student">
                  <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-blue-50 border border-white/20 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 font-sans text-sm font-medium">
                    I&apos;m a Student
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button className="rounded-full px-4 py-2 h-auto bg-white/15 hover:bg-white/25 border border-white/30 text-white font-sans text-sm font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95 backdrop-blur-sm">
                    I&apos;m a Tourist
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'tourist' && (
              <>
                <Link href="/">
                  <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-blue-50 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 font-sans text-sm font-medium">
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back to Home
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button className="rounded-full px-4 py-2 h-auto bg-white/15 hover:bg-white/25 border border-white/30 text-white font-sans text-sm font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95 backdrop-blur-sm">
                    I&apos;m a Tourist
                  </Button>
                </Link>
              </>
            )}

            {!session && !studentSession && variant === 'student' && (
              <>
                <Link href="/">
                  <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-blue-50 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 font-sans text-sm font-medium">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                  </Button>
                </Link>
                <Link href="/student/signin">
                  <Button variant="ghost" className="rounded-full px-5 py-2 h-auto text-blue-50 border border-white/20 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 font-sans text-sm font-medium">
                    Sign In
                  </Button>
                </Link>
              </>
            )}

            {(session || studentSession) && (
              <>
                {session?.user?.userType === 'tourist' && (
                  <>
                    <Link href="/">
                      <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-blue-50 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 font-sans text-sm font-medium">
                        <Home className="w-4 h-4 mr-2" />
                        Home
                      </Button>
                    </Link>
                    {pathname !== '/tourist/dashboard' && (
                      <Link href="/tourist/dashboard">
                        <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-blue-50 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 font-sans text-sm font-medium">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                {(session?.user?.userType === 'student' || studentSession) && (
                  <>
                    {pathname !== '/student/dashboard' && (
                      <Link href="/student/dashboard">
                        <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-blue-50 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 font-sans text-sm font-medium">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    {pathname !== '/student/profile' && (
                      <Link href="/student/profile">
                        <Button variant="ghost" className="rounded-full px-4 py-2 h-auto text-blue-50 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 font-sans text-sm font-medium">
                          <UserCircle className="w-4 h-4 mr-2" />
                          Profile
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                <div className="flex items-center space-x-2 pl-3 border-l border-white/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white font-semibold text-sm backdrop-blur-sm transition-transform duration-200 hover:scale-110">
                      {(session?.user?.name || studentSession?.name)?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-white max-w-[120px] truncate">
                      {session?.user?.name || studentSession?.name || studentSession?.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="rounded-full h-auto w-auto p-2 hover:bg-red-500/20 hover:text-red-300 text-white/80 transition-all duration-200 hover:scale-110 hover:rotate-6 active:scale-90"
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
              className="p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:scale-105 active:scale-95"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white transition-transform duration-200 rotate-0 hover:rotate-90" />
              ) : (
                <Menu className="w-6 h-6 text-white transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t border-white/20 pt-4 animate-fade-in-up bg-white/5 backdrop-blur-md rounded-lg shadow-lg">

            {showBackButton && (
              <Link href={backHref} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start rounded-full text-blue-50 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </Link>
            )}

            {!session && variant === 'default' && (
              <>
                <Link href="/student" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full rounded-full text-blue-50 border border-white/20 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    I&apos;m a Student
                  </Button>
                </Link>
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-sans text-sm font-semibold transition-all backdrop-blur-sm">
                    I&apos;m a Tourist
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'tourist' && (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-full text-blue-50 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </Link>
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-sans text-sm font-semibold transition-all backdrop-blur-sm">
                    I&apos;m a Tourist
                  </Button>
                </Link>
              </>
            )}

            {!session && !studentSession && variant === 'student' && (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-full text-blue-50 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </Link>
                <Link href="/student/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full rounded-full text-blue-50 border border-white/20 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                    Sign In
                  </Button>
                </Link>
              </>
            )}

            {(session || studentSession) && (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 border border-white/20 rounded-full backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white font-semibold text-sm backdrop-blur-sm">
                    {(session?.user?.name || studentSession?.name)?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {session?.user?.name || studentSession?.name || studentSession?.email}
                  </span>
                </div>
                {session?.user?.userType === 'tourist' && (
                  <>
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start rounded-full text-blue-50 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                        <Home className="w-4 h-4 mr-2" />
                        Home
                      </Button>
                    </Link>
                    {pathname !== '/tourist/dashboard' && (
                      <Link href="/tourist/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start rounded-full text-blue-50 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                {(session?.user?.userType === 'student' || studentSession) && (
                  <>
                    {pathname !== '/student/dashboard' && (
                      <Link href="/student/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start rounded-full text-blue-50 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    {pathname !== '/student/profile' && (
                      <Link href="/student/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start rounded-full text-blue-50 hover:bg-white/10 hover:text-white transition-all font-sans text-sm font-medium">
                          <UserCircle className="w-4 h-4 mr-2" />
                          Profile
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="w-full justify-start rounded-full hover:bg-red-500/20 hover:text-red-300 text-blue-50 transition-all font-sans text-sm font-medium"
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
