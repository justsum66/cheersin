import Groq from 'groq-sdk'
import type { ChatMessage, ChatUsage } from '@/types/chat-messages'
import { logger } from './logger'
import {
  CHAT_TIMEOUT_MS,
  GROQ_API_KEY,
  GROQ_CHAT_MODEL,
  GROQ_VISION_MODEL,
  GROQ_VISION_API_KEY,
  GROQ_SOUL_WINE_API_KEY,
} from './env-config'
import { getTaiwanWinesContext } from './taiwan-wines'

/** Re-export for route/recordApiCall 使用 */
export { GROQ_CHAT_MODEL, GROQ_VISION_MODEL }
export type { ChatMessage, ChatUsage }

export const groq = new Groq({
  apiKey: GROQ_API_KEY || undefined,
  timeout: CHAT_TIMEOUT_MS,
})

const visionClient = GROQ_VISION_API_KEY
  ? new Groq({ apiKey: GROQ_VISION_API_KEY, timeout: CHAT_TIMEOUT_MS })
  : groq
const soulWineClient = GROQ_SOUL_WINE_API_KEY
  ? new Groq({ apiKey: GROQ_SOUL_WINE_API_KEY, timeout: CHAT_TIMEOUT_MS })
  : groq

/** 品酒助手系統提示：WSET Level 4 + CMS Level 3 + MW 等級，供 API 與 lib 共用 */
export const SOMMELIER_SYSTEM_PROMPT = `你是 Cheersin 的 AI 品酒助手「酒神」，具備 WSET Level 4 Diploma、CMS Certified Sommelier Advanced、葡萄酒大師（Master of Wine, MW）及烈酒/清酒/啤酒等各領域最高認證等級的綜合分析能力。

知識與表述標準：
- 葡萄酒：產區 typicity、品種特徵、釀造與陳年、Viticulture & Vinification、市場與法規（WSET L4 / MW 標準）
- 侍酒與餐搭：CMS 高級侍酒師的服務流程、溫度與器皿、菜餚搭配邏輯、酒單設計思維
- 烈酒／清酒／啤酒：各類別最高認證（如 WSET Spirits、SSI、Cicerone）的術語與品評架構
- 品酒方法：視覺／嗅覺／味覺／結論的結構化描述，使用國際通用術語（如 WSET Systematic Approach to Tasting）
- 表述可依用戶程度調整深淺，但內容須嚴謹、可追溯至上述認證教材與實務

你的個性：
- 可輕鬆幽默，但專業問題須精準、有依據
- 推薦酒款時說明產區、品種、風格與場合，不提供具體購買連結，僅類型或品牌方向
- 適時提醒「飲酒過量有害健康」「未滿 18 歲禁止飲酒」

重要規則：
- 與酒無關的問題友善導回酒類話題
- 回答簡潔有結構，一般 150–300 字；複雜題可分段
- 引用產區、法規、品種時務求正確，不確定時說明為「一般常見說法」或建議查證

結構化酒款（任務 141, 143-145）：當你推薦「具體酒款」時（例如品名、產區、類型明確），請在回覆「結尾」另起一行加上以下區塊，且不要在其他地方重複酒款清單內容。區塊格式為兩行：第一行為 [WINES]，第二行為單一 JSON 陣列，第三行為 [/WINES]。JSON 陣列中每個物件欄位：id（字串，唯一，如 "w1"）、name（酒款名稱）、type（類型，如 "紅酒"/"白酒"/"威士忌"）、region（選填）、country（選填）、description（選填，簡短）、price（選填，字串如 "NT$ 800"）、rating（選填，1–5 或 0–100）、buyLink（選填，購買連結）、variety（選填，品種）、tags（選填，字串陣列）。若沒有推薦具體酒款則不要輸出 [WINES] 區塊。範例：
[WINES]
[{"id":"w1","name":"貓頭鷹莊園 黑皮諾","type":"紅酒","region":"勃艮第","country":"法國","description":"輕盈果香","price":"NT$ 1,200","rating":4.5}]
[/WINES]
`

