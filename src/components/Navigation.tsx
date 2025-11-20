'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Globe, Menu, X, User, LogOut, LayoutDashboard, ChevronLeft } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { STUDENT_SIGNUP_FORM_URL } from '@/lib/constants'
import { ThemeToggle } from './ThemeToggle'

interface NavigationProps {
  variant?: 'default' | 'tourist' | 'student' | 'admin'
  showBackButton?: boolean
  backHref?: string
}

export default function Navigation({ variant = 'default', showBackButton = false, backHref = '/' }: NavigationProps) {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className="border-b border-border/60 bg-[var(--nav-bg)] backdrop-blur-xl sticky top-0 z-50 shadow-soft transition-colors">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-1.5 rounded-lg gradient-vibrant text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-premium">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-wide transition-all duration-300 group-hover:text-primary">
              WanderNest
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            {showBackButton && (
              <Link href={backHref}>
                <Button variant="ghost" className="hover-lift font-sans tracking-wide" aria-label="Go back">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </Link>
            )}

            {!session && variant === 'default' && (
              <>
                {/* TODO: Once student portal is production-ready, replace Google Form URL with internal route */}
                {/* Temporary redirect to Google Form while building student onboarding flow */}
                {/* <Link href="/student"> */}
                <a href={STUDENT_SIGNUP_FORM_URL} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="hover-lift font-sans tracking-wide">
                    I&apos;m a Student
                  </Button>
                </a>
                {/* </Link> */}
                <Link href="/booking">
                  <Button className="gradient-vibrant hover:opacity-90 transition-all shadow-premium text-white font-sans font-semibold tracking-wide">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'tourist' && (
              <>
                <Link href="/">
                  <Button variant="ghost" className="hover-lift font-sans tracking-wide">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button className="gradient-vibrant hover:opacity-90 transition-all shadow-premium text-white font-sans font-semibold tracking-wide">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'student' && (
              <>
                <Link href="/">
                  <Button variant="ghost" className="hover-lift font-sans tracking-wide">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                  </Button>
                </Link>
                <Link href="/student/signin">
                  <Button variant="outline" className="hover-lift font-sans tracking-wide">
                    Sign In
                  </Button>
                </Link>
              </>
            )}

            {session && (
              <>
                {session.user?.userType === 'tourist' && (
                  <Link href="/tourist/dashboard">
                    <Button variant="ghost" className="hover-lift font-sans tracking-wide">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                {session.user?.userType === 'student' && (
                  <Link href="/student/dashboard">
                    <Button variant="ghost" className="hover-lift font-sans tracking-wide">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-3 pl-3 border-l border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full gradient-vibrant flex items-center justify-center text-white font-semibold text-sm shadow-soft">
                      {session.user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                      {session.user?.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t border-border pt-4 animate-fade-in-up glass-card rounded-lg">
            {showBackButton && (
              <Link href={backHref} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start font-sans tracking-wide">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </Link>
            )}

            {!session && variant === 'default' && (
              <>
                {/* TODO: Once student portal is production-ready, replace Google Form URL with internal route */}
                {/* Temporary redirect to Google Form while building student onboarding flow */}
                {/* <Link href="/student" onClick={() => setMobileMenuOpen(false)}> */}
                <a
                  href={STUDENT_SIGNUP_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full font-sans tracking-wide">
                    I&apos;m a Student
                  </Button>
                </a>
                {/* </Link> */}
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gradient-vibrant hover:opacity-90 text-white font-sans font-semibold tracking-wide shadow-premium">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'tourist' && (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start font-sans tracking-wide">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </Link>
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gradient-vibrant hover:opacity-90 text-white font-sans font-semibold tracking-wide shadow-premium">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'student' && (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start font-sans tracking-wide">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </Link>
                <Link href="/student/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-sans tracking-wide">
                    Sign In
                  </Button>
                </Link>
              </>
            )}

            {session && (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full gradient-vibrant flex items-center justify-center text-white font-semibold text-sm shadow-soft">
                    {session.user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {session.user?.name}
                  </span>
                </div>
                {session.user?.userType === 'tourist' && (
                  <Link href="/tourist/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start font-sans tracking-wide">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                {session.user?.userType === 'student' && (
                  <Link href="/student/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start font-sans tracking-wide">
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
                  className="w-full justify-start hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
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
