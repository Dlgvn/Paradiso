'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartEmptyState } from './ChartEmptyState'

interface Props {
  data: { month: string; count: number }[]
}

export function CompletionChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <ChartEmptyState
        heading="No completions yet"
        body="Mark items as completed in your library to see your progress here."
      />
    )
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <XAxis dataKey="month" stroke="#a8b4cc" tick={{ fontSize: 11 }} />
        <YAxis stroke="#a8b4cc" tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#16162a', border: '1px solid rgba(79, 124, 255, 0.3)', borderRadius: 8 }}
          labelStyle={{ color: '#a8b4cc' }}
          itemStyle={{ color: '#4f7cff' }}
        />
        <Bar dataKey="count" fill="#4f7cff" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
