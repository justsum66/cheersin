# PHASE 5: Pre-Launch 500-Task Optimization Plan

**Project:** Cheersin  
**Baseline Commit:** `d3f4243`  
**Codebase:** 862 TS/TSX files, 158 game components, 64 test files  
**Date:** 2026-02-17  

---

## Section 1: Homepage UX/UI (HP-001 ~ HP-050)

### P0 Critical (HP-001 ~ HP-010)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| HP-001 | HeroSection: wrap confetti() in try-catch to prevent crash on unsupported browsers | HeroSection.tsx | No uncaught errors on Safari iOS 14 |
| HP-002 | HeroSection: add `will-change: transform` to parallax layers, remove on scroll-end | HeroSection.tsx | No jank on mid-range Android |
| HP-003 | HeroSection: replace hardcoded CTA text fallback with full i18n keys | HeroSection.tsx, home-copy.ts | All CTA text from i18n |
| HP-004 | HomePageClient: add ErrorBoundary around each section to isolate failures | HomePageClient.tsx | Single section crash does not kill page |
| HP-005 | HeroSection: lazy-load canvas-confetti with dynamic import | HeroSection.tsx | confetti not in initial bundle |
| HP-006 | Add preload hints for above-fold hero image and brand logo | HeroSection.tsx, layout.tsx | LCP image has `<link rel=preload>` |
| HP-007 | SocialProofSection: add proper aria-label and role=region | SocialProofSection.tsx | axe-core passes |
| HP-008 | HomeFooter: add keyboard navigation for floating CTA buttons | HomeFooter.tsx | Tab + Enter triggers action |
| HP-009 | HomeFAQ: convert to semantic `<details>`/`<summary>` for native a11y | HomeFAQ.tsx, HomeFAQAccordion.tsx | Works without JS |
| HP-010 | HomeTestimonials: add pause-on-hover for carousel, respect prefers-reduced-motion | HomeTestimonialsCarousel.tsx | Animation pauses on hover/reduced-motion |

### P1 High ROI (HP-011 ~ HP-030)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| HP-011 | HeroPersonaSection: optimize skew animation with GPU compositing | HeroPersonaSection.tsx | 60fps on iPhone SE |
| HP-012 | StorySection: add staggered reveal animation with IntersectionObserver | StorySection.tsx | Elements animate only when visible |
| HP-013 | FeaturesSection: add micro-interaction on feature card hover | FeaturesSection.tsx | Scale + shadow on hover |
| HP-014 | RoiSection: animate counter numbers on scroll-into-view | RoiSection.tsx | Numbers count up smoothly |
| HP-015 | HomePartnerMarquee: add aria-hidden on decorative marquee, pause button | HomePartnerMarquee.tsx | a11y compliant |
| HP-016 | HomeFeaturedGames: add skeleton loader during data fetch | HomeFeaturedGames.tsx | Skeleton shown while loading |
| HP-017 | HeroSection: implement responsive font scaling for CJK vs Latin | HeroSection.tsx | No text overflow on any locale |
| HP-018 | HomeFooter: add email validation with inline error message | HomeFooter.tsx | Invalid email shows error |
| HP-019 | SocialProofSection: add structured data (JSON-LD) for reviews | SocialProofSection.tsx, HomePageJsonLd.tsx | Google rich result test passes |
| HP-020 | Home page: add skip-to-content link as first focusable element | HomePageClient.tsx | Screen reader can skip nav |
| HP-021 | HeroSection: add WebP/AVIF srcSet for hero background image | HeroSection.tsx | Modern formats served first |
| HP-022 | HomeTestimonials: add swipe gesture support for mobile carousel | HomeTestimonialsCarousel.tsx | Swipe left/right works |
| HP-023 | HomeFAQ: prefetch FAQ data with ISR, add loading skeleton | HomeFAQServer.tsx, HomeFAQSkeleton.tsx | No layout shift |
| HP-024 | Home page: add scroll-to-top floating button after 2 screens | HomePageClient.tsx | Button appears/disappears smoothly |
| HP-025 | HostPersonaSection: add crown icon entrance animation with delay | HostPersonaSection.tsx | Crown bounces in after section visible |
| HP-026 | Home page: implement progressive image loading (blur-up) | All home image components | Blur placeholder -> sharp image |
| HP-027 | HomeFooter: add social link hover effects with brand colors | HomeFooter.tsx | Each icon gets brand-specific color |
| HP-028 | Home page: add page-level performance monitoring with web-vitals | HomePageClient.tsx | LCP/FID/CLS reported |
| HP-029 | HeroSection: add particle effect cleanup on unmount | HeroSection.tsx | No memory leak |
| HP-030 | Home page: compress all hero images to WebP <100KB | public/images/ | All hero images <100KB |

### P2 Polish (HP-031 ~ HP-050)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| HP-031 | Add smooth scroll behavior between home sections | HomePageClient.tsx | CSS scroll-behavior: smooth |
| HP-032 | Add loading shimmer effect to all home section cards | home.css | Shimmer animation on load |
| HP-033 | HeroSection: add seasonal theme variants (CNY, Halloween, Christmas) | HeroSection.tsx, home.config.ts | Theme auto-switches by date |
| HP-034 | Add breadcrumb structured data for homepage | HomePageJsonLd.tsx | Schema.org breadcrumb valid |
| HP-035 | HomeTestimonials: add "Write a review" CTA for logged-in users | HomeTestimonials.tsx | CTA links to review form |
| HP-036 | HomeFeaturedGames: add "Trending" badge for popular games | HomeFeaturedGames.tsx | Badge shows on top 3 games |
| HP-037 | Add animated gradient border to premium CTA buttons | home.css | Gradient animates on hover |
| HP-038 | Home page: add cookie consent banner (GDPR) | HomePageClient.tsx | Banner shown to EU users |
| HP-039 | SocialProofSection: add real-time user count indicator | SocialProofSection.tsx | "X users online" updates |
| HP-040 | Home page: add print stylesheet | home.css | Clean print layout |
| HP-041 | Add Open Graph meta tags per section for social sharing | HomePageJsonLd.tsx | og:image per section |
| HP-042 | Home page: add dark mode specific hero variant | HeroSection.tsx, home.css | Different visual in dark mode |
| HP-043 | Add page transition animation between home and sub-pages | HomePageClient.tsx | Smooth fade/slide transition |
| HP-044 | HomeFAQ: add search/filter for FAQ items | HomeFAQ.tsx | Type to filter questions |
| HP-045 | HomeFooter: add language selector in footer area | HomeFooter.tsx | Switch locale from footer |
| HP-046 | Add micro-animation to Cheersin brand logo on page load | HeroSection.tsx | Logo has subtle entrance |
| HP-047 | Home page: preconnect to external domains (Supabase, PayPal) | layout.tsx | `<link rel=preconnect>` present |
| HP-048 | Add visual indicator for current scroll position (progress bar) | HomePageClient.tsx | Thin bar at top shows progress |
| HP-049 | Home page: add A/B test framework for hero CTA variants | HeroSection.tsx | 2 variants with tracking |
| HP-050 | Home page: audit and remove unused CSS from home.css | home.css | File size reduced >20% |

