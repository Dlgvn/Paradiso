export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center relative overflow-hidden">
      {children}
    </div>
  )
}
