'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { STATUSES_BY_TYPE, STATUS_LABELS_BY_TYPE } from '@/types/media'
import type { MediaStatus, MediaType } from '@/types/media'

interface StatusFilterProps {
  activeStatus: MediaStatus
  mediaType: MediaType
}

export function StatusFilter({ activeStatus, mediaType }: StatusFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleTabClick(status: MediaStatus) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('status', status)
    router.push(`?${params.toString()}`)
  }

  const statuses = STATUSES_BY_TYPE[mediaType]
  const labels = STATUS_LABELS_BY_TYPE[mediaType]

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 h-[24px] min-w-max">
        {statuses.map((status) => {
          const isActive = status === activeStatus
          return (
            <button
              key={status}
              onClick={() => handleTabClick(status)}
              className={`text-[14px] font-[400] px-1 pb-0.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#3b82f6] text-[#f1f5f9]'
                  : 'border-transparent text-[#f1f5f9]/60 hover:text-[#f1f5f9]/80'
              }`}
            >
              {labels[status]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
