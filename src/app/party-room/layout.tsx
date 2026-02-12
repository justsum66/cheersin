import ErrorBoundaryBlock from '@/components/ErrorBoundaryBlock'

/** PR-26：派對房頁面外層 ErrorBoundary，避免 fetchRoom/fetchPartyState 或子組件錯誤導致整頁白屏 */
export default function PartyRoomLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundaryBlock blockName="派對直播房">{children}</ErrorBoundaryBlock>
}
