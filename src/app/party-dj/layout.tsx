import ErrorBoundaryBlock from '@/components/ErrorBoundaryBlock'

/** Party DJ 30 #28：頁面外層 ErrorBoundary，避免整頁白屏 */
export default function PartyDJLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundaryBlock blockName="AI 派對 DJ">{children}</ErrorBoundaryBlock>
}
