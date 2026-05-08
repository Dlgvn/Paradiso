interface GenrePillsProps {
  genre: string | null
}

export function GenrePills({ genre }: GenrePillsProps) {
  if (!genre || !genre.trim()) return null

  const tags = genre.split(',').map((g) => g.trim()).filter(Boolean)

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white/80"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