---

## Section 2: Navigation Bar (NAV-001 ~ NAV-025)

### P0 Critical (NAV-001 ~ NAV-008)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| NAV-001 | Fix route matching: use `startsWith` for dynamic routes like `/learn/[courseId]` | Navigation.tsx | Active state works on all sub-routes |
| NAV-002 | Add `aria-current="page"` to active nav link | Navigation.tsx | Screen reader announces current page |
| NAV-003 | Fix mobile menu: add proper focus trap when open | Navigation.tsx | Tab cycling stays within menu |
| NAV-004 | Add Escape key handler to close mobile menu | Navigation.tsx | Escape closes menu |
| NAV-005 | Fix nav z-index conflicts with game modals and overlays | Navigation.tsx, nav.config.ts | Nav never covers game UI |
| NAV-006 | Replace hardcoded color values with Tailwind design tokens | Navigation.tsx | No hex/rgb literals in component |
| NAV-007 | Memoize scroll handler with useCallback + throttle | Navigation.tsx | No re-renders on every scroll pixel |
| NAV-008 | Add nav role="navigation" and aria-label | Navigation.tsx | Landmark navigation identified |

### P1 High ROI (NAV-009 ~ NAV-018)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| NAV-009 | Add keyboard shortcut hints in nav tooltip (Alt+G for Games etc.) | Navigation.tsx | Tooltips show shortcuts |
| NAV-010 | Optimize nav re-renders: split into NavDesktop + NavMobile sub-components | Navigation.tsx | React Profiler shows fewer renders |
| NAV-011 | Add smooth height transition for compact mode on scroll | Navigation.tsx | Height animates, no jump |
| NAV-012 | UserMenu: add subscription badge with tier-specific colors | UserMenu.tsx | Free=grey, Pro=gold, Premium=diamond |
| NAV-013 | NotificationPanel: add badge count with real-time updates | NotificationPanel.tsx | Badge shows unread count |
| NAV-014 | ThemeControls: add transition animation between theme switches | ThemeControls.tsx | Smooth icon morph on switch |
| NAV-015 | Add breadcrumb trail below nav for deep pages | Navigation.tsx | Breadcrumb on learn/game pages |
| NAV-016 | Footer.tsx: add consistent navigation links matching main nav | Footer.tsx | Footer nav mirrors main nav |
| NAV-017 | Sidebar: add collapsible section groups with memory | Sidebar.tsx | Collapsed state persists |
| NAV-018 | NavHiddenEffect: fix edge case where nav stays hidden after leaving games | NavHiddenEffect.tsx | Nav always visible on non-game pages |

### P2 Polish (NAV-019 ~ NAV-025)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| NAV-019 | Add nav item hover micro-animation (underline slide) | Navigation.tsx | Underline slides from left |
| NAV-020 | Add mobile bottom tab bar as alternative navigation | Navigation.tsx | Bottom tabs on mobile |
| NAV-021 | Add command palette (Cmd+K) for power users | New: CommandPalette.tsx | Quick nav to any page |
| NAV-022 | Add nav analytics: track which nav items are clicked most | Navigation.tsx | Click events sent to analytics |
| NAV-023 | Add subtle backdrop blur effect to transparent nav | Navigation.tsx | Glass-morphism effect |
| NAV-024 | Add animated notification bell icon when new notification | NotificationPanel.tsx | Bell wobbles on new notification |
| NAV-025 | Add seasonal nav decoration (e.g., snowflakes in winter) | Navigation.tsx | Decoration auto-applies by date |

---

## Section 3: PWA (PWA-001 ~ PWA-030)

### P0 Critical (PWA-001 ~ PWA-008)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| PWA-001 | **Remove `export {}` from sw.js** - causes SyntaxError in classic SW scope | public/sw.js:322 | SW registers without error |
| PWA-002 | Add offline fallback page pre-caching with proper assets | sw.js, offline.html | Offline page shows with logo/styling |
| PWA-003 | Add SW registration with update prompt in app layout | New: sw-register.ts, layout.tsx | "Update available" toast shown |
| PWA-004 | Add install prompt (beforeinstallprompt) with custom UI | New: InstallPrompt.tsx | Custom install banner on mobile |
| PWA-005 | Fix SW cache-first strategy: add cache-busting for HTML pages | sw.js | HTML never served stale |
| PWA-006 | Add manifest screenshots with proper narrow/wide dimensions | manifest.ts, public/sizes/ | Install preview shows screenshots |
| PWA-007 | Add SW error recovery: catch failed cache.addAll and continue | sw.js | SW installs even if one asset 404s |
| PWA-008 | Add Content-Security-Policy header allowing SW scope | next.config.ts, vercel.json | CSP does not block SW |

### P1 High ROI (PWA-009 ~ PWA-020)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| PWA-009 | Implement background sync for failed form submissions | sw.js | Forms retry when back online |
| PWA-010 | Add periodic background sync for course progress | sw.js | Progress syncs every 12h |
| PWA-011 | Implement push notification subscription flow | New: push-subscription.ts | User can subscribe to notifications |
| PWA-012 | Add app badge API for unread notification count | New: badge-api.ts | Home screen badge shows count |
| PWA-013 | Cache game assets separately with longer TTL | sw.js | Game images cached for 30 days |
| PWA-014 | Add offline indicator banner when connection lost | New: OfflineIndicator.tsx | Yellow banner: "You're offline" |
| PWA-015 | Implement cache storage quota management | sw.js | Warn user when >50MB cached |
| PWA-016 | Add SW version check and auto-update mechanism | sw.js, sw-register.ts | Old SW auto-replaced |
| PWA-017 | Optimize manifest icons: add monochrome icon for Android | manifest.ts, public/sizes/ | Monochrome icon for themed shortcuts |
| PWA-018 | Add share target API for receiving shared content | manifest.ts | App appears in share sheet |
| PWA-019 | Implement navigation preload for faster SW responses | sw.js | Navigation requests use preload |
| PWA-020 | Add offline game mode for select single-player games | sw.js, game components | 5 games playable offline |

### P2 Polish (PWA-021 ~ PWA-030)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| PWA-021 | Add splash screen customization per platform | manifest.ts | Custom splash on iOS/Android |
| PWA-022 | Implement protocol handler for cheersin:// deep links | manifest.ts | Deep links open PWA |
| PWA-023 | Add file handler for .cheersin game save files | manifest.ts | Opening file launches app |
| PWA-024 | Implement declarative link capturing | manifest.ts | Links open in PWA not browser |
| PWA-025 | Add window controls overlay for desktop PWA | manifest.ts | Custom titlebar on desktop |
| PWA-026 | Optimize SW with Workbox for production build | package.json, next.config.ts | Workbox handles caching |
| PWA-027 | Add PWA install analytics tracking | InstallPrompt.tsx | Track install/dismiss rates |
| PWA-028 | Implement partial offline support for course reading | sw.js | Cached courses readable offline |
| PWA-029 | Add network quality detection and adaptive loading | New: network-quality.ts | Low bandwidth = lower quality assets |
| PWA-030 | Add "Add to Home Screen" tutorial overlay for iOS | InstallPrompt.tsx | Step-by-step iOS install guide |

