/**
 * P1-097: 錯誤邊界處理優化系統
 * 提供完整的錯誤邊界處理和用戶體驗優化
 */

import React, { Component, ReactNode } from 'react';

// 錯誤資訊介面
interface ErrorInfo {
  componentStack: string;
  error: Error;
}

// 錯誤邊界狀態
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showErrorDetails: boolean;
}

// 錯誤邊界屬性
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; errorInfo: ErrorInfo | null; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  className?: string;
  resetText?: string;
  errorTitle?: string;
  errorMessage?: string;
}

// 預設錯誤回退 UI
const DefaultErrorFallback: React.FC<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
}> = ({ error, errorInfo, resetError }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-red-100 to-rose-100 p-4">
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">哎呀，出了點問題</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            我們已經記錄了這個問題，正在努力修復中。
            請稍後重試或刷新頁面。
          </p>
          
          <div className="mt-8">
            <button
              onClick={resetError}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
            >
              重新載入頁面
            </button>
          </div>

          {error && (
            <div className="mt-8 text-left">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-gray-500 hover:text-gray-700 underline font-medium transition-colors"
              >
                {showDetails ? '隱藏' : '顯示'} 錯誤詳情
              </button>
              
              {showDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">錯誤訊息：</h3>
                  <p className="mt-1 text-sm text-gray-600 bg-white p-3 rounded-lg border">
                    {error.message}
                  </p>
                  
                  {errorInfo && (
                    <>
                      <h3 className="mt-4 text-sm font-semibold text-gray-900 mb-2">組件堆疊：</h3>
                      <pre className="mt-1 text-xs text-gray-600 bg-white p-3 rounded-lg border overflow-auto max-h-40 whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 主要錯誤邊界組件
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const enhancedErrorInfo: ErrorInfo = {
      error,
      componentStack: errorInfo.componentStack || '',
    };

    this.setState({ errorInfo: enhancedErrorInfo });

    // 呼叫外部錯誤處理函數
    if (this.props.onError) {
      this.props.onError(error, enhancedErrorInfo);
    }

    // 發送錯誤到監控服務（如果有的話）
    this.logErrorToService(error, enhancedErrorInfo);
  }

  // 記錄錯誤到外部服務
  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // 在生產環境中，可以發送到 Sentry、LogRocket 等錯誤監控服務
    if (process.env.NODE_ENV === 'production') {
      console.error('Error caught by boundary:', error, errorInfo);
      // 這裡可以整合錯誤監控服務
      //例如：
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, {
      //     contexts: { react: { componentStack: errorInfo.componentStack } }
      //   });
      // }
    } else {
      // 開發環境直接輸出到控制台
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  // 重置錯誤狀態
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    });

    // 呼叫外部重置函數
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  // 切換錯誤詳情顯示
  toggleErrorDetails = (): void => {
    this.setState(prevState => ({
      showErrorDetails: !prevState.showErrorDetails,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// 錯誤邊界 Hook 版本
export function useErrorBoundary(): {
  hasError: boolean;
  error: Error | null;
  resetError: () => void;
  setError: (error: Error) => void;
} {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setHasError(false);
    setError(null);
  }, []);

  const setErrorHandler = React.useCallback((error: Error) => {
    setError(error);
    setHasError(true);
  }, []);

  return { hasError, error, resetError, setError: setErrorHandler };
}

// 高階組件版本
export function withErrorBoundary<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  errorFallback?: React.ComponentType<{ error: Error | null; errorInfo: ErrorInfo | null; resetError: () => void }>
): React.ComponentType<T> {
  const WrappedComponent: React.FC<T> = (props: T) => {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

// 錯誤邊界 Provider
interface ErrorBoundaryProviderProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; errorInfo: ErrorInfo | null; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

const ErrorBoundaryContext = React.createContext<{
  reportError: (error: Error, errorInfo?: React.ErrorInfo) => void;
  resetError: () => void;
}>({
  reportError: () => {},
  resetError: () => {},
});

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
  fallback,
  onError,
}) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = React.useState<ErrorInfo | null>(null);

  const reportError = React.useCallback((error: Error, reactErrorInfo?: React.ErrorInfo) => {
    setError(error);
    if (reactErrorInfo) {
      setErrorInfo({
        error,
        componentStack: reactErrorInfo.componentStack || '',
      });
    }

    if (onError) {
      onError(error, {
        error,
        componentStack: reactErrorInfo?.componentStack || '',
      });
    }
  }, [onError]);

  const resetError = React.useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);

  if (error) {
    const FallbackComponent = fallback || DefaultErrorFallback;
    return (
      <FallbackComponent
        error={error}
        errorInfo={errorInfo}
        resetError={resetError}
      />
    );
  }

  return (
    <ErrorBoundaryContext.Provider value={{ reportError, resetError }}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
};

// 使用錯誤邊界 Context 的 Hook
export function useErrorBoundaryContext() {
  return React.useContext(ErrorBoundaryContext);
}

// 匯出類型
export type { ErrorInfo, ErrorBoundaryProps, ErrorBoundaryState };