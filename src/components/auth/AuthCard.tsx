'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LoginView } from '@/components/auth/LoginView'
import { SignupView } from '@/components/auth/SignupView'
import { ResetView } from '@/components/auth/ResetView'
import { UpdatePasswordView } from '@/components/auth/UpdatePasswordView'

interface AuthCardProps {
  view: string
  error?: string | null
  redirectTo?: string | null
}

export function AuthCard({ view: initialView, error, redirectTo }: AuthCardProps) {
  const [currentView, setCurrentView] = useState(initialView)

  return (
    <div className="backdrop-blur-md bg-base-surface/60 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {currentView === 'login' && (
            <LoginView redirectTo={redirectTo} onViewChange={setCurrentView} />
          )}
          {currentView === 'signup' && (
            <SignupView onViewChange={setCurrentView} />
          )}
          {currentView === 'reset' && (
            <ResetView onViewChange={setCurrentView} />
          )}
          {currentView === 'reset-sent' && (
            <ResetView onViewChange={setCurrentView} resetSent />
          )}
          {currentView === 'update-password' && (
            <UpdatePasswordView />
          )}
        </motion.div>
      </AnimatePresence>

      {(currentView === 'login' || currentView === 'signup') && (
        <p className="mt-6 text-center text-sm text-accent-silver">
          {currentView === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setCurrentView(currentView === 'login' ? 'signup' : 'login')}
            className="text-accent hover:underline font-medium"
          >
            {currentView === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      )}
    </div>
  )
}
