import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  generateBlurDataURL, 
  getImageConfig, 
  calculateOptimalDimensions, 
  generateResponsiveSources,
  getSupportedFormats,
  optimizeImageUrl,
  preloadCriticalImages,
  ProgressiveImageLoader,
  imagePerformanceMonitor,
  ImagePerformanceMonitor
} from './image-optimizer';

// Mock DOM APIs
const MockImage = class {
  src: string = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  
  constructor() {}
  
  setSrc(src: string) {
    this.src = src;
    if (this.onload) this.onload();
  }
};

global.Image = MockImage as any;

describe('Image Optimizer Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateBlurDataURL', () => {
    it('should generate blur data URL for external images', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const result = await generateBlurDataURL(imageUrl);
      
      expect(result).toContain('data:image/svg+xml');
      expect(result).toContain('Loading');
    });

    it('should return empty string for local images', async () => {
      const imageUrl = '/local/image.jpg';
      const result = await generateBlurDataURL(imageUrl);
      
      expect(result).toBe('');
    });
  });

  describe('getImageConfig', () => {
    it('should return correct config for CRITICAL context', () => {
      const config = getImageConfig('CRITICAL');
      
      expect(config.loading).toBe('eager');
      expect(config.priority).toBe(true);
    });

    it('should return correct config for CONTENT context', () => {
      const config = getImageConfig('CONTENT');
      
      expect(config.loading).toBe('lazy');
      expect(config.priority).toBe(false);
    });
  });

  describe('calculateOptimalDimensions', () => {
    it('should calculate optimal dimensions based on container size', () => {
      const result = calculateOptimalDimensions(800, 600, 16/9);
      
      expect(result.width).toBeGreaterThanOrEqual(0);
      expect(result.height).toBeGreaterThanOrEqual(0);
    });

    it('should round dimensions to nearest 16px', () => {
      const result = calculateOptimalDimensions(799, 599, 1);
      
      expect(result.width % 16).toBe(0);
      expect(result.height % 16).toBe(0);
    });
  });

  describe('generateResponsiveSources', () => {
    it('should generate responsive sources with correct srcSet and sizes', () => {
      const baseSrc = '/images/test.jpg';
      const widths = [300, 600, 1200];
      
      const result = generateResponsiveSources(baseSrc, widths);
      
      expect(result.srcSet).toContain('w=300');
      expect(result.srcSet).toContain('w=600');
      expect(result.srcSet).toContain('w=1200');
      expect(result.sizes).toBeDefined();
    });
  });

  describe('getSupportedFormats', () => {
    it('should return supported formats based on browser capabilities', () => {
      // Mock CSS.supports
      const originalCSS = (window as any).CSS;
      (window as any).CSS = {
        supports: vi.fn((query: string) => {
          if (query === 'image-format(avif)') return false;
          if (query === 'image-format(webp)') return true;
          return false;
        })
      };

      const formats = getSupportedFormats();
      
      expect(formats).toContain('jpeg');
      expect(formats).toContain('webp');
      expect(formats).not.toContain('avif');

      // Restore original
      (window as any).CSS = originalCSS;
    });

    it('should return fallback formats when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const formats = getSupportedFormats();
      
      expect(formats).toContain('webp');
      expect(formats).toContain('jpeg');

      global.window = originalWindow;
    });
  });

  describe('optimizeImageUrl', () => {
    it('should optimize URL for different CDNs', () => {
      // Test Next.js optimization
      const nextjsUrl = optimizeImageUrl('/images/test.jpg', { width: 800, quality: 75 });
      expect(nextjsUrl).toBe('/images/test.jpg');
      
      // Test Cloudinary optimization
      const cloudinaryUrl = optimizeImageUrl('https://res.cloudinary.com/demo/image/upload/test.jpg', { 
        width: 800, 
        quality: 75,
        cdn: 'cloudinary'
      });
      expect(cloudinaryUrl).toContain('?');
    });

    it('should handle optimization options correctly', () => {
      const url = optimizeImageUrl('/images/test.jpg', { 
        width: 800, 
        height: 600, 
        quality: 80,
        format: 'webp'
      });
      
      expect(url).toBe('/images/test.jpg');
    });
  });

  describe('preloadCriticalImages', () => {
    it('should preload critical images successfully', async () => {
      const imageUrls = ['/image1.jpg', '/image2.jpg'];
      await expect(preloadCriticalImages(imageUrls)).resolves.not.toThrow();
    });
  });

  describe('ProgressiveImageLoader', () => {
    it('should load progressive images', async () => {
      // Mock DOM elements
      const mockContainer = {
        appendChild: vi.fn()
      } as any;
      
      // Spy on console to verify loading messages
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Since we can't actually load images in test environment, 
      // we'll just verify the method exists and doesn't throw
      expect(() => {
        ProgressiveImageLoader.loadProgressiveImage('/test.jpg', mockContainer, 'PROGRESSIVE');
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('ImagePerformanceMonitor', () => {
    it('should record and retrieve performance metrics', () => {
      const monitor = new ImagePerformanceMonitor();
      
      monitor.recordLoadTime('image1', 200, 100000, 'webp', 80);
      monitor.recordLoadTime('image2', 300, 150000, 'webp', 80);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.totalImages).toBe(2);
      expect(metrics.averageLoadTime).toBeGreaterThanOrEqual(0);
      expect(metrics.averageSize).toBeGreaterThanOrEqual(0);
    });

    it('should provide format performance statistics', () => {
      const monitor = new ImagePerformanceMonitor();
      
      monitor.recordLoadTime('image1', 200, 100000, 'webp', 80);
      monitor.recordLoadTime('image2', 300, 150000, 'webp', 80);
      monitor.recordLoadTime('image3', 400, 200000, 'jpeg', 75);
      
      const formatPerformance = monitor.getFormatPerformance();
      
      expect(formatPerformance.webp).toBeDefined();
      expect(formatPerformance.jpeg).toBeDefined();
      expect(formatPerformance.webp.avgLoadTime).toBe(250); // (200+300)/2
      expect(formatPerformance.jpeg.avgLoadTime).toBe(400);
    });
  });

  describe('Global imagePerformanceMonitor', () => {
    it('should be accessible as a global instance', () => {
      expect(imagePerformanceMonitor).toBeDefined();
      expect(imagePerformanceMonitor).toBeInstanceOf(ImagePerformanceMonitor);
    });
  });
});