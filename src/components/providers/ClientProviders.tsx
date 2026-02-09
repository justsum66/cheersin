'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { I18nProvider } from '@/contexts/I18nContext'
import { NavVisibilityProvider } from '@/contexts/NavVisibilityContext'
import { ApiLoadingProvider } from '@/contexts/ApiLoadingContext'
import { ErrorAnnouncerProvider } from '@/contexts/ErrorAnnouncerContext'
import { UserProvider } from '@/contexts/UserContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { WineGlassLoading } from '@/components/ui/WineGlassLoading'
import { useApiLoading } from '@/contexts/ApiLoadingContext'
import PwaProvider from '@/components/pwa/PwaProvider'

/** 客戶端 Provider 彙總：Theme + API 載入（119）+ 錯誤播報（130） */
function ApiLoadingOverlay() {
  const { loading } = useApiLoading()
  return <WineGlassLoading show={loading} />
}

/** R2-025：react-query 統一 query 快取與重試 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
    <ThemeProvider>
      <I18nProvider>
      <ToastProvider>
        <UserProvider>
          <NavVisibilityProvider>
            <ErrorAnnouncerProvider>
              <ApiLoadingProvider>
                <ApiLoadingOverlay />
                {children}
                <PwaProvider />
              </ApiLoadingProvider>
            </ErrorAnnouncerProvider>
          </NavVisibilityProvider>
        </UserProvider>
      </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
    </QueryClientProvider>
  )
}
