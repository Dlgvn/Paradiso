'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartEmptyState } from './ChartEmptyState'

const PIE_COLORS = ['#4f7cff', '#a855f7', '#f59e0b', '#10b981', '#a8b4cc', '#6b8cff', '#c8d4e8', '#2a3f80']

interface Props {
  data: { genre: string; count: number }[]
}

export function GenreBreakdownChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <ChartEmptyState
        heading="No genre data yet"
        body="Add items with genre tags to see your breakdown."
      />
    )
  }

  // Top 8 + Other (per UI-SPEC). countGenres already returns top 10 sorted desc.
  const top8 = data.slice(0, 8)
  const rest = data.slice(8).reduce((sum, item) => sum + item.count, 0)
  const chartData = rest > 0 ? [...top8, { genre: 'Other', count: rest }] : top8

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={chartData} dataKey="count" nameKey="genre" outerRadius={100} label>
          {chartData.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#16162a', border: '1px solid rgba(79, 124, 255, 0.3)', borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ color: '#a8b4cc', fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
