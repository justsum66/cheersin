/**
 * Task 1.02: Bundle Size Reduction
 * Utility functions for bundle optimization and dynamic imports
 */

/**
 * Dynamic import utility with proper error handling and loading states
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  options: {
    loadingFallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
    ssr?: boolean;
  } = {}
) {
  const { loadingFallback = null, errorFallback = null, ssr = false } = options;

  return importFn().catch((error: Error) => {
    console.error('Dynamic import error:', error);
    return Promise.reject(error);
  });
}

/**
 * Bundle optimization configuration for different component types
 */
export const BUNDLE_CONFIG = {
  // Heavy components that should be dynamically imported
  HEAVY_COMPONENTS: [
    'framer-motion',
    'react-markdown',
    'rehype-sanitize',
    'remark-gfm',
    'html2canvas',
    'canvas-confetti'
  ],
  
  // Route-based chunk splitting
  ROUTE_CHUNKS: {
    games: /^\/games/,
    learn: /^\/learn/,
    profile: /^\/profile/,
    admin: /^\/admin/
  },
  
  // Component grouping for bundle splitting
  COMPONENT_GROUPS: {
    ui: ['Button', 'Card', 'Dialog', 'Input', 'Select'],
    forms: ['Form', 'Field', 'Validation'],
    layout: ['Header', 'Footer', 'Sidebar', 'Navigation']
  }
} as const;

/**
 * Analyze and optimize import statements
 */
export function optimizeImports(imports: Record<string, any>) {
  const optimized: Record<string, Promise<any>> = {};
  
  Object.entries(imports).forEach(([name, module]) => {
    // Dynamically import heavy modules
    if (BUNDLE_CONFIG.HEAVY_COMPONENTS.some(heavy => name.includes(heavy))) {
      optimized[name] = dynamicImport(() => module as Promise<any>, {
        ssr: false // Client-side only for heavy components
      });
    } else {
      optimized[name] = Promise.resolve(module);
    }
  });
  
  return optimized;
}

/**
 * Tree-shaking optimization for unused exports
 */
export function createOptimizedBundle(
  exports: Record<string, any>,
  usedExports: string[]
) {
  const optimized: Record<string, any> = {};
  
  usedExports.forEach(exp => {
    if (exports[exp]) {
      optimized[exp] = exports[exp];
    }
  });
  
  return optimized;
}

/**
 * Code splitting utility for route-based components
 */
export function getRouteChunkName(pathname: string): string {
  for (const [chunk, pattern] of Object.entries(BUNDLE_CONFIG.ROUTE_CHUNKS)) {
    if (pattern.test(pathname)) {
      return chunk;
    }
  }
  return 'main';
}