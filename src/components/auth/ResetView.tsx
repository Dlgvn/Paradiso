'use client'

import { useFormStatus } from 'react-dom'
import { Mail, Loader2 } from 'lucide-react'
import { resetPassword } from '@/app/(auth)/auth/actions'

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

interface ResetViewProps {
  onViewChange: (view: string) => void
  resetSent?: boolean
}

export function ResetView({ onViewChange, resetSent = false }: ResetViewProps) {
  if (resetSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Mail size={24} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Check your inbox</h2>
            <p className="text-accent-silver text-sm mt-1">
              We&apos;ve sent a password reset link to your email address.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onViewChange('login')}
          className="text-sm text-accent hover:underline font-medium"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">Reset password</h2>
        <p className="text-accent-silver text-sm mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form action={resetPassword} className="space-y-4">
        <div>
          <label className="text-sm text-accent-silver mb-1.5 block" htmlFor="reset-email">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-silver/50" />
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-9 text-white placeholder:text-accent-silver/50 focus:outline-none focus:ring-2 focus:ring-accent/50 w-full"
            />
          </div>
        </div>

        <SubmitButton label="Send reset link" />
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={() => onViewChange('login')}
          className="text-sm text-accent-silver hover:text-accent transition-colors"
        >
          Back to login
        </button>
      </div>
    </div>
  )
}
