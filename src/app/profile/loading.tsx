/** OPT: Loading skeleton for /profile route */
export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-white/10" />
        <div className="flex-1">
          <div className="h-6 w-48 bg-white/10 rounded mb-2" />
          <div className="h-4 w-32 bg-white/10 rounded" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/10" />
        ))}
      </div>
    </div>
  )
}
