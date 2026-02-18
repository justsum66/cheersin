/** OPT: Loading skeleton for /script-murder route */
/** SM-033: Themed loading screen with cinematic vibe */
export default function ScriptMurderLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* SM-033: Cinematic header with atmosphere */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3 animate-pulse">🎭</div>
        <div className="h-8 w-56 bg-white/10 rounded mx-auto mb-3 animate-pulse" />
        <div className="h-4 w-40 bg-white/5 rounded mx-auto animate-pulse" />
      </div>
      {/* SM-028: Dark cinematic gradient overlay */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-transparent to-purple-950/10 pointer-events-none rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/10 p-4 relative overflow-hidden">
              {/* SM-028: Cinematic card shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 200}ms` }} />
              <div className="h-5 w-3/4 bg-white/10 rounded mb-3" />
              <div className="h-3 w-full bg-white/10 rounded mb-2" />
              <div className="h-3 w-2/3 bg-white/10 rounded mb-6" />
              <div className="h-8 w-24 bg-white/10 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