---

## Section 4: PayPal Module (PAY-001 ~ PAY-030)

### P0 Critical (PAY-001 ~ PAY-008)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| PAY-001 | Add webhook signature verification for non-production environments | route.ts (webhooks/paypal) | Verification works in staging |
| PAY-002 | Add retry logic with exponential backoff for failed Supabase writes | route.ts | Retries 3x before failing |
| PAY-003 | Add dead-letter queue for unprocessable webhook events | route.ts | Failed events stored for manual review |
| PAY-004 | Add rate limiting to webhook endpoint | route.ts | Max 100 req/min |
| PAY-005 | Add webhook event replay mechanism for missed events | New: webhook-replay.ts | Manual replay from PayPal dashboard |
| PAY-006 | Add comprehensive error logging with structured format | route.ts | Errors include event_id, type, timestamp |
| PAY-007 | Add subscription status sync job for drift detection | New: subscription-sync.ts | Daily sync with PayPal API |
| PAY-008 | Add email notification templates with proper branding | Email templates | Branded HTML emails |

### P1 High ROI (PAY-009 ~ PAY-020)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| PAY-009 | Add subscription upgrade/downgrade flow UI | New: SubscriptionManage.tsx | User can change tier |
| PAY-010 | Add payment history page for users | New: PaymentHistory.tsx | Shows all transactions |
| PAY-011 | Add grace period handling for failed payments | route.ts | 3-day grace before downgrade |
| PAY-012 | Add proration calculation for mid-cycle upgrades | route.ts | Correct proration amount |
| PAY-013 | Add coupon/promo code system | New: promo-code.ts | Codes apply discount |
| PAY-014 | Add subscription analytics dashboard for admin | New: admin/subscriptions.tsx | Charts for MRR, churn, LTV |
| PAY-015 | Add refund request flow with automated processing | New: RefundRequest.tsx | Users can request refund |
| PAY-016 | Add PayPal sandbox toggle for testing | .env, route.ts | Easy switch between sandbox/live |
| PAY-017 | Add subscription renewal reminder email (3 days before) | New: renewal-reminder.ts | Email sent before renewal |
| PAY-018 | Add failed payment recovery email sequence | New: payment-recovery.ts | 3-email sequence for failed payments |
| PAY-019 | Add invoice generation for paid subscriptions | New: invoice.ts | PDF invoice per payment |
| PAY-020 | Add subscription tier comparison page | New: PricingCompare.tsx | Side-by-side tier features |

### P2 Polish (PAY-021 ~ PAY-030)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| PAY-021 | Add annual billing option with discount | Pricing components | Annual = 2 months free |
| PAY-022 | Add team/group subscription pricing | New: team-pricing.ts | Bulk discount for groups |
| PAY-023 | Add subscription gifting flow | New: GiftSubscription.tsx | Gift a subscription to friend |
| PAY-024 | Add referral reward system (refer = free month) | New: referral.ts | Referral tracking and rewards |
| PAY-025 | Add PayPal button loading skeleton | Pricing components | Skeleton while PayPal loads |
| PAY-026 | Add currency auto-detection by locale | Pricing components | Show local currency |
| PAY-027 | Add subscription pause feature | route.ts, UI | Pause for 1-3 months |
| PAY-028 | Add exit survey on cancellation | New: ExitSurvey.tsx | Collect cancellation reason |
| PAY-029 | Add win-back email for churned subscribers | New: winback.ts | Discount offer after 30 days |
| PAY-030 | Add lifetime deal option for early adopters | Pricing components | One-time payment option |

---

## Section 5: Games Page & Modules (GAME-001 ~ GAME-120)

### 5A: Game Reduction Evaluation (GAME-001 ~ GAME-010)
| ID | Priority | Description | Files | Acceptance |
|---|---|---|---|---|
| GAME-001 | P0 | Audit all 110+ games: categorize as Core / Niche / Deprecated | games.config.ts | Category assigned to each game |
| GAME-002 | P0 | Define "Core 45" game list based on uniqueness, engagement potential | games.config.ts | 45 games marked as core |
| GAME-003 | P0 | Move deprecated games to archive (not delete) with redirect | GameLazyMap.tsx | Archived games show "coming back" |
| GAME-004 | P1 | Add game popularity tracking (play count, completion rate) | games.config.ts, analytics | Metrics per game |
| GAME-005 | P1 | Create game retirement criteria (played <10 times in 30 days) | Documentation | Criteria documented |
| GAME-006 | P1 | Add "Request a Game" feature for user suggestions | New: GameRequest.tsx | Form submission works |
| GAME-007 | P2 | Add game versioning system for iterative improvements | games.config.ts | Version field per game |
| GAME-008 | P2 | Create game quality score algorithm (UX, uniqueness, fun factor) | New: game-quality.ts | Score 1-100 per game |
| GAME-009 | P2 | Add A/B test framework for game variants | games.config.ts | 2 variants per game testable |
| GAME-010 | P2 | Build game sunset notification for archived games | GameLazyMap.tsx | Users notified before removal |

