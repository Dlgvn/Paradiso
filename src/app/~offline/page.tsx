// Serwist navigation fallback: rendered when the user navigates to a route
// that isn't precached and the network is unreachable. No client logic —
// pure server-rendered shell so it works without JS hydration.
export const dynamic = 'force-static'

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-base text-white px-6 text-center">
      <div className="max-w-md flex flex-col items-center gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">You&apos;re offline</h1>
        <p className="text-accent-silver">
          This page isn&apos;t available without an internet connection.
          Your library is still accessible — head back to your collection.
        </p>
        <a
          href="/movies"
          className="mt-2 inline-flex items-center justify-center rounded-xl bg-accent/20 px-4 py-2 text-accent hover:bg-accent/30 transition-colors"
        >
          Back to library
        </a>
      </div>
    </main>
  )
}
