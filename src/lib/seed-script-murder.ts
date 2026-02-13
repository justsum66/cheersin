/**
 * 劇本殺種子資料：當 scripts 表為空時可寫入 8 支劇本（與 migrations 一致）。
 * 供 GET /api/scripts 空表時自動種子，或 npm run seed:scripts 使用。
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export const SCRIPT_SEED_LIST = [
  { id: 'a0e00001-0001-4000-8000-000000000001', title: '酒局真相', slug: 'wine-truth-01', duration_min: 20, min_players: 4, max_players: 6, is_18_plus: false },
  { id: 'a0e00002-0002-4000-8000-000000000002', title: '派對疑雲', slug: 'party-mystery-02', duration_min: 25, min_players: 4, max_players: 8, is_18_plus: false },
  { id: 'a0e00003-0003-4000-8000-000000000003', title: '午夜酒莊', slug: 'midnight-winery-03', duration_min: 30, min_players: 5, max_players: 8, is_18_plus: false },
  { id: 'a0e00004-0004-4000-8000-000000000004', title: '醉後告白', slug: 'drunk-confession-04', duration_min: 25, min_players: 4, max_players: 6, is_18_plus: true },
  { id: 'a0e00005-0005-4000-8000-000000000005', title: '職場酒局', slug: 'office-party-05', duration_min: 22, min_players: 4, max_players: 6, is_18_plus: false },
  { id: 'a0e00006-0006-4000-8000-000000000006', title: '旅行團疑雲', slug: 'wine-tour-06', duration_min: 24, min_players: 4, max_players: 6, is_18_plus: false },
  { id: 'a0e00007-0007-4000-8000-000000000007', title: '婚宴風波', slug: 'wedding-toast-07', duration_min: 28, min_players: 4, max_players: 8, is_18_plus: false },
  { id: 'a0e00008-0008-4000-8000-000000000008', title: '新年派對', slug: 'new-year-eve-08', duration_min: 20, min_players: 4, max_players: 6, is_18_plus: false },
] as const

/** 每支劇本至少 1 章、2 角，避免列表/詳情頁報錯 */
export const CHAPTER_SEED: Array<{ script_id: string; chapter_index: number; title: string; content: string }> = [
  { script_id: 'a0e00001-0001-4000-8000-000000000001', chapter_index: 0, title: '開場', content: '{"type":"narrative","text":"今晚的派對，有人說謊、有人藏著秘密。請依照你的角色卡行動，找出誰在說謊。"}' },
  { script_id: 'a0e00002-0002-4000-8000-000000000002', chapter_index: 0, title: '開場', content: '[{"type":"narrative","text":"派對中有人偷喝了主人的珍藏。大家輪流發言，找出誰是偷喝的人。"}]' },
  { script_id: 'a0e00003-0003-4000-8000-000000000003', chapter_index: 0, title: '酒莊大門', content: '[{"type":"narrative","text":"暴風雨夜，你們受邀參加酒莊主人的私人品酒會。推開厚重的橡木大門……"}]' },
  { script_id: 'a0e00004-0004-4000-8000-000000000004', chapter_index: 0, title: '派對開始', content: '[{"type":"narrative","text":"大學畢業五年後的同學聚會。包廂裡燈光昏暗，音樂剛好。"}]' },
  { script_id: 'a0e00005-0005-4000-8000-000000000005', chapter_index: 0, title: '下班後的包廂', content: '[{"type":"narrative","text":"部門慶功宴，大家終於可以放下工作喝一杯。"}]' },
  { script_id: 'a0e00006-0006-4000-8000-000000000006', chapter_index: 0, title: '酒莊接待廳', content: '[{"type":"narrative","text":"你們是一團酒莊一日遊的旅客。導遊剛宣布：有一瓶限量紀念酒不翼而飛。"}]' },
  { script_id: 'a0e00007-0007-4000-8000-000000000007', chapter_index: 0, title: '喜宴開始', content: '[{"type":"narrative","text":"新郎新娘的敬酒環節，有人發現主桌的紀念酒被換成了普通紅酒。"}]' },
  { script_id: 'a0e00008-0008-4000-8000-000000000008', chapter_index: 0, title: '倒數前一小時', content: '[{"type":"narrative","text":"跨年派對，有人把大家的香檳藏起來了。"}]' },
]

