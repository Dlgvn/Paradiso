import { RecommendationsSection } from '@/components/analytics/RecommendationsSection'

export default function RecommendationsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-[28px] font-[600] text-white leading-tight">Recommended for You</h1>
        <p className="text-[14px] font-[400] text-accent-silver mt-1">
          Based on your top genres and highest-rated titles
        </p>
      </header>
      <RecommendationsSection />
    </div>
  )
}