/** 用戶背景（星座、MBTI、靈魂酒款、場合、預算、RAG、人格等）136-139 */
export interface SommelierUserContext {
  zodiac?: string
  mbti?: string
  soulWine?: string
  preferredWineTypes?: string[]
  /** 137 場合：約會/聚餐/獨酌 */
  occasion?: string
  /** 138 預算範圍 */
  budget?: string
  /** 人格：professional 嚴謹專業 / humorous 幽默輕鬆（90） */
  personality?: 'professional' | 'humorous'
  ragContext?: string
  ragSources?: { index: number; source: string; text: string }[]
  recentTurns?: { role: string; content: string }[]
  /** EXPERT_60 P3 B1-50：偏好回覆語言（如 en、ja）；未設或 zh-TW 則預設繁中 */
  preferredLanguage?: string
  /** P2-378 / P2-404：遊戲列表摘要，供推薦遊戲與派對/遊戲配酒時使用 */
  gamesListForPrompt?: string
  /** R2-022：調酒題材（TheCocktailDB 搜尋結果），用戶問調酒時由 chat 注入 */
  cocktailContext?: string
}

const PERSONALITY_PRO = `請以「嚴謹專業」侍酒師風格回答：用詞精準、少用口語與表情符號、著重產區與品種、適時引用專業術語。`
const PERSONALITY_FUN = `請以「幽默輕鬆」風格回答：可適時使用表情符號、口語化、穿插酒類冷知識或趣味比喻。`

/** P2-396：AI 人格設定 — 依 userContext.personality 切換專業/幽默風格，單一來源供所有 chat 路徑使用 */
/** 依 userContext 建出完整系統提示（單一來源）；140 台灣在地酒款資料庫一併注入 */
export function getSommelierSystemPrompt(userContext?: SommelierUserContext): string {
  let systemPrompt = SOMMELIER_SYSTEM_PROMPT
  const taiwanContext = getTaiwanWinesContext()
  if (taiwanContext) {
    systemPrompt += `\n\n台灣在地酒款參考（任務 140，用戶問台灣/在地/國產時可優先推薦）：\n${taiwanContext}`
  }
  if (userContext?.personality === 'professional') {
    systemPrompt += `\n\n${PERSONALITY_PRO}`
  } else {
    systemPrompt += `\n\n${PERSONALITY_FUN}`
  }
  if (!userContext) return systemPrompt
  systemPrompt += `\n\n用戶背景資訊：`
  if (userContext.zodiac) systemPrompt += `\n- 星座：${userContext.zodiac}`
  if (userContext.mbti) systemPrompt += `\n- MBTI：${userContext.mbti}`
  if (userContext.soulWine) systemPrompt += `\n- 靈魂酒款（靈魂酒測結果）：${userContext.soulWine}，推薦時請優先考慮此偏好`
  if (userContext.occasion) systemPrompt += `\n- 場合：${userContext.occasion}`
  if (userContext.budget) systemPrompt += `\n- 預算：${userContext.budget}`
  if (userContext.preferredWineTypes?.length) {
    systemPrompt += `\n- 偏好酒類：${userContext.preferredWineTypes.join('、')}`
  }
  if (userContext.recentTurns?.length) {
    systemPrompt += `\n\n近期對話（請延續上下文）：\n${userContext.recentTurns.map((t) => `${t.role}: ${t.content}`).join('\n')}`
  }
  if (userContext.ragContext) {
    systemPrompt += `\n\n參考以下內容回答，並在引用處標注來源編號 [1]、[2] 等：\n${userContext.ragContext}`
  }
  /** R2-022：調酒題材 — 用戶問調酒/雞尾酒時請依此資料回答配方與作法 */
  if (userContext.cocktailContext) {
    systemPrompt += `\n\n以下為調酒資料（TheCocktailDB），請依用戶問題從中引用並說明配方與作法：\n${userContext.cocktailContext}`
  }
  /** P2-378 推薦遊戲 / P2-404 派對・遊戲配酒：注入遊戲列表與行為指示 */
  if (userContext.gamesListForPrompt) {
    systemPrompt += `\n\n派對遊戲與配酒：\n- 當用戶問「推薦遊戲」「玩什麼」「幾個人玩」「派對玩什麼」時，請從以下列表依人數與氛圍推薦 2～3 款，並可提及本站遊戲頁 /games。\n- 當用戶問「派對配酒」「遊戲配酒」「玩 XX 喝什麼酒」時，請推薦 2～3 款適合該場合的酒款並簡短說明理由。\n遊戲列表：\n${userContext.gamesListForPrompt}`
  }
  /** P2-398：AI 多語言 — 依 preferredLanguage 要求回覆語言（六語系：繁中/簡中/粵/英/日/韓） */
  const localeToLangName: Record<string, string> = {
    'zh-TW': '繁體中文',
    'zh-CN': '简体中文',
    'yue': '粵語',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어',
  }
  if (userContext?.preferredLanguage) {
    const langName = localeToLangName[userContext.preferredLanguage] ?? userContext.preferredLanguage
    systemPrompt += `\n\n請以以下語言回覆：${langName}。若用戶以該語言提問，請全程使用該語言回答。`
  }
  return systemPrompt
}

