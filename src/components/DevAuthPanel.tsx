'use client'

/**
 * ⚠️ DEVELOPER TOOLS PANEL ⚠️
 * Only visible in development mode with DEV_AUTH_BYPASS enabled
 */

import { useDevAuth } from '@/lib/dev-auth-bypass'
import { User, GraduationCap, LogOut } from 'lucide-react'
import { useState } from 'react'

export function DevAuthPanel() {
  const { isDevBypassEnabled, devUserType, setDevUserType } = useDevAuth()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isDevBypassEnabled) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {/* Toggle Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg font-bold text-sm hover:bg-yellow-400 transition-colors border-2 border-yellow-600"
          title="Developer Auth Tools"
        >
          🔧 DEV AUTH
        </button>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-2xl border-4 border-yellow-500 p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-yellow-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">DEV AUTH BYPASS</h3>
                <p className="text-xs text-red-600 font-semibold">
                  ⚠️ DEVELOPMENT ONLY
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 text-lg"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Current Status */}
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs font-semibold text-gray-600 mb-1">CURRENT USER:</p>
            <p className="text-sm font-bold text-gray-900">
              {devUserType === 'tourist' && '👤 Tourist (dev.tourist@gmail.com)'}
              {devUserType === 'student' && '🎓 Student (dev.student@university.edu)'}
              {!devUserType && '🚫 Not Signed In'}
            </p>
          </div>

          {/* Account Type Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => setDevUserType('tourist')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                devUserType === 'tourist'
                  ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              <User className="h-5 w-5" />
              <div className="text-left">
                <p className="font-bold text-sm">Sign in as Tourist</p>
                <p className="text-xs opacity-80">Book guides & experiences</p>
              </div>
            </button>

            <button
              onClick={() => setDevUserType('student')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                devUserType === 'student'
                  ? 'bg-purple-500 text-white border-purple-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-500'
              }`}
            >
              <GraduationCap className="h-5 w-5" />
              <div className="text-left">
                <p className="font-bold text-sm">Sign in as Student</p>
                <p className="text-xs opacity-80">Provide local guidance</p>
              </div>
            </button>

            <button
              onClick={() => setDevUserType(null)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                !devUserType
                  ? 'bg-gray-500 text-white border-gray-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
              }`}
            >
              <LogOut className="h-5 w-5" />
              <div className="text-left">
                <p className="font-bold text-sm">Sign Out</p>
                <p className="text-xs opacity-80">Test unauthenticated view</p>
              </div>
            </button>
          </div>

          {/* Disable Instructions */}
          <div className="mt-4 pt-3 border-t border-gray-300">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>To disable for production:</strong><br />
              Set <code className="bg-gray-200 px-1 rounded">NEXT_PUBLIC_DEV_AUTH_BYPASS=false</code>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
