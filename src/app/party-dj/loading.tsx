/** OPT: Loading skeleton for /party-dj route */
export default function PartyDjLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 w-48 bg-white/10 rounded mb-4" />
      <div className="h-4 w-64 bg-white/10 rounded mb-8" />
      <div className="h-64 rounded-2xl bg-white/5 border border-white/10 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-xl bg-white/5 border border-white/10" />
        ))}
      </div>
    </div>
  )
}
