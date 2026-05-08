'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { seedLibraryFromSupabase } from '@/lib/db/seed'

/**
 * DBSeedGate — invisible component. On mount, if the user is authenticated AND
 * navigator.onLine is true, hydrate Dexie library_items from Supabase. Idempotent
 * (bulkPut upserts), so safe to run on every page mount. Plan 06-03 will also
 * re-seed after a successful sync replay so server-side changes propagate back.
 */
export function DBSeedGate() {
  const seededRef = useRef(false)

  useEffect(() => {
    if (seededRef.current) return
    if (typeof navigator !== 'undefined' && !navigator.onLine) return
    seededRef.current = true

    const run = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await seedLibraryFromSupabase(user.id)
      } catch (err) {
        // Non-fatal: offline reads will return empty until next successful seed.
        // eslint-disable-next-line no-console
        console.warn('[DBSeedGate] seed failed:', err)
      }
    }
    void run()
  }, [])

  return null
}