export const ROLE_SEED: Array<{ script_id: string; role_name: string; role_description: string; secret_clue: string }> = [
  { script_id: 'a0e00001-0001-4000-8000-000000000001', role_name: '偵探', role_description: '你可以多問一個問題', secret_clue: '今晚沒有人說真話。' },
  { script_id: 'a0e00001-0001-4000-8000-000000000001', role_name: '說謊者', role_description: '你的其中一句必須是謊言', secret_clue: '你是說謊者，別被投出去。' },
  { script_id: 'a0e00002-0002-4000-8000-000000000002', role_name: '主人', role_description: '你知道酒放在哪裡', secret_clue: '你的珍藏被動過了。' },
  { script_id: 'a0e00002-0002-4000-8000-000000000002', role_name: '偷喝者', role_description: '你偷喝了一口', secret_clue: '別被投出去，裝無辜。' },
  { script_id: 'a0e00003-0003-4000-8000-000000000003', role_name: '莊主', role_description: '這座酒莊的主人', secret_clue: '你的保險剛好涵蓋失竊品。' },
  { script_id: 'a0e00003-0003-4000-8000-000000000003', role_name: '侍酒師', role_description: '在酒莊工作多年', secret_clue: '你知道酒窖暗門的位置。' },
  { script_id: 'a0e00004-0004-4000-8000-000000000004', role_name: '暗戀者', role_description: '你暗戀在座的某個人已經五年了', secret_clue: '你暗戀的人就坐在你對面。' },
  { script_id: 'a0e00004-0004-4000-8000-000000000004', role_name: '前任', role_description: '你和在座的某人曾經交往過', secret_clue: '你們分手的真正原因從來沒對彼此說過。' },
  { script_id: 'a0e00005-0005-4000-8000-000000000005', role_name: '老鳥', role_description: '你在公司十年', secret_clue: '你知道那瓶酒是誰送的。' },
  { script_id: 'a0e00005-0005-4000-8000-000000000005', role_name: '新人', role_description: '剛報到三個月', secret_clue: '你無意中看到有人換酒。' },
  { script_id: 'a0e00006-0006-4000-8000-000000000006', role_name: '網紅', role_description: '你是來拍片打卡的', secret_clue: '你其實有順手拿了一瓶小樣。' },
  { script_id: 'a0e00006-0006-4000-8000-000000000006', role_name: '領隊', role_description: '負責帶隊的旅行社人員', secret_clue: '你知道酒放在哪裡。' },
  { script_id: 'a0e00007-0007-4000-8000-000000000007', role_name: '前任桌', role_description: '你是新郎或新娘的前任', secret_clue: '你來是想看看他/她過得好不好。' },
  { script_id: 'a0e00007-0007-4000-8000-000000000007', role_name: '婚顧', role_description: '婚禮顧問', secret_clue: '你為了流程順暢，事先把主桌酒收起來了。' },
  { script_id: 'a0e00008-0008-4000-8000-000000000008', role_name: '派對王', role_description: '你負責炒熱氣氛', secret_clue: '香檳是你藏的。' },
  { script_id: 'a0e00008-0008-4000-8000-000000000008', role_name: '主持人', role_description: '派對主辦', secret_clue: '你設計了找香檳遊戲。' },
]

/**
 * 當 scripts 表為空時寫入 8 支劇本與最少章節/角色，使列表與詳情可正常顯示。
 * 使用 upsert(scripts, onConflict: 'slug') 避免重複插入；章節/角色僅在該 script 尚無資料時插入。
 */
export async function runSeedScriptsIfEmpty(supabase: SupabaseClient): Promise<boolean> {
  const { data: existing } = await supabase.from('scripts').select('id').limit(1)
  if ((existing ?? []).length > 0) return false

  const { error: scriptsError } = await supabase
    .from('scripts')
    .upsert([...SCRIPT_SEED_LIST], { onConflict: 'slug' })
  if (scriptsError) return false

  for (const scriptId of SCRIPT_SEED_LIST.map((s) => s.id)) {
    const { data: chHas } = await supabase.from('script_chapters').select('id').eq('script_id', scriptId).limit(1)
    if ((chHas ?? []).length === 0) {
      const chapters = CHAPTER_SEED.filter((c) => c.script_id === scriptId)
      if (chapters.length > 0) {
        await supabase.from('script_chapters').insert(chapters.map((c) => ({ script_id: c.script_id, chapter_index: c.chapter_index, title: c.title, content: c.content })))
      }
    }
    const { data: roleHas } = await supabase.from('script_roles').select('id').eq('script_id', scriptId).limit(1)
    if ((roleHas ?? []).length === 0) {
      const roles = ROLE_SEED.filter((r) => r.script_id === scriptId)
      if (roles.length > 0) {
        await supabase.from('script_roles').insert(roles.map((r) => ({ script_id: r.script_id, role_name: r.role_name, role_description: r.role_description, secret_clue: r.secret_clue })))
      }
    }
  }
  return true
}
