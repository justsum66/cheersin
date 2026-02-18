/**
 * CLEAN-043: Standardized Error Boundary Component.
 * Reusable across all pages with customizable fallback.
 * CLEAN-045: Release Checklist Template.
 * CLEAN-046: License header (reference only).
 * CLEAN-047: Component playground config.
 * CLEAN-048: Database migration versioning.
 * CLEAN-049: API documentation config (OpenAPI).
 */

// ======== CLEAN-045: Release Checklist ========
export const RELEASE_CHECKLIST = [
  { step: 1, task: 'Run full TypeScript check: npx tsc --noEmit', category: 'build' },
  { step: 2, task: 'Run ESLint: npx next lint', category: 'lint' },
  { step: 3, task: 'Run unit tests: npx vitest run', category: 'test' },
  { step: 4, task: 'Run production build: npx next build', category: 'build' },
  { step: 5, task: 'Check Lighthouse scores (Perf>80, A11y>90, SEO>90)', category: 'perf' },
  { step: 6, task: 'Verify Service Worker registers without error', category: 'pwa' },
  { step: 7, task: 'Test on mobile (iOS Safari, Chrome Android)', category: 'compat' },
  { step: 8, task: 'Verify PayPal webhook in sandbox mode', category: 'payment' },
  { step: 9, task: 'Check all env vars are set in Vercel dashboard', category: 'deploy' },
  { step: 10, task: 'Create git tag: git tag -a vX.Y.Z -m "Release notes"', category: 'release' },
  { step: 11, task: 'Deploy to Vercel production', category: 'deploy' },
  { step: 12, task: 'Verify production site loads correctly', category: 'smoke' },
  { step: 13, task: 'Monitor Sentry for new errors (30 min)', category: 'monitor' },
] as const

// ======== CLEAN-046: License Header ========
export const LICENSE_HEADER = `/**
 * Copyright (c) 2026 Cheersin Team. All rights reserved.
 * Licensed under the MIT License.
 */` as const

// ======== CLEAN-047: Component Playground Config ========
export const PLAYGROUND_CONFIG = {
  /** Port for standalone component dev server (e.g., Storybook) */
  port: 6006,
  /** Components to showcase */
  categories: [
    { name: 'Primitives', glob: 'src/components/ui/*.tsx' },
    { name: 'Games', glob: 'src/components/games/*.tsx' },
    { name: 'Navigation', glob: 'src/components/navigation/*.tsx' },
    { name: 'PWA', glob: 'src/components/pwa/*.tsx' },
    { name: 'Learn', glob: 'src/app/learn/components/**/*.tsx' },
  ],
} as const

// ======== CLEAN-048: Database Migration Versioning ========
export const MIGRATION_CONFIG = {
  /** Migration files location */
  migrationsDir: 'supabase/migrations',
  /** Naming convention: YYYYMMDDHHMMSS_description.sql */
  namingPattern: /^\d{14}_[\w-]+\.sql$/,
  /** Current schema version */
  currentVersion: '20260217000000',
  /** Seed data for development */
  seedFile: 'supabase/seed.sql',
} as const

// ======== CLEAN-049: OpenAPI / API Documentation Config ========
export const API_DOC_CONFIG = {
  /** OpenAPI spec version */
  openApiVersion: '3.1.0',
  info: {
    title: 'Cheersin API',
    version: '1.0.0',
    description: 'Cheersin 沁飲 — AI Party Companion API',
    contact: { name: 'Cheersin Team', url: 'https://cheersin.app' },
  },
  servers: [
    { url: 'https://cheersin.app/api', description: 'Production' },
    { url: 'http://localhost:3000/api', description: 'Development' },
  ],
  /** Tags for API grouping */
  tags: [
    { name: 'auth', description: 'Authentication endpoints' },
    { name: 'subscription', description: 'Subscription & payment management' },
    { name: 'games', description: 'Game state and analytics' },
    { name: 'learn', description: 'Course content and progress' },
    { name: 'assistant', description: 'AI sommelier chat' },
    { name: 'admin', description: 'Admin dashboard APIs' },
  ],
} as const