### 5B: Games Page UI (GAME-011 ~ GAME-040)
| ID | Priority | Description | Files | Acceptance |
|---|---|---|---|---|
| GAME-011 | P0 | Fix game card grid responsive breakpoints (1/2/3/4 columns) | GamesPageClient.tsx | Clean grid on all breakpoints |
| GAME-012 | P0 | Add proper loading states for game lazy imports | GameLazyMap.tsx | Skeleton shown during load |
| GAME-013 | P0 | Fix search/filter: add debounce to search input | GamesPageClient.tsx | 300ms debounce on search |
| GAME-014 | P0 | Add category filter chips with active state | GamesPageClient.tsx | Chips highlight when active |
| GAME-015 | P1 | Add game preview tooltip on hover (desktop) | Game card components | Preview shows on hover |
| GAME-016 | P1 | Add "Recently Played" section at top of games page | GamesPageClient.tsx | Last 5 games shown |
| GAME-017 | P1 | Add "Recommended for You" section based on play history | GamesPageClient.tsx | Personalized recommendations |
| GAME-018 | P1 | Add game difficulty indicator (Easy/Medium/Hard) | games.config.ts, Game cards | Difficulty badge on cards |
| GAME-019 | P1 | Add player count indicator (Solo/2-4/4-8/8+) | games.config.ts, Game cards | Player count shown |
| GAME-020 | P1 | Add "New" badge for games added in last 14 days | games.config.ts, Game cards | Badge auto-expires |
| GAME-021 | P1 | Add game tutorial/how-to-play modal for each game | Game components | Tutorial accessible from game |
| GAME-022 | P1 | Add lobby UI animation improvements (card flip entrance) | Lobby.tsx | Cards animate in |
| GAME-023 | P1 | Add share game link with deep link support | Game components | Share URL opens specific game |
| GAME-024 | P2 | Add game favorites/bookmarks with persistent storage | GamesPageClient.tsx | Heart icon saves to favorites |
| GAME-025 | P2 | Add sort options (A-Z, popularity, newest, difficulty) | GamesPageClient.tsx | Sort dropdown works |
| GAME-026 | P2 | Add game collection/playlist feature | New: GamePlaylist.tsx | Users create game playlists |
| GAME-027 | P2 | Add game rating system (1-5 stars after play) | Game components | Rating prompt after game |
| GAME-028 | P2 | Add infinite scroll or pagination for game list | GamesPageClient.tsx | Smooth loading of games |
| GAME-029 | P2 | Add game comparison view (compare 2 games side by side) | New: GameCompare.tsx | Select 2 games to compare |
| GAME-030 | P2 | Add animated category icons | GamesPageClient.tsx | Icons animate on filter |
| GAME-031 | P2 | Add empty state illustrations for no search results | GamesPageClient.tsx | Friendly empty state |
| GAME-032 | P2 | Add game screenshot gallery in game detail | Game components | Screenshots in detail view |
| GAME-033 | P2 | Add keyboard navigation for game grid | GamesPageClient.tsx | Arrow keys navigate grid |
| GAME-034 | P2 | Add URL state sync for filters (back button preserves filter) | GamesPageClient.tsx | Filters in URL params |
| GAME-035 | P2 | Add game card flip animation on selection | Game card components | Card flips on click |
| GAME-036 | P2 | Add "Surprise Me" random game selector button | GamesPageClient.tsx | Button picks random game |
| GAME-037 | P2 | Add party mode quick-start (auto-select 5 games for party) | GamesPageClient.tsx | One-click party setup |
| GAME-038 | P2 | Add game timer integration for time-limited games | Game components | Visual countdown timer |
| GAME-039 | P2 | Add sound effects toggle for games with audio | Game components | Sound on/off button |
| GAME-040 | P2 | Add game session history log | Game components | History of past sessions |

### 5C: Per-Game Optimizations (GAME-041 ~ GAME-120) - 2 tasks per top 40 games
| ID | Priority | Game | Task 1 | Task 2 |
|---|---|---|---|---|
| GAME-041/042 | P1 | TruthOrDare | Add custom dare creation | Add difficulty tiers |
| GAME-043/044 | P1 | Roulette | Add custom wheel segments | Add spin physics animation |
| GAME-045/046 | P1 | NeverHaveIEver | Add voting on shared screens | Add category quick-switch |
| GAME-047/048 | P1 | WhoMostLikely | Add photo upload for players | Add result sharing card |
| GAME-049/050 | P1 | SecretReveal | Add anonymous mode | Add timed reveal mechanic |
| GAME-051/052 | P1 | Dice/DiceWar | Add 3D dice animation | Add custom dice faces |
| GAME-053/054 | P1 | Blackjack | Add betting with virtual chips | Add dealer AI difficulty |
| GAME-055/056 | P1 | CoinFlip | Add streak counter | Add wagering mode |
| GAME-057/058 | P1 | DrawGuess | Add color picker tool | Add replay animation |
| GAME-059/060 | P1 | BuzzGame | Add custom buzz words | Add leaderboard |
| GAME-061/062 | P1 | CategoryChain | Add timer pressure mode | Add hint system |
| GAME-063/064 | P1 | CocktailMix | Add recipe sharing | Add ingredient animation |
| GAME-065/066 | P1 | ComplimentBattle | Add voting mechanic | Add crown for winner |
| GAME-067/068 | P1 | DanceBattle | Add music integration | Add move cards |
| GAME-069/070 | P1 | DareCards | Add card flip animation | Add dare rating |
| GAME-071/072 | P1 | Telephone | Add drawing mode | Add reveal animation |
| GAME-073/074 | P1 | ToastRelay | Add custom toast creation | Add speech bubble UI |
| GAME-075/076 | P1 | BaskinRobbins31 | Add undo button | Add score tracking |
| GAME-077/078 | P1 | BeerPongVR | Add throw physics | Add cup arrangement editor |
| GAME-079/080 | P1 | Bluffing | Add card reveal animation | Add bluff detection score |
| GAME-081/082 | P2 | BalanceGame | Add tilt animation | Add difficulty curve |
| GAME-083/084 | P2 | BetweenCards | Add card dealing animation | Add streak bonus |
| GAME-085/086 | P2 | BottleCap | Add flip physics | Add challenge mode |
| GAME-087/088 | P2 | ColorBlind | Add color-blind safe mode | Add progressive difficulty |
| GAME-089/090 | P2 | CoupleTest | Add compatibility score | Add sharing card |
| GAME-091/092 | P2 | Countdown321 | Add visual countdown effect | Add penalty system |
| GAME-093/094 | P2 | DareDice | Add custom dare bank | Add re-roll animation |
| GAME-095/096 | P2 | AlcoholTrivia | Add explanation after answer | Add difficulty levels |
| GAME-097/098 | P2 | AnimeQuiz | Add image hints | Add series filter |
| GAME-099/100 | P2 | CustomGamePlayer | Add template sharing | Add saved games list |
| GAME-101/102 | P2 | KingsCup | Add custom rules editor | Add rule reminder popup |
| GAME-103/104 | P2 | Mafia | Add role card animation | Add night phase timer |
| GAME-105/106 | P2 | MindReader | Add score history | Add streak bonus |
| GAME-107/108 | P2 | PhotoPose | Add camera integration | Add pose timer |
| GAME-109/110 | P2 | RapBattle | Add beat player | Add audience voting |
| GAME-111/112 | P2 | SpeedQuiz | Add buzzer sound | Add custom questions |
| GAME-113/114 | P2 | StoryBuilder | Add AI story continuation | Add illustration |
| GAME-115/116 | P2 | Taboo | Add custom word packs | Add skip penalty |
| GAME-117/118 | P2 | Werewolf | Add narrator auto-script | Add daylight voting UI |
| GAME-119/120 | P2 | WordChain | Add dictionary validation | Add bonus words |

---

## Section 6: Script Murder (SM-001 ~ SM-040)

