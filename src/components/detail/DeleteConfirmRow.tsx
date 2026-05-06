'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteMediaItem } from '@/app/actions/library'
import type { MediaType } from '@/types/media'

interface DeleteConfirmRowProps {
  itemId: string
  mediaType: MediaType
  onDeleted: () => void
}

export function DeleteConfirmRow({ itemId, onDeleted }: DeleteConfirmRowProps) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <button
        className="text-[14px] font-[400] text-[#ef4444] border border-[#ef4444]/40 rounded-lg px-4 py-2 cursor-pointer hover:bg-[#ef4444]/10 transition-colors"
        onClick={() => setConfirming(true)}
      >
        Remove from library
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[14px] text-[#f1f5f9]">Remove from library?</span>
      <button
        className="text-[14px] text-[#94a3b8] cursor-pointer"
        onClick={() => setConfirming(false)}
      >
        Cancel
      </button>
      <button
        className="bg-[#ef4444] text-white text-[14px] font-[400] rounded-lg px-4 py-2 cursor-pointer disabled:opacity-50"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            onDeleted()
            const result = await deleteMediaItem(itemId)
            if (result?.error) {
              toast("Couldn't remove item. It may still be in your library.", { duration: 4000 })
            }
          })
        }}
      >
        Remove
      </button>
    </div>
  )
}
