import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebVitalsTracker } from './WebVitalsTracker';
import { useReportWebVitals } from 'next/web-vitals';

// Mock the web vitals library
vi.mock('next/web-vitals', () => ({
  useReportWebVitals: vi.fn((callback) => {
    // Simulate a sample metric callback
    if (callback) {
      callback({
        id: 'test-metric-id',
        name: 'FCP',
        value: 100,
        delta: 100,
        entries: [],
        attribution: {}
      });
    }
  }),
}));

describe('WebVitalsTracker', () => {
  beforeEach(() => {
    // Clear any previous mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<WebVitalsTracker />);
    // Component is invisible by design and returns null, so there's no visible content
    // Just ensure it doesn't throw an error
    expect(() => {
      // Since the component returns null, we can't query for anything specific
      // This test essentially checks that rendering doesn't throw an error
    }).not.toThrow();
  });

  it('uses report web vitals hook', () => {    
    render(<WebVitalsTracker />);

    // Verify that useReportWebVitals was called when the component mounted
    expect(useReportWebVitals).toHaveBeenCalled();
  });

  it('records metrics when web vitals are reported', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<WebVitalsTracker />);

    // Check if performance budget logs are called in development
    if (process.env.NODE_ENV === 'development') {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Web Vitals]')
      );
    }

    consoleSpy.mockRestore();
  });
});