'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn } from '@/app/(auth)/auth/actions'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : null}
      {label}
    </button>
  )
}

interface LoginViewProps {
  redirectTo?: string | null
  onViewChange: (view: string) => void
}

export function LoginView({ redirectTo, onViewChange }: LoginViewProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">Welcome back</h2>
        <p className="text-accent-silver text-sm mt-1">Sign in to your account</p>
      </div>

      <form action={signIn} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo ?? ''} />

        <div>
          <label className="text-sm text-accent-silver mb-1.5 block" htmlFor="login-email">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-silver/50" />
            <input
              id="login-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-9 text-white placeholder:text-accent-silver/50 focus:outline-none focus:ring-2 focus:ring-accent/50 w-full"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-accent-silver mb-1.5 block" htmlFor="login-password">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-silver/50" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-9 pr-10 text-white placeholder:text-accent-silver/50 focus:outline-none focus:ring-2 focus:ring-accent/50 w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-silver/50 hover:text-accent-silver transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <SubmitButton label="Sign in" />

        <div className="text-center">
          <button
            type="button"
            onClick={() => onViewChange('reset')}
            className="text-sm text-accent-silver hover:text-accent transition-colors"
          >
            Forgot password?
          </button>
        </div>
      </form>
    </div>
  )
}