export async function chatWithSommelier(
  messages: ChatMessage[],
  userContext?: SommelierUserContext
): Promise<{ text: string; usage?: ChatUsage }> {
  const systemPrompt = getSommelierSystemPrompt(userContext)

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    model: GROQ_CHAT_MODEL,
    temperature: 0.8,
    max_tokens: 1024,
  })

  const text = completion.choices[0]?.message?.content || '抱歉，我暫時無法回答，請稍後再試。'
  const usage = completion.usage
    ? {
      prompt_tokens: completion.usage.prompt_tokens ?? 0,
      completion_tokens: completion.usage.completion_tokens ?? 0,
      total_tokens: completion.usage.total_tokens ?? 0,
    }
    : undefined
  return { text, usage }
}

/** Groq streaming：逐 token 回傳，供打字機效果使用 */
export async function* chatWithSommelierStream(
  messages: ChatMessage[],
  userContext?: SommelierUserContext
): AsyncGenerator<string> {
  const systemPrompt = getSommelierSystemPrompt(userContext)
  const stream = await groq.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    model: GROQ_CHAT_MODEL,
    temperature: 0.8,
    max_tokens: 1024,
    stream: true,
  })
  for await (const chunk of stream as AsyncIterable<{ choices?: { delta?: { content?: string } }[] }>) {
    const content = chunk.choices?.[0]?.delta?.content
    if (typeof content === 'string') yield content
  }
}

/** B1-46 酒標辨識：多模態訊息（最後一則 user 可為 content 陣列含 text + image_url），使用 Groq Vision 模型 */
export type MultimodalContentPart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
export type VisionMessage = { role: 'user'; content: string | MultimodalContentPart[] } | { role: 'assistant' | 'system'; content: string }

export async function chatWithSommelierVision(
  messages: VisionMessage[],
  userContext?: SommelierUserContext
): Promise<string> {
  const systemPrompt = getSommelierSystemPrompt(userContext)
  const completion = await visionClient.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    model: GROQ_VISION_MODEL,
    temperature: 0.7,
    max_tokens: 1024,
  })
  return completion.choices[0]?.message?.content ?? '無法辨識圖片，請稍後再試。'
}

// 生成靈魂酒款結果
export async function generateSoulWineResult(
  answers: Record<string, string>,
  zodiac: string
): Promise<{
  wineType: string
  wineName: string
  description: string
  traits: string[]
  recommendation: string
}> {
  const prompt = `根據以下測驗答案，為這位${zodiac}座的用戶生成「靈魂酒款」分析結果。

測驗答案：
${Object.entries(answers).map(([q, a]) => `${q}: ${a}`).join('\n')}

請以 JSON 格式回覆，包含：
{
  "wineType": "酒款類型（如：紅葡萄酒、威士忌、清酒等）",
  "wineName": "推薦的具體酒款或品種名稱",
  "description": "150字左右的個人化描述，解釋為什麼這款酒與用戶的性格契合，要有趣且帶有命理元素",
  "traits": ["特質1", "特質2", "特質3"],
  "recommendation": "一句話的品飲建議或小提醒"
}

只回覆 JSON，不要其他文字。`

  const completion = await soulWineClient.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: GROQ_CHAT_MODEL,
    temperature: 0.9,
    max_tokens: 1024,
  })

  const content = completion.choices[0]?.message?.content || ''

  try {
    // 嘗試解析 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    logger.error('Failed to parse soul wine result', { err: e instanceof Error ? e.message : String(e) })
  }

  // 預設回覆
  return {
    wineType: '紅葡萄酒',
    wineName: 'Pinot Noir 黑皮諾',
    description: `作為${zodiac}座，你的靈魂深處住著一瓶神秘的黑皮諾。你優雅而複雜，表面看起來平靜，但內心充滿層次。`,
    traits: ['優雅', '神秘', '多層次'],
    recommendation: '適合在安靜的夜晚，搭配一本好書慢慢品味。',
  }
}
