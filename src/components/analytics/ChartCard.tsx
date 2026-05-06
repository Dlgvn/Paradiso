import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
}

export function ChartCard({ title, children }: Props) {
  return (
    <div className="rounded-2xl bg-base-elevated border border-accent-silver/10 p-6">
      <h2 className="text-[20px] font-[600] text-white mb-4">{title}</h2>
      {children}
    </div>
  )
}
