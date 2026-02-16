import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  dynamicImport, 
  getRouteChunkName, 
  preloadRouteChunk, 
  useBundlePerformance,
  createLazyComponent,
  optimizeImports,
  createOptimizedBundle,
  bundleAnalyzer
} from './bundle-optimizer';

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: vi.fn(() => () => null),
}));

// Mock React
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    lazy: vi.fn((fn) => fn),
    Suspense: ({ children }: { children: React.ReactNode }) => children,
    useEffect: vi.fn((fn) => fn()),
    useState: vi.fn((init) => [init, vi.fn()]),
    createElement: vi.fn((type, props, ...children) => ({ type, props, children }))
  };
});

describe('Bundle Optimizer Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('dynamicImport', () => {
    it('should handle successful dynamic import', async () => {
      const mockModule = { default: 'MockComponent' };
      const importFn = vi.fn(() => Promise.resolve(mockModule));
      
      const result = await dynamicImport(importFn);
      
      expect(result).toEqual(mockModule);
      expect(importFn).toHaveBeenCalled();
    });

    it('should handle failed dynamic import', async () => {
      const importFn = vi.fn(() => Promise.reject(new Error('Import failed')));
      
      await expect(dynamicImport(importFn)).rejects.toThrow('Import failed');
    });
  });

  describe('getRouteChunkName', () => {
    it('should return correct chunk name for games route', () => {
      const chunkName = getRouteChunkName('/games');
      expect(chunkName).toBe('games');
    });

    it('should return correct chunk name for learn route', () => {
      const chunkName = getRouteChunkName('/learn/test');
      expect(chunkName).toBe('learn');
    });

    it('should return main for unknown routes', () => {
      const chunkName = getRouteChunkName('/unknown');
      expect(chunkName).toBe('main');
    });
  });

  describe('preloadRouteChunk', () => {
    it('should log when preloading route chunk', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      preloadRouteChunk('/games');
      
      expect(consoleSpy).toHaveBeenCalledWith('[Bundle Optimizer] Preloading chunk: games');
      
      consoleSpy.mockRestore();
    });

    it('should not execute on server side', () => {
      // This test verifies that the function handles server-side execution gracefully
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      expect(() => preloadRouteChunk('/games')).not.toThrow();
      
      global.window = originalWindow;
    });
  });

  describe('optimizeImports', () => {
    it('should optimize heavy components for dynamic import', async () => {
      const mockHeavyModule = { default: 'HeavyComponent' };
      const mockLightModule = { default: 'LightComponent' };
      
      const imports = {
        'canvas-confetti': mockHeavyModule,
        'light-component': mockLightModule
      };
      
      const result = optimizeImports(imports);
      
      expect(result).toHaveProperty('canvas-confetti');
      expect(result).toHaveProperty('light-component');
    });
  });

  describe('createOptimizedBundle', () => {
    it('should create optimized bundle with used exports only', () => {
      const allExports = {
        exportA: 'valueA',
        exportB: 'valueB',
        exportC: 'valueC',
      };
      
      const usedExports = ['exportA', 'exportC'];
      
      const result = createOptimizedBundle(allExports, usedExports);
      
      expect(result).toHaveProperty('exportA');
      expect(result).toHaveProperty('exportC');
      expect(result).not.toHaveProperty('exportB');
    });
  });

  describe('bundleAnalyzer', () => {
    it('should record and retrieve bundle stats', () => {
      bundleAnalyzer.recordBundle('test-bundle', 100000, ['chunk1', 'chunk2']);
      
      const stats = bundleAnalyzer.getBundleStats();
      expect(stats).toHaveProperty('test-bundle');
      expect(stats['test-bundle']).toEqual({ size: 100000, chunks: ['chunk1', 'chunk2'] });
    });

    it('should check bundle size correctly', () => {
      bundleAnalyzer.recordBundle('small-bundle', 50000, []);
      bundleAnalyzer.recordBundle('large-bundle', 300000, []);
      
      const smallResult = bundleAnalyzer.checkBundleSize('small-bundle');
      const largeResult = bundleAnalyzer.checkBundleSize('large-bundle');
      
      expect(smallResult).toBe('ok');
      expect(largeResult).toBe('critical');
    });

    it('should generate report with recommendations', () => {
      bundleAnalyzer.recordBundle('normal-bundle', 150000, []);
      bundleAnalyzer.recordBundle('oversized-bundle', 400000, []);
      
      const report = bundleAnalyzer.generateReport();
      
      expect(report).toHaveProperty('totalSize');
      expect(report).toHaveProperty('bundleCount');
      expect(report).toHaveProperty('oversizedBundles');
      expect(report).toHaveProperty('recommendations');
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('createLazyComponent', () => {
    it('should create a lazy component with fallback', () => {
      const mockComponent = () => null;
      const importFn = vi.fn(() => Promise.resolve({ default: mockComponent }));
      
      const LazyComponent = createLazyComponent(importFn, 'TestComponent');
      
      expect(LazyComponent).toBeDefined();
      expect(LazyComponent.displayName).toBe('LazyTestComponent');
    });
  });
});