### P0 Critical (SM-001 ~ SM-010)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| SM-001 | Fix WebSocket reconnection on mobile sleep/wake | ScriptMurderRoom.tsx | Auto-reconnects after sleep |
| SM-002 | Add session recovery from sessionStorage on page refresh | ScriptMurderPlay.tsx | State preserved on refresh |
| SM-003 | Add proper error boundary around game phases | ScriptMurderPage.tsx | Phase error doesn't crash app |
| SM-004 | Fix polling fallback: reduce from 5s to 2s for critical events | ScriptMurderRoom.tsx | Faster updates when WS fails |
| SM-005 | Add player disconnect/reconnect handling | ScriptMurderRoom.tsx | Disconnected player shown with indicator |
| SM-006 | Add room code validation and expiry (24h) | ScriptMurderRoom.tsx | Expired rooms show message |
| SM-007 | Add minimum player count enforcement before start | ScriptMurderRoom.tsx | Can't start with <3 players |
| SM-008 | Add script content loading optimization (lazy per chapter) | ScriptMurderPlay.tsx | Only current chapter loaded |
| SM-009 | Add proper TypeScript types for all game state transitions | Type files | No `any` types in SM module |
| SM-010 | Add rate limiting for room creation (max 3/hour for free) | API routes | Free users limited |

### P1 High ROI (SM-011 ~ SM-025)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| SM-011 | Add atmospheric background music per script theme | ScriptMurderPlay.tsx | Music plays during game |
| SM-012 | Add character avatar selection UI | ScriptMurderRoom.tsx | Players pick avatars |
| SM-013 | Add clue reveal animation (flip card effect) | ScriptMurderPlay.tsx | Clues flip to reveal |
| SM-014 | Add voting UI for suspect accusation phase | ScriptMurderPlay.tsx | Visual voting interface |
| SM-015 | Add game timeline visualization | ScriptMurderPlay.tsx | Timeline of events shown |
| SM-016 | Add private messaging between players | ScriptMurderPlay.tsx | 1:1 in-game chat |
| SM-017 | Add script difficulty rating and estimated play time | Script data | Rating shown before start |
| SM-018 | Add game recap/summary at end with key moments | ScriptMurderPlay.tsx | Summary screen at end |
| SM-019 | Add host/narrator tools (advance phase, manage players) | ScriptMurderPlay.tsx | Host control panel |
| SM-020 | Add text-to-speech for narration sections | ScriptMurderPlay.tsx | TTS button for story text |
| SM-021 | Add more script themes (3 new scripts) | Script data files | 3 new playable scripts |
| SM-022 | Add player notes/notepad during game | ScriptMurderPlay.tsx | Personal notes persistent |
| SM-023 | Add evidence board (pin clues, connect with strings) | New: EvidenceBoard.tsx | Interactive evidence board |
| SM-024 | Add spectator mode for watchers | ScriptMurderRoom.tsx | Read-only spectator view |
| SM-025 | Add game photo sharing at end (group selfie prompt) | ScriptMurderPlay.tsx | Photo prompt at game end |

### P2 Polish (SM-026 ~ SM-040)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| SM-026 | Add character relationship diagram | ScriptMurderPlay.tsx | Visual relationship map |
| SM-027 | Add sound effects for key moments (reveal, vote, etc.) | ScriptMurderPlay.tsx | SFX on interactions |
| SM-028 | Add dark cinematic UI theme for gameplay | Script murder CSS | Immersive dark theme |
| SM-029 | Add achievement system for script murder | New: sm-achievements.ts | Badges for completions |
| SM-030 | Add script creation tool for user-generated content | New: ScriptEditor.tsx | Users can create scripts |
| SM-031 | Add replay/playback of past games | New: sm-replay.ts | Review past game sessions |
| SM-032 | Add QR code for quick room join on mobile | ScriptMurderRoom.tsx | QR code displayed for join |
| SM-033 | Add loading screen with script theme artwork | ScriptMurderPage.tsx | Themed loading screen |
| SM-034 | Add character voice customization | ScriptMurderPlay.tsx | Voice pitch/style options |
| SM-035 | Add multi-language script support | Script data | Scripts in zh-TW, en, ja |
| SM-036 | Add game pacing suggestions for host | ScriptMurderPlay.tsx | "Consider moving to next phase" |
| SM-037 | Add script rating and review after completion | ScriptMurderPlay.tsx | Rate the script 1-5 stars |
| SM-038 | Add scene illustration for each chapter | Script data, assets | Art per chapter |
| SM-039 | Add ambient sound effects (rain, thunder, etc.) | ScriptMurderPlay.tsx | Ambient sounds per scene |
| SM-040 | Add "Previously on..." recap between sessions | ScriptMurderPlay.tsx | Recap of previous chapters |

---

## Section 7: Course Content & Layout (LEARN-001 ~ LEARN-050)

### P0 Critical (LEARN-001 ~ LEARN-010)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| LEARN-001 | Reorganize learn components into subdirectories (ui/, data/, hooks/) | src/app/learn/components/ | Clean directory structure |
| LEARN-002 | Fix LearnCourseContent: split 105KB file into chapter/quiz/progress modules | LearnCourseContent.tsx | No file >500 lines |
| LEARN-003 | Add proper error boundaries per course section | Course components | Section error isolated |
| LEARN-004 | Fix course page loading: add Suspense with skeleton | page.tsx, loading.tsx | Skeleton during data fetch |
| LEARN-005 | Consolidate learn-curriculum.ts, learn-config.ts, learn-reading-list.ts | Config files | Single source of truth |
| LEARN-006 | Fix course progress persistence across sessions | Progress hooks | Progress survives logout |
| LEARN-007 | Add proper TypeScript types for all course data structures | Type files | No `any` in learn module |
| LEARN-008 | Fix mobile layout: course sidebar overlaps content on small screens | Course CSS | Sidebar collapses on mobile |
| LEARN-009 | Add course search with full-text indexing | page.tsx | Search finds courses by content |
| LEARN-010 | Fix quiz component: add proper validation and error states | Quiz components | Quiz validates before submit |

### P1 High ROI (LEARN-011 ~ LEARN-030)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| LEARN-011 | Add reading progress bar at top of course pages | Course components | Thin progress bar visible |
| LEARN-012 | Add chapter navigation sidebar with progress indicators | Course components | Checkmarks on completed chapters |
| LEARN-013 | Add bookmark/highlight feature for course content | Course components | Users can bookmark sections |
| LEARN-014 | Add estimated reading time per chapter | Course data | "5 min read" shown |
| LEARN-015 | Add course completion certificate generation | New: certificate/ | PDF certificate on completion |
| LEARN-016 | Add spaced repetition quiz system for review | New: spaced-repetition.ts | Review quizzes at intervals |
| LEARN-017 | Add course recommendation engine based on completed courses | page.tsx | "You might also like" section |
| LEARN-018 | Add note-taking feature within courses | New: CourseNotes.tsx | Notes per chapter persistent |
| LEARN-019 | Add audio narration option for course content | Course components | TTS button per chapter |
| LEARN-020 | Add interactive wine tasting note form in relevant courses | Course components | Tasting note form in tasting courses |
| LEARN-021 | Add course difficulty progression (beginner -> advanced path) | page.tsx | Learning path visualization |
| LEARN-022 | Add daily learning goal and streak tracking | daily/ components | "5 lessons today" goal |
| LEARN-023 | Add flashcard mode for key terms in each course | New: Flashcards.tsx | Swipeable flashcards |
| LEARN-024 | Add social sharing of course completion | Course components | Share certificate/badge |
| LEARN-025 | Add course content print-friendly stylesheet | learn.css | Clean print layout |
| LEARN-026 | Add interactive flavor wheel in relevant courses | flavor-wheel/ | SVG wheel with interactions |
| LEARN-027 | Add quiz review mode (see wrong answers with explanations) | Quiz components | Review wrong answers |
| LEARN-028 | Add course content search within current course | Course components | Find text in current course |
| LEARN-029 | Add animated transitions between chapters | Course components | Slide animation between chapters |
| LEARN-030 | Add image zoom on tap for course illustrations | Course components | Pinch-to-zoom on mobile |

