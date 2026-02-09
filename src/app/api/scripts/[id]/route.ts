/**
 * 殺手 #14/#18：單一劇本詳情 API（含 chapters、roles）
 * GET /api/scripts/[id] — 18+ 時依訂閱與權限檢查
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/get-current-user'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return errorResponse(400, 'Invalid id', { message: '缺少劇本 ID' })

    const supabase = createServerClient()
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select('id, title, slug, duration_min, min_players, max_players, is_18_plus')
      .eq('id', id)
      .single()

    if (scriptError || !script) {
      if ((scriptError as { code?: string })?.code === 'PGRST116') {
        return errorResponse(404, 'Not found', { message: '找不到該劇本' })
      }
      return serverErrorResponse(scriptError)
    }

    /** #19：18+ 劇本需 basic/premium 或未鎖定僅回傳摘要 */
    const user = await getCurrentUser()
    let subscriptionTier = 'free'
    if (user?.id) {
      const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
      subscriptionTier = (profile?.subscription_tier as string) ?? 'free'
    }
    const is18Plus = (script as { is_18_plus?: boolean }).is_18_plus === true
    const canAccess18 = subscriptionTier === 'basic' || subscriptionTier === 'premium'
    if (is18Plus && !canAccess18) {
      return NextResponse.json({
        id: script.id,
        title: (script as { title: string }).title,
        slug: (script as { slug: string | null }).slug,
        durationMin: (script as { duration_min: number | null }).duration_min,
        minPlayers: (script as { min_players: number | null }).min_players,
        maxPlayers: (script as { max_players: number | null }).max_players,
        is18Plus: true,
        locked: true,
        message: '此劇本為 18+ 限定，請升級訂閱後遊玩',
      }, { status: 200 })
    }

    const [chaptersRes, rolesRes] = await Promise.all([
      supabase
        .from('script_chapters')
        .select('id, script_id, chapter_index, title, content')
        .eq('script_id', id)
        .order('chapter_index', { ascending: true }),
      supabase
        .from('script_roles')
        .select('id, script_id, role_name, role_description, secret_clue')
        .eq('script_id', id),
    ])

    if (chaptersRes.error) return serverErrorResponse(chaptersRes.error)
    if (rolesRes.error) return serverErrorResponse(rolesRes.error)

    const chapters = (chaptersRes.data ?? []).map((ch) => ({
      id: (ch as { id: string }).id,
      scriptId: (ch as { script_id: string }).script_id,
      chapterIndex: (ch as { chapter_index: number }).chapter_index,
      title: (ch as { title: string }).title,
      content: (ch as { content: string | null }).content,
    }))
    const SECRET_CLUE_MAX_LENGTH = 500
    const roles = (rolesRes.data ?? []).map((r) => {
      let clue = (r as { secret_clue: string | null }).secret_clue
      if (typeof clue === 'string' && clue.length > SECRET_CLUE_MAX_LENGTH) clue = clue.slice(0, SECRET_CLUE_MAX_LENGTH)
      return {
        id: (r as { id: string }).id,
        scriptId: (r as { script_id: string }).script_id,
        roleName: (r as { role_name: string }).role_name,
        roleDescription: (r as { role_description: string | null }).role_description,
        secretClue: clue ?? null,
      }
    })

    return NextResponse.json({
      id: (script as { id: string }).id,
      title: (script as { title: string }).title,
      slug: (script as { slug: string | null }).slug,
      durationMin: (script as { duration_min: number | null }).duration_min,
      minPlayers: (script as { min_players: number | null }).min_players,
      maxPlayers: (script as { max_players: number | null }).max_players,
      is18Plus: is18Plus,
      chapters,
      roles,
    })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
