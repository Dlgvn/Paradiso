export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[2/3] rounded-lg bg-[#12121a] animate-pulse backdrop-blur-[4px]"
        />
      ))}
    </div>
  )
}