### P2 Polish (LEARN-031 ~ LEARN-050)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| LEARN-031 | Add course content versioning for updates | Course data | Version shown per course |
| LEARN-032 | Add "What you'll learn" preview for each course | Course components | Learning objectives listed |
| LEARN-033 | Add prerequisite course linking | Course data | Prerequisites shown |
| LEARN-034 | Add course author/contributor credits | Course data | Author info displayed |
| LEARN-035 | Add code-like syntax highlighting for technical terms | Course components | Terms highlighted |
| LEARN-036 | Add interactive map for wine region courses | regions/ | Clickable region map |
| LEARN-037 | Add vocabulary builder across all courses | New: vocabulary.ts | Cumulative word bank |
| LEARN-038 | Add course comparison table | page.tsx | Compare 2 courses |
| LEARN-039 | Add dark mode optimized images for courses | Course assets | Images adapt to theme |
| LEARN-040 | Add course content contribution/suggestion button | Course components | "Suggest edit" button |
| LEARN-041 | Add learning analytics dashboard for users | New: learning-analytics.tsx | Charts of progress |
| LEARN-042 | Add course bundle/collection feature | page.tsx | "Wine 101 Bundle" |
| LEARN-043 | Add AI-powered Q&A per course chapter | Course components | Ask AI about chapter |
| LEARN-044 | Add peer discussion threads per chapter | Course components | Comments per chapter |
| LEARN-045 | Add study mode: focus timer + course content | study-buddy/ | Pomodoro + reading |
| LEARN-046 | Add course offline download for PWA | sw.js, course components | Download course for offline |
| LEARN-047 | Add progressive disclosure for complex topics | Course components | Expandable deep-dive sections |
| LEARN-048 | Add course live cohort feature (group learning) | study-group/ | Scheduled group sessions |
| LEARN-049 | Add gamification XP for course completion | Gamification system | XP earned per chapter |
| LEARN-050 | Add course feedback/rating system | Course components | Rate course after completion |

---

## Section 8: Google Play Feasibility (GP-001 ~ GP-015)

| ID | Priority | Description | Acceptance |
|---|---|---|---|
| GP-001 | P0 | Research TWA (Trusted Web Activity) requirements and limitations | Decision document produced |
| GP-002 | P0 | Verify Digital Asset Links setup for TWA | assetlinks.json deployed and verified |
| GP-003 | P0 | Test PWA Lighthouse score (must be >90 for TWA) | Lighthouse PWA score >90 |
| GP-004 | P1 | Set up Android Studio project with TWA template | Project builds successfully |
| GP-005 | P1 | Configure app signing and keystore | Signed APK generated |
| GP-006 | P1 | Create Google Play Store listing assets (screenshots, descriptions) | All required assets ready |
| GP-007 | P1 | Implement TWA splash screen customization | Branded splash screen |
| GP-008 | P1 | Add in-app review API trigger after positive game session | Review prompt shown |
| GP-009 | P1 | Test on minimum Android version (API 25) | App works on Android 7.1+ |
| GP-010 | P2 | Set up Google Play Console account and listing | Listing created |
| GP-011 | P2 | Implement Play Billing Library for subscriptions | Alternative to PayPal for Android |
| GP-012 | P2 | Add deep link handling for Play Store installs | Deep links work from Play Store |
| GP-013 | P2 | Set up closed beta testing track | Beta testing configured |
| GP-014 | P2 | Add app size optimization (<10MB initial) | APK size <10MB |
| GP-015 | P2 | Create app update strategy (in-app update API) | Update prompt mechanism |

---

## Section 9: User Attraction Assessment (UA-001 ~ UA-040)

### 100-Persona Framework (UA-001 ~ UA-020)

| ID | Priority | Persona Category | Count | Analysis Focus |
|---|---|---|---|---|
| UA-001 | P0 | Party Host Persona (ages 21-35) | 15 | Will they pay for party games? |
| UA-002 | P0 | Wine Enthusiast Beginner (ages 25-40) | 10 | Course content value assessment |
| UA-003 | P0 | Wine Professional/Sommelier (ages 30-50) | 5 | Professional tool credibility |
| UA-004 | P0 | College Student Social (ages 18-24) | 15 | Free tier stickiness |
| UA-005 | P1 | Couple Date Night (ages 25-40) | 10 | Game variety for couples |
| UA-006 | P1 | Bar/Restaurant Owner (ages 30-55) | 5 | B2B value proposition |
| UA-007 | P1 | Corporate Team Building (ages 25-45) | 10 | Enterprise use case |
| UA-008 | P1 | Casual Mobile Gamer (ages 20-35) | 10 | Retention vs. dedicated apps |
| UA-009 | P2 | Wine Collector (ages 35-60) | 5 | Premium feature appeal |
| UA-010 | P2 | Content Creator/KOL (ages 20-35) | 5 | Shareability and content creation |
| UA-011 | P2 | Parent (Family Game Night) (ages 30-50) | 5 | Family-friendly content |
| UA-012 | P2 | International Tourist (ages 25-45) | 5 | Multi-language value |

