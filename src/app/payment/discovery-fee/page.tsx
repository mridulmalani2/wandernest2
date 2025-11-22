'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
      prefill?: { email?: string; contact?: string };
      theme?: { color: string };
    }) => { open: () => void };
  }
}

export default function DiscoveryFeePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [discoveryFee, setDiscoveryFee] = useState<number>(99) // Default fallback

  // Get query parameters
  const touristId = searchParams.get('touristId')
  const requestId = searchParams.get('requestId')
  const redirectUrl = searchParams.get('redirect') || '/booking'

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      // Create order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          touristId,
          requestId,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Update discovery fee from API response
      if (orderData.amount) {
        setDiscoveryFee(orderData.amount)
      }

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Payment gateway not loaded. Please refresh and try again.')
      }

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'TourWiseCo',
        description: 'Discovery Fee - Access to Local Guides',
        order_id: orderData.orderId,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              // Redirect to success page
              router.push(`/payment/success?paymentId=${orderData.paymentId}&redirect=${encodeURIComponent(redirectUrl)}`)
            } else {
              setError('Payment verification failed. Please contact support.')
              setLoading(false)
            }
          } catch (error) {
            console.error('Verification error:', error)
            setError('Payment verification failed. Please contact support.')
            setLoading(false)
          }
        },
        prefill: {
          email: email,
          contact: phone,
        },
        theme: {
          color: '#5a87d4',
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: unknown) {
      console.error('Payment error:', error)
      setError(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ui-blue-secondary to-ui-purple-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent">
              TourWiseCo
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Discovery Fee</h1>
            <p className="text-gray-600 text-lg">
              One-time payment to access our network of local student guides
            </p>
          </div>

          <Card className="p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 bg-ui-blue-secondary rounded-lg mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Discovery Fee</h3>
                  <p className="text-sm text-gray-600">Access to curated local guides</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-ui-blue-primary">₹{discoveryFee}</div>
                  <div className="text-sm text-gray-500">One-time payment</div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex items-start">
                  <span className="text-ui-success mr-2">✓</span>
                  <span>Access to verified student guides in your destination</span>
                </div>
                <div className="flex items-start">
                  <span className="text-ui-success mr-2">✓</span>
                  <span>Direct communication with matched guides</span>
                </div>
                <div className="flex items-start">
                  <span className="text-ui-success mr-2">✓</span>
                  <span>Secure and verified platform</span>
                </div>
                <div className="flex items-start">
                  <span className="text-ui-success mr-2">✓</span>
                  <span>Support local students</span>
                </div>
              </div>
            </div>

            {error && (
              <Alert className="mb-6 bg-ui-error/10 border-ui-error/25 text-ui-error">
                {error}
              </Alert>
            )}

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !scriptLoaded}
              >
                {loading ? 'Processing...' : `Pay ₹${discoveryFee} Now`}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Razorpay
              </p>
            </form>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              By proceeding with the payment, you agree to our{' '}
              <Link href="/terms" className="text-ui-blue-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-ui-blue-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
