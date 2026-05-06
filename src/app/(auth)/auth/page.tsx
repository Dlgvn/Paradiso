import { AuthCard } from '@/components/auth/AuthCard'

type View = 'login' | 'signup' | 'reset' | 'reset-sent' | 'update-password'

interface AuthPageProps {
  searchParams: Promise<{ view?: View; error?: string; redirect?: string }>
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams
  const view = params.view ?? 'login'
  const error = params.error ?? null
  const redirectTo = params.redirect ?? null

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md px-4">
      {/* Logo + tagline */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Media Tracker</h1>
        <p className="text-accent-silver text-sm">Your entire media library, beautifully presented.</p>
      </div>

      {/* Frosted glass form card */}
      <AuthCard view={view} error={error} redirectTo={redirectTo} />
    </div>
  )
}
