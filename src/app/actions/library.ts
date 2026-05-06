'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { AddMediaItemInput, MediaStatus } from '@/types/media'

// ---------------------------------------------------------------------------
// Zod schemas (defined at module scope — not inside functions)
// ---------------------------------------------------------------------------

const mediaTypeSchema = z.enum(['movie', 'book', 'series'])
const mediaStatusSchema = z.enum(['watchlist', 'watching', 'completed', 'dropped'])

const addMediaItemSchema = z.object({
  externalId: z.string().min(1),
  mediaType: mediaTypeSchema,
  title: z.string().min(1),
  status: mediaStatusSchema,
  userRating: z.number().int().min(1).max(10).nullable().optional(),
  year: z.string().nullable().optional(),
  genre: z.string().nullable().optional(),
  director: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  plot: z.string().nullable().optional(),
  posterUrl: z.string().nullable().optional(),
  externalRating: z.string().nullable().optional(),
})

const updateItemStatusSchema = z.object({
  id: z.string().uuid(),
  status: mediaStatusSchema,
})

const updateItemRatingSchema = z.object({
  id: z.string().uuid(),
  rating: z.number().int().min(1).max(10).nullable(),
})

const toggleFavoriteSchema = z.object({
  id: z.string().uuid(),
  isFavorite: z.boolean(),
})

const deleteMediaItemSchema = z.object({
  id: z.string().uuid(),
})

const checkDuplicateSchema = z.object({
  externalId: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Helper: revalidate all library paths
// ---------------------------------------------------------------------------

function revalidateLibraryPaths() {
  revalidatePath('/movies')
  revalidatePath('/books')
  revalidatePath('/series')
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

export async function addMediaItem(input: AddMediaItemInput) {
  const parsed = addMediaItemSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'INVALID_INPUT', details: parsed.error.flatten() }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'UNAUTHORIZED' }
  }

  const {
    externalId,
    mediaType,
    title,
    status,
    userRating,
    year,
    genre,
    director,
    author,
    plot,
    posterUrl,
    externalRating,
  } = parsed.data

  const dateCompleted = status === 'completed' ? new Date().toISOString() : null

  const { error: insertError } = await supabase.from('media_items').insert({
    user_id: user.id,
    external_id: externalId,
    media_type: mediaType,
    title,
    status,
    user_rating: userRating ?? null,
    year: year ?? null,
    genre: genre ?? null,
    director: director ?? null,
    author: author ?? null,
    plot: plot ?? null,
    poster_url: posterUrl ?? null,
    external_rating: externalRating ?? null,
    date_completed: dateCompleted,
  })

  if (insertError) {
    if (insertError.message.includes('unique_user_item')) {
      return { error: 'DUPLICATE', existingStatus: null }
    }
    return { error: insertError.message }
  }

  revalidatePath(`/${mediaType}s`)
  return { success: true }
}

export async function updateItemStatus(id: string, status: MediaStatus) {
  const parsed = updateItemStatusSchema.safeParse({ id, status })
  if (!parsed.success) {
    return { error: 'INVALID_INPUT', details: parsed.error.flatten() }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'UNAUTHORIZED' }
  }

  const dateCompleted =
    status === 'completed'
      ? new Date().toISOString()
      : null

  const { error: updateError } = await supabase
    .from('media_items')
    .update({
      status,
      date_completed: dateCompleted,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidateLibraryPaths()
  return { success: true }
}

export async function updateItemRating(id: string, rating: number | null) {
  const parsed = updateItemRatingSchema.safeParse({ id, rating })
  if (!parsed.success) {
    return { error: 'INVALID_INPUT', details: parsed.error.flatten() }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'UNAUTHORIZED' }
  }

  const { error: updateError } = await supabase
    .from('media_items')
    .update({ user_rating: rating })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidateLibraryPaths()
  return { success: true }
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const parsed = toggleFavoriteSchema.safeParse({ id, isFavorite })
  if (!parsed.success) {
    return { error: 'INVALID_INPUT', details: parsed.error.flatten() }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'UNAUTHORIZED' }
  }

  const { error: updateError } = await supabase
    .from('media_items')
    .update({ is_favorite: isFavorite })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidateLibraryPaths()
  return { success: true }
}

export async function deleteMediaItem(id: string) {
  const parsed = deleteMediaItemSchema.safeParse({ id })
  if (!parsed.success) {
    return { error: 'INVALID_INPUT', details: parsed.error.flatten() }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'UNAUTHORIZED' }
  }

  const { error: deleteError } = await supabase
    .from('media_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  revalidateLibraryPaths()
  return { success: true }
}

export async function checkDuplicate(externalId: string) {
  const parsed = checkDuplicateSchema.safeParse({ externalId })
  if (!parsed.success) {
    return { exists: false, status: null }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { exists: false, status: null }
  }

  const { data, error } = await supabase
    .from('media_items')
    .select('id, status')
    .eq('external_id', externalId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) {
    return { exists: false, status: null }
  }

  return { exists: true, status: data.status as MediaStatus }
}
