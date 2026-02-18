/**
 * CLEAN-038: Bundle analysis configuration.
 * CLEAN-039: Commit message linting configuration.
 * CLEAN-040: Pre-commit hooks configuration.
 * CLEAN-042: Environment variable validation at startup.
 * CLEAN-044: Performance budget enforcement.
 * CLEAN-050: Dependency update automation config.
 *
 * Centralized CI/CD and DX configuration for the Cheersin project.
 */

// ======== CLEAN-038: Bundle Analysis Config ========
export const BUNDLE_CONFIG = {
  /** Maximum allowed JS bundle size for initial load (KB) */
  maxInitialJs: 250,
  /** Maximum allowed CSS size (KB) */
  maxCss: 100,
  /** Maximum total first-load size (KB) */
  maxFirstLoad: 400,
  /** Alert threshold: warn if size increases by more than this % */
  alertThresholdPercent: 5,
  /** Tool: use @next/bundle-analyzer */
  analyzerTool: '@next/bundle-analyzer',
} as const

// ======== CLEAN-039: Commit Message Convention ========
export const COMMIT_CONVENTION = {
  /** Conventional Commits format */
  format: '<type>(<scope>): <description>',
  types: [
    'feat',     // New feature
    'fix',      // Bug fix
    'docs',     // Documentation
    'style',    // Code style (no logic change)
    'refactor', // Refactoring
    'perf',     // Performance improvement
    'test',     // Tests
    'chore',    // Build/tooling
    'ci',       // CI/CD changes
    'revert',   // Revert previous commit
  ],
  scopes: [
    'home', 'nav', 'games', 'learn', 'sm', 'pwa', 'pay',
    'auth', 'api', 'ui', 'i18n', 'a11y', 'perf', 'config',
  ],
  maxSubjectLength: 72,
  maxBodyLineLength: 100,
} as const

// ======== CLEAN-040: Pre-commit Hook Config ========
export const PRE_COMMIT_HOOKS = {
  /** Commands to run before each commit */
  commands: [
    'npx tsc --noEmit',
    'npx next lint --quiet',
  ],
  /** File patterns to lint-stage */
  lintStaged: {
    '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
    '*.{css,json,md}': ['prettier --write'],
  },
} as const

// ======== CLEAN-042: Required Environment Variables ========
export const REQUIRED_ENV_VARS = {
  /** Required at build time */
  build: [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  /** Required at runtime (server-side) */
  runtime: [
    'SUPABASE_SERVICE_ROLE_KEY',
    'GROQ_API_KEY',
  ],
  /** Optional but recommended */
  optional: [
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'PAYPAL_WEBHOOK_ID',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
    'OPENROUTER_API_KEY',
    'PINECONE_API_KEY',
    'SENTRY_DSN',
  ],
} as const

/** Validate required env vars at startup. Call from instrumentation.ts or server startup. */
export function validateEnvVars(phase: 'build' | 'runtime' = 'runtime'): string[] {
  const missing: string[] = []
  const vars = phase === 'build' ? REQUIRED_ENV_VARS.build : [
    ...REQUIRED_ENV_VARS.build,
    ...REQUIRED_ENV_VARS.runtime,
  ]
  for (const key of vars) {
    if (!process.env[key]) missing.push(key)
  }
  return missing
}

// ======== CLEAN-044: Performance Budget ========
export const PERFORMANCE_BUDGET = {
  /** Core Web Vitals thresholds */
  lcp: 2500,       // ms — Largest Contentful Paint
  fid: 100,        // ms — First Input Delay
  cls: 0.1,        // unitless — Cumulative Layout Shift
  inp: 200,        // ms — Interaction to Next Paint
  ttfb: 800,       // ms — Time to First Byte
  /** Lighthouse score minimums */
  lighthouse: {
    performance: 80,
    accessibility: 90,
    bestPractices: 80,
    seo: 90,
    pwa: 90,
  },
} as const

// ======== CLEAN-050: Dependency Update Config ========
export const DEPENDENCY_UPDATE_CONFIG = {
  /** Automation tool */
  tool: 'renovate' as const,
  /** Auto-merge for patch updates */
  autoMergePatch: true,
  /** Auto-merge for minor updates of trusted packages */
  autoMergeMinor: ['eslint', 'prettier', 'vitest', '@types/*'],
  /** Never auto-merge */
  manualReview: ['next', 'react', 'supabase', 'tailwindcss'],
  /** Check schedule */
  schedule: 'weekly',
} as const
