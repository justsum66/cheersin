/**
 * CLEAN-020: JSDoc standards for exported functions.
 * CLEAN-027: Standardized React component patterns.
 * CLEAN-028: Circular dependency prevention guidelines.
 * CLEAN-029: Module boundary enforcement.
 * CLEAN-031: Hook naming and return type conventions.
 * CLEAN-034: Dead code detection conventions.
 * CLEAN-035: Import sorting and grouping rules.
 *
 * This file documents code conventions for the Cheersin codebase.
 * Enforced via ESLint rules where possible, otherwise by code review.
 */

// ======== CLEAN-020: JSDoc Standards ========
// All exported functions MUST have a JSDoc block with:
// - @description (or first line summary)
// - @param for each parameter
// - @returns description
// Example:
//   /** Validate user email format. */
//   export function validateEmail(email: string): ValidationResult { ... }

// ======== CLEAN-027: React Component Pattern ========
// Standard: Use named function declarations (not arrow FC).
// Pattern:
//   export default function ComponentName({ prop }: Props) { ... }
//   export function NamedComponent({ prop }: Props) { ... }
// Do NOT use:
//   const Component: React.FC<Props> = (props) => { ... }

// ======== CLEAN-028: Circular Dependency Prevention ========
// Rules:
// 1. Config files NEVER import from components or hooks.
// 2. Hooks MAY import from lib/ and config/ but NEVER from components/.
// 3. Components MAY import from hooks/, lib/, and config/.
// 4. lib/ NEVER imports from components/ or hooks/.
// Dependency direction: config -> lib -> hooks -> components -> pages

export const MODULE_DEPENDENCY_ORDER = [
  'config',   // 0: no imports from other app modules
  'lib',      // 1: may import from config
  'hooks',    // 2: may import from config, lib
  'components', // 3: may import from config, lib, hooks
  'app',      // 4: may import from anything
] as const

// ======== CLEAN-029: Module Boundary Config ========
// These boundaries are enforced in ESLint via no-restricted-imports.
export const MODULE_BOUNDARIES = {
  'src/config/**': { deny: ['src/components/**', 'src/hooks/**', 'src/app/**'] },
  'src/lib/**': { deny: ['src/components/**', 'src/hooks/**', 'src/app/**'] },
  'src/hooks/**': { deny: ['src/components/**', 'src/app/**'] },
} as const

// ======== CLEAN-031: Hook Conventions ========
// 1. All hooks start with `use` prefix.
// 2. Return an object (not array) for >2 return values.
// 3. Include JSDoc with @returns describing each property.
// 4. Side-effect hooks return void.
// 5. Data hooks return { data, isLoading, error } pattern.
// Example:
//   export function useProfile(): { data: Profile | null; isLoading: boolean; error: string | null }

// ======== CLEAN-035: Import Sorting ========
// Import order (enforced by convention, can add eslint-plugin-import later):
// 1. React / Next.js core
// 2. Third-party libraries (framer-motion, lucide-react, etc.)
// 3. @/ aliases: config -> lib -> hooks -> components -> app
// 4. Relative imports (./*)
// 5. CSS/Style imports
// Blank line between each group.

export const IMPORT_ORDER = [
  'react',
  'next',
  'third-party',
  '@/config',
  '@/lib',
  '@/hooks',
  '@/components',
  '@/app',
  'relative',
  'styles',
] as const
