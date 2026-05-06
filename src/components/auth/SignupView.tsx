'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signUp } from '@/app/(auth)/auth/actions'

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

interface SignupViewProps {
  onViewChange: (view: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SignupView({ onViewChange }: SignupViewProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value
    if (password !== confirm) {
      event.preventDefault()
      setConfirmError('Passwords do not match')
    } else {
      setConfirmError(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">Create an account</h2>
        <p className="text-accent-silver text-sm mt-1">Start tracking your media library</p>
      </div>

      <form action={signUp} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-accent-silver mb-1.5 block" htmlFor="signup-email">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-silver/50" />
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-9 text-white placeholder:text-accent-silver/50 focus:outline-none focus:ring-2 focus:ring-accent/50 w-full"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-accent-silver mb-1.5 block" htmlFor="signup-password">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-silver/50" />
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="At least 6 characters"
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

        <div>
          <label className="text-sm text-accent-silver mb-1.5 block" htmlFor="signup-confirm">
            Confirm password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-silver/50" />
            <input
              id="signup-confirm"
              name="confirm"
              type={showConfirm ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Repeat your password"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-9 pr-10 text-white placeholder:text-accent-silver/50 focus:outline-none focus:ring-2 focus:ring-accent/50 w-full"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-silver/50 hover:text-accent-silver transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {confirmError && (
            <p className="mt-1.5 text-xs text-red-400">{confirmError}</p>
          )}
        </div>

        <SubmitButton label="Create account" />
      </form>
    </div>
  )
}
