'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Globe, Menu, X, User, LogOut, LayoutDashboard, ChevronLeft } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

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
    <header className="border-b border-border/30 glass-card sticky top-0 z-50 shadow-soft animate-fade-in-down">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-1.5 rounded-lg gradient-vibrant text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-premium">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-gradient-vibrant">
              WanderNest
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            {showBackButton && (
              <Link href={backHref}>
                <Button variant="ghost" className="hover-lift hover:bg-secondary/10 hover:text-secondary" aria-label="Go back">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </Link>
            )}

            {!session && variant === 'default' && (
              <>
                <Link href="/student">
                  <Button variant="outline" className="hover-lift border-2 hover:border-secondary hover:text-secondary transition-all">
                    I&apos;m a Student
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button className="bg-primary hover:bg-primary/90 transition-all shadow-premium text-primary-foreground">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'tourist' && (
              <>
                <Link href="/">
                  <Button variant="ghost" className="hover-lift hover:bg-primary/10 hover:text-primary">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button className="bg-primary hover:bg-primary/90 transition-all shadow-premium text-primary-foreground">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'student' && (
              <>
                <Link href="/">
                  <Button variant="ghost" className="hover-lift hover:bg-secondary/10 hover:text-secondary">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                  </Button>
                </Link>
                <Link href="/student/signin">
                  <Button variant="outline" className="hover-lift border-2 hover:border-secondary hover:text-secondary">
                    Sign In
                  </Button>
                </Link>
              </>
            )}

            {session && (
              <>
                {session.user?.userType === 'tourist' && (
                  <Link href="/tourist/dashboard">
                    <Button variant="ghost" className="hover-lift hover:bg-primary/10 hover:text-primary">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                {session.user?.userType === 'student' && (
                  <Link href="/student/dashboard">
                    <Button variant="ghost" className="hover-lift hover:bg-secondary/10 hover:text-secondary">
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
                    className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/20 transition-colors"
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t border-border/30 pt-4 animate-fade-in-up glass-frosted rounded-lg">
            {showBackButton && (
              <Link href={backHref} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start hover:bg-secondary/10 hover:text-secondary">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </Link>
            )}

            {!session && variant === 'default' && (
              <>
                <Link href="/student" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-2 hover:border-secondary hover:text-secondary">
                    I&apos;m a Student
                  </Button>
                </Link>
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-premium">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'tourist' && (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </Link>
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-premium">
                    Book a Guide
                  </Button>
                </Link>
              </>
            )}

            {!session && variant === 'student' && (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start hover:bg-secondary/10 hover:text-secondary">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </Link>
                <Link href="/student/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-2 hover:border-secondary hover:text-secondary">
                    Sign In
                  </Button>
                </Link>
              </>
            )}

            {session && (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 glass rounded-lg">
                  <div className="w-8 h-8 rounded-full gradient-vibrant flex items-center justify-center text-white font-semibold text-sm shadow-soft">
                    {session.user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {session.user?.name}
                  </span>
                </div>
                {session.user?.userType === 'tourist' && (
                  <Link href="/tourist/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                {session.user?.userType === 'student' && (
                  <Link href="/student/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start hover:bg-secondary/10 hover:text-secondary">
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
                  className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
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
