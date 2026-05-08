'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { MediaStatus } from '@/types/media'
import { STATUS_LABELS } from '@/types/media'

interface DuplicateWarningDialogProps {
  open: boolean
  onClose: () => void
  onAddAnyway: () => void
  existingStatus: MediaStatus
  itemTitle: string
}

export function DuplicateWarningDialog({
  open,
  onClose,
  onAddAnyway,
  existingStatus,
  itemTitle,
}: DuplicateWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#0a0a0f] border border-[#94a3b8]/20 max-w-[360px] p-6">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-[600] text-[#f1f5f9]">
            Already in your library
          </DialogTitle>
          <DialogDescription className="text-[14px] font-[400] text-[#94a3b8] mt-1">
            &ldquo;{itemTitle}&rdquo; is already saved as{' '}
            <span className="text-[#f1f5f9]">{STATUS_LABELS[existingStatus]}</span>.{' '}
            Add it again?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row gap-2 mt-4 sm:justify-end">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-[#12121a] border border-[#94a3b8]/20 text-[#f1f5f9] text-[14px] font-[400] hover:bg-[#1e1e2e] transition-colors cursor-pointer"
          >
            Keep Existing
          </button>
          <button
            onClick={onAddAnyway}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[14px] font-[400] transition-colors cursor-pointer"
          >
            Add Anyway
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
