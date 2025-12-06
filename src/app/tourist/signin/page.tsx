'use client'



import { useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'

function TouristSignInContent() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new booking/signin page
    router.replace('/booking')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Redirecting...</p>
      </div>
    </div>
  )
}

export default function TouristSignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <TouristSignInContent />
    </Suspense>
  )
}
