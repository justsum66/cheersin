/**
 * CLEAN-037: Architectural Decision Records (ADRs) index.
 * Documents key technical decisions for the Cheersin project.
 * Each decision includes context, decision, and consequences.
 */

export interface ADR {
  id: string
  title: string
  date: string
  status: 'accepted' | 'deprecated' | 'superseded'
  context: string
  decision: string
  consequences: string[]
}

export const ADR_REGISTRY: ADR[] = [
  {
    id: 'ADR-001',
    title: 'Use Next.js 15 App Router',
    date: '2026-01-01',
    status: 'accepted',
    context: 'Need a React meta-framework with SSR, ISR, and API routes for SEO and performance.',
    decision: 'Adopt Next.js 15 with App Router (not Pages Router) for server components and streaming.',
    consequences: [
      'Server Components reduce client JS bundle',
      'Layout-based routing simplifies shared UI',
      'Some libraries need "use client" wrapper',
    ],
  },
  {
    id: 'ADR-002',
    title: 'PayPal for Payments (not Stripe)',
    date: '2026-01-15',
    status: 'accepted',
    context: 'Taiwan market has limited Stripe availability. PayPal has broader local support.',
    decision: 'Use PayPal Subscriptions API with webhook-based event handling.',
    consequences: [
      'Webhook signature verification required for security',
      'Must handle sandbox/production toggle',
      'Grace period logic needed for failed payments',
    ],
  },
  {
    id: 'ADR-003',
    title: 'Supabase for Database and Auth',
    date: '2026-01-01',
    status: 'accepted',
    context: 'Need managed PostgreSQL with built-in auth, realtime, and storage.',
    decision: 'Use Supabase (hosted) for database, auth, realtime subscriptions, and file storage.',
    consequences: [
      'Row-level security policies required for all tables',
      'Realtime channels for multiplayer games',
      'Vendor lock-in risk mitigated by standard PostgreSQL',
    ],
  },
  {
    id: 'ADR-004',
    title: 'Framer Motion for Animations',
    date: '2026-01-10',
    status: 'accepted',
    context: 'Need declarative animation library that supports layout animations and gestures.',
    decision: 'Use Framer Motion with LazyMotion for tree-shaking. Use "m" import for reduced bundle.',
    consequences: [
      'Must use LazyMotion + domAnimation for code splitting',
      'All animations must respect prefers-reduced-motion',
      'Animation variants centralized in animation-variants.ts',
    ],
  },
  {
    id: 'ADR-005',
    title: 'TWA for Google Play Distribution',
    date: '2026-02-01',
    status: 'accepted',
    context: 'Want to distribute via Google Play without building a native app.',
    decision: 'Use Trusted Web Activity (TWA) to wrap the PWA for Play Store listing.',
    consequences: [
      'PWA must maintain Lighthouse score > 90',
      'Digital Asset Links (assetlinks.json) required',
      'In-app billing may need Play Billing Library',
    ],
  },
  {
    id: 'ADR-006',
    title: 'Tailwind CSS with Design Tokens',
    date: '2026-01-01',
    status: 'accepted',
    context: 'Need utility-first CSS with custom design system integration.',
    decision: 'Use Tailwind CSS v4 with custom theme extending from design-tokens.ts.',
    consequences: [
      'All colors/spacing/typography from design tokens',
      'No raw hex/rgb values in components',
      'PurgeCSS built-in for production optimization',
    ],
  },
]