### Monetization & Retention Analysis (UA-013 ~ UA-040)
| ID | Priority | Description | Acceptance |
|---|---|---|---|
| UA-013 | P0 | Define free-to-paid conversion funnel with 5 touchpoints | Funnel documented |
| UA-014 | P0 | Identify top 3 features that drive payment (per persona) | Feature-persona matrix |
| UA-015 | P0 | Design "aha moment" within first 3 minutes of use | First-use flow defined |
| UA-016 | P0 | Create onboarding flow with persona detection | Onboarding adapts to user type |
| UA-017 | P1 | Design viral loop: game -> share -> invite -> play | Loop mechanics defined |
| UA-018 | P1 | Add social proof notifications ("X people playing now") | Real-time social proof |
| UA-019 | P1 | Design re-engagement email sequence (Day 1/3/7/14/30) | Email templates created |
| UA-020 | P1 | Create seasonal event calendar (CNY, Halloween, etc.) | Events scheduled for 12 months |
| UA-021 | P1 | Design loyalty program with tier progression | Loyalty tiers defined |
| UA-022 | P1 | Identify churn risk indicators and prevention triggers | Churn model documented |
| UA-023 | P1 | Design "bring a friend" multiplayer incentive | Incentive mechanics built |
| UA-024 | P1 | Create content marketing calendar (blog, social, email) | 3-month calendar |
| UA-025 | P2 | Design push notification strategy (frequency, content) | Notification playbook |
| UA-026 | P2 | Create SEO content strategy for organic acquisition | Target keywords listed |
| UA-027 | P2 | Design App Store Optimization (ASO) strategy | ASO keywords and screenshots |
| UA-028 | P2 | Create influencer partnership framework | Partnership tiers defined |
| UA-029 | P2 | Design referral program mechanics | Referral rewards defined |
| UA-030 | P2 | Create user feedback collection system | Feedback loop implemented |
| UA-031 | P2 | Design upsell moments in free tier experience | Upsell triggers mapped |
| UA-032 | P2 | Create competitive analysis matrix (vs. competitors) | Matrix with 5 competitors |
| UA-033 | P2 | Design offline/event marketing materials | Digital assets created |
| UA-034 | P2 | Create pricing psychology strategy | Pricing page optimized |
| UA-035 | P2 | Design community building strategy (Discord/Line) | Community platform selected |
| UA-036 | P2 | Create user testimonial collection flow | Auto-prompt for reviews |
| UA-037 | P2 | Design cross-sell between games and courses | Cross-sell touchpoints |
| UA-038 | P2 | Create retention metric dashboards | Dashboard design spec |
| UA-039 | P2 | Design win-back campaign for dormant users | Campaign sequence |
| UA-040 | P2 | Create launch announcement and PR strategy | Press kit ready |

---

## Section 10: File Cleanup & Code Organization (CLEAN-001 ~ CLEAN-050)

### P0 Critical (CLEAN-001 ~ CLEAN-015)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| CLEAN-001 | ~~Delete LearnCourseContent.v2.tsx~~ (ALREADY DONE) | ~~v2 file~~ | N/A - Completed |
| CLEAN-002 | Remove all lint_*.txt and test_report.txt from repo root | Root files | No report files in repo |
| CLEAN-003 | Remove `nul` file (Windows artifact) from repo | nul | File deleted |
| CLEAN-004 | Add all report/output files to .gitignore | .gitignore | Reports not tracked |
| CLEAN-005 | Audit and remove unused dependencies from package.json | package.json | `depcheck` shows 0 unused |
| CLEAN-006 | Remove `export {}` from sw.js (breaks Service Worker) | public/sw.js | SW loads without error |
| CLEAN-007 | Consolidate duplicate config files (learn-curriculum + learn-config) | Config files | Single config source |
| CLEAN-008 | Remove deprecated game components marked for deletion | Game components | No deprecated code |
| CLEAN-009 | Fix all remaining TypeScript `any` types to proper types | All files with `any` | `grep 'any' --type=ts` count reduced >50% |
| CLEAN-010 | Remove console.log statements from production code | All components | No console.log in builds |
| CLEAN-011 | Reorganize src/ into feature-based modules | src/ structure | Clear module boundaries |
| CLEAN-012 | Add barrel exports (index.ts) for component directories | Component dirs | Clean import paths |
| CLEAN-013 | Remove unused CSS classes from globals.css and learn.css | CSS files | PurgeCSS shows 0 unused |
| CLEAN-014 | Fix inconsistent file naming (camelCase vs PascalCase vs kebab-case) | Various | Consistent naming convention |
| CLEAN-015 | Add path aliases for deep imports (@/games, @/learn, etc.) | tsconfig.json | Short import paths |

