'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartEmptyState } from './ChartEmptyState'

interface Props {
  data: { rating: number; count: number }[]
}

export function RatingDistributionChart({ data }: Props) {
  const total = data.reduce((sum, b) => sum + b.count, 0)
  if (total === 0) {
    return (
      <ChartEmptyState
        heading="No ratings yet"
        body="Rate items in your library to see your distribution."
      />
    )
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <XAxis dataKey="rating" stroke="#a8b4cc" tick={{ fontSize: 11 }} />
        <YAxis stroke="#a8b4cc" tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#16162a', border: '1px solid rgba(79, 124, 255, 0.3)', borderRadius: 8 }}
          labelStyle={{ color: '#a8b4cc' }}
          itemStyle={{ color: '#4f7cff' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`${value} item${value === 1 ? '' : 's'}`, 'Count']}
        />
        <Bar dataKey="count" fill="#4f7cff" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
