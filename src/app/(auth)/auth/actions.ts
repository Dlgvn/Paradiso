'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirect') as string | null

  const supabase = await createClient()

  let errorMessage: string | null = null
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    errorMessage = error.message
  }

  if (errorMessage) {
    redirect(`/auth?error=${encodeURIComponent(errorMessage)}&view=login`)
  }

  redirect(redirectTo ?? '/movies')
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  let errorMessage: string | null = null
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) {
    errorMessage = error.message
  }

  if (errorMessage) {
    redirect(`/auth?error=${encodeURIComponent(errorMessage)}&view=signup`)
  }

  redirect('/movies')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth')
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  const supabase = await createClient()

  let errorMessage: string | null = null
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/auth?view=update-password`,
  })
  if (error) {
    errorMessage = error.message
  }

  if (errorMessage) {
    redirect(`/auth?error=${encodeURIComponent(errorMessage)}&view=reset`)
  }

  redirect('/auth?view=reset-sent')
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string

  const supabase = await createClient()

  let errorMessage: string | null = null
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    errorMessage = error.message
  }

  if (errorMessage) {
    redirect(`/auth?error=${encodeURIComponent(errorMessage)}&view=update-password`)
  }

  redirect('/movies')
}