### P1 High ROI (CLEAN-016 ~ CLEAN-035)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| CLEAN-016 | Extract shared game logic into reusable hooks | Game components | 5+ shared hooks created |
| CLEAN-017 | Create shared UI component library (Button, Card, Modal, etc.) | UI components | Design system components |
| CLEAN-018 | Deduplicate animation variants across components | Animation files | Single animation config |
| CLEAN-019 | Extract API routes into versioned API structure (v1/) | API routes | /api/v1/* structure |
| CLEAN-020 | Add JSDoc comments to all exported functions | Public APIs | Documentation complete |
| CLEAN-021 | Standardize error handling pattern across all API routes | API routes | Consistent error format |
| CLEAN-022 | Extract Supabase queries into repository pattern | Data access | Typed query functions |
| CLEAN-023 | Deduplicate form validation logic | Form components | Shared validation lib |
| CLEAN-024 | Organize public/ assets into categorized subdirectories | public/ | images/icons/data separated |
| CLEAN-025 | Add tree-shaking friendly exports to large modules | Large modules | Named exports only |
| CLEAN-026 | Extract theme constants into design token file | Theme files | Single token source |
| CLEAN-027 | Standardize React component pattern (FC vs function) | All components | Consistent pattern |
| CLEAN-028 | Remove circular dependency chains | Module graph | No circular imports |
| CLEAN-029 | Add module boundary enforcement with ESLint rules | .eslintrc | Cross-module imports flagged |
| CLEAN-030 | Extract email templates into template system | Email code | Reusable template engine |
| CLEAN-031 | Standardize hook patterns (naming, return types) | All hooks | Consistent hook API |
| CLEAN-032 | Create shared test utilities and fixtures | Test helpers | DRY test setup |
| CLEAN-033 | Add Prettier config and format entire codebase | .prettierrc | Consistent formatting |
| CLEAN-034 | Remove dead code (unreachable functions, unused imports) | Various | 0 unused exports |
| CLEAN-035 | Add import sorting and grouping rules | .eslintrc | Imports auto-sorted |

### P2 Polish (CLEAN-036 ~ CLEAN-050)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| CLEAN-036 | Add code ownership (CODEOWNERS) for team scalability | CODEOWNERS | Owners per directory |
| CLEAN-037 | Create architectural decision records (ADRs) | docs/adr/ | Key decisions documented |
| CLEAN-038 | Add bundle analysis to CI pipeline | next.config.ts | Bundle report on PR |
| CLEAN-039 | Add commit message linting (commitlint) | .commitlintrc | Conventional commits enforced |
| CLEAN-040 | Add pre-commit hooks for lint + type-check | .husky/ | Checks run before commit |
| CLEAN-041 | Create developer onboarding guide | CONTRIBUTING.md | New dev setup in 15 min |
| CLEAN-042 | Add environment variable validation at startup | env.ts | Missing vars = clear error |
| CLEAN-043 | Standardize error boundary component | ErrorBoundary.tsx | Reused across all pages |
| CLEAN-044 | Add performance budget enforcement | Web vitals config | CI fails if budget exceeded |
| CLEAN-045 | Create release checklist template | docs/ | Checklist for each release |
| CLEAN-046 | Add license headers to all source files | All files | License present |
| CLEAN-047 | Create component playground/storybook | Storybook config | Components viewable in isolation |
| CLEAN-048 | Add database migration versioning | Supabase migrations | Numbered migration files |
| CLEAN-049 | Create API documentation with OpenAPI spec | api-docs/ | Swagger UI available |
| CLEAN-050 | Add dependency update automation (Renovate/Dependabot) | Config file | Auto-PRs for updates |

---

## Section 11: QA & Testing (QA-001 ~ QA-050)

### P0 Critical (QA-001 ~ QA-012)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| QA-001 | Add E2E tests for critical user flows (sign up, subscribe, play game) | e2e/ | 5 E2E tests passing |
| QA-002 | Add visual regression tests for homepage sections | e2e/ | Screenshot baselines set |
| QA-003 | Achieve >70% unit test coverage for core business logic | Test files | Coverage report >70% |
| QA-004 | Add integration tests for PayPal webhook handler | Test files | All 8 event types tested |
| QA-005 | Add accessibility audit to CI (axe-core) | CI config | 0 critical a11y violations |
| QA-006 | Add Lighthouse CI checks (Performance >80, A11y >90) | CI config | Scores meet thresholds |
| QA-007 | Fix all ESLint warnings (currently 100+) | Various | 0 warnings in lint |
| QA-008 | Add security headers audit test | Test files | All OWASP headers present |
| QA-009 | Add load testing for API endpoints (100 concurrent users) | Test scripts | <200ms p95 response time |
| QA-010 | Add mobile device testing matrix (iOS Safari, Chrome Android) | Test config | 4 devices tested |
| QA-011 | Add error monitoring integration test (Sentry) | Test files | Errors captured in Sentry |
| QA-012 | Add database migration rollback tests | Test files | Rollback succeeds cleanly |

### P1 High ROI (QA-013 ~ QA-030)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| QA-013 | Add snapshot tests for all game components | Test files | Snapshots for 45 core games |
| QA-014 | Add contract tests for external API integrations | Test files | PayPal, Supabase, Resend tested |
| QA-015 | Add performance benchmark tests for game loading | Test files | Game loads <500ms |
| QA-016 | Add cross-browser compatibility tests (Chrome, Firefox, Safari, Edge) | Test config | 4 browsers pass |
| QA-017 | Add PWA install flow E2E test | e2e/ | PWA installs successfully |
| QA-018 | Add subscription lifecycle E2E test | e2e/ | Full sub lifecycle tested |
| QA-019 | Add course progress persistence test | Test files | Progress survives logout/login |
| QA-020 | Add script murder multiplayer E2E test | e2e/ | 3-player game completes |
| QA-021 | Add i18n coverage test (all keys translated) | Test files | 0 missing translations |
| QA-022 | Add image optimization audit test | Test files | All images <200KB, correct format |
| QA-023 | Add bundle size regression test | CI config | Alert on >5% size increase |
| QA-024 | Add dependency vulnerability scanning | CI config | 0 critical vulnerabilities |
| QA-025 | Add rate limiting integration tests | Test files | Rate limits enforced correctly |
| QA-026 | Add dark mode visual consistency tests | Test files | No broken styles in dark mode |
| QA-027 | Add keyboard navigation E2E test | e2e/ | Full app navigable by keyboard |
| QA-028 | Add form validation test suite | Test files | All forms validated correctly |
| QA-029 | Add API response schema validation tests | Test files | All APIs match schema |
| QA-030 | Add memory leak detection tests for long-running pages | Test files | No leaks after 10 min |

### P2 Polish (QA-031 ~ QA-050)
| ID | Description | Files | Acceptance |
|---|---|---|---|
| QA-031 | Add chaos engineering tests (network failure, API timeout) | Test files | App gracefully degrades |
| QA-032 | Add fuzz testing for user input fields | Test files | No crash on random input |
| QA-033 | Add SEO audit test (meta tags, structured data) | Test files | All pages have proper meta |
| QA-034 | Add cookie/storage compliance test | Test files | GDPR compliant storage |
| QA-035 | Add animation performance profiling | Test files | All animations >30fps |
| QA-036 | Add network request waterfall optimization test | Test files | No sequential request chains |
| QA-037 | Add CSS specificity audit | Test files | No !important in components |
| QA-038 | Add TypeScript strict mode compliance check | tsconfig.json | Strict mode passes |
| QA-039 | Add dead code detection in CI | CI config | Unused exports flagged |
| QA-040 | Add component render count profiling | Test files | No excessive re-renders |
| QA-041 | Add internationalization visual overflow test | Test files | No text overflow in any locale |
| QA-042 | Add third-party script impact assessment | Test files | 3P scripts <50KB total |
| QA-043 | Add font loading optimization test | Test files | FOUT/FOIT eliminated |
| QA-044 | Add content security policy violation test | Test files | 0 CSP violations |
| QA-045 | Add real user monitoring (RUM) setup | Analytics config | RUM data flowing |
| QA-046 | Add synthetic monitoring for uptime | External service | 99.9% uptime monitored |
| QA-047 | Add API versioning compatibility test | Test files | v1 API stable |
| QA-048 | Add data migration integrity test | Test files | User data preserved |
| QA-049 | Add SSL/TLS configuration audit | Test files | A+ SSL Labs score |
| QA-050 | Add penetration testing preparation checklist | Documentation | OWASP Top 10 covered |

---

## Summary

| Section | Count | P0 | P1 | P2 |
|---|---|---|---|---|
| 1. Homepage UX/UI | 50 | 10 | 20 | 20 |
| 2. Navigation Bar | 25 | 8 | 10 | 7 |
| 3. PWA | 30 | 8 | 12 | 10 |
| 4. PayPal Module | 30 | 8 | 12 | 10 |
| 5. Games | 120 | 14 | 46 | 60 |
| 6. Script Murder | 40 | 10 | 15 | 15 |
| 7. Courses | 50 | 10 | 20 | 20 |
| 8. Google Play | 15 | 3 | 6 | 6 |
| 9. User Attraction | 40 | 6 | 14 | 20 |
| 10. File Cleanup | 50 | 15 | 20 | 15 |
| 11. QA & Testing | 50 | 12 | 18 | 20 |
| **TOTAL** | **500** | **104** | **193** | **203** |

---

## Execution Priority

**Immediate (P0 - 104 tasks):** Ship-blocking bugs, security issues, broken features  
**Next Sprint (P1 - 193 tasks):** High ROI improvements, engagement features  
**Polish (P2 - 203 tasks):** Nice-to-have, future-proofing, edge cases  

**Start with:** CLEAN-002/003/006 (repo cleanup) -> PWA-001 (SW fix) -> NAV-001 (route fix) -> HP-001 (confetti fix) -> LEARN-001 (reorg)
