# 遊戲審查與縮減至 85 款

**日期：** 2026-02-13  
**依據：** 遊戲審查縮減至85款計畫（合併相似度 ≥70%、移除不吸引或不利手機之遊戲）

## 一、評分維度（各 1～10）

| 維度 | 說明 |
|------|------|
| 題庫 | 題目數量與品質、可擴充性、重複感低 |
| 內容 | 規則完整度、情境感、與酒/派對連結 |
| 動畫 | 入場/反饋/結束動畫、音效、觸覺、尊重 reducedMotion |
| UX | 流程清晰、按鈕夠大、觸控友善、載入與錯誤狀態 |
| 吸引力 | 派對情境娛樂與重玩價值 |
| 手機適合度 | 小螢幕可玩、不需鍵盤/大畫布/實體動作 |

## 二、合併決策（相似度 ≥70%）

| 保留 id | 移除 id | 理由 |
|--------|---------|------|
| guess-song | finish-lyric | 皆為歌詞/歌名猜題，保留猜歌名 |
| reaction-master | reaction-speed | 皆為反應時間類，保留反應大師 |
| tongue-twister | tongue-challenge | 皆為繞口令/口說挑戰 |
| photo-guess | emoji-puzzle | 皆為看圖/Emoji 猜答案 |
| chemistry-test | soul-mate, match-answer | 皆為兩人默契/同時選項，保留默契大考驗 |
| spot-diff | color-blind | 皆為視覺辨識類 |

## 三、移除決策（吸引力低或不利手機）

| id | 理由 |
|----|------|
| fast-type | 打字為主，手機鍵盤體驗差 |
| draw-guess | 小螢幕畫圖體驗差，需較大畫布 |
| music-chair | 需實體搶位，不適合純手機 |
| bottle-cap | 實體彈射動作，不適合純螢幕 |
| rhythm-master | 節奏精準度在小螢幕上難度高 |
| balance-game | 玩法較單薄、差異化不足 |
| late-night | 與其他話題分享類重疊 |

## 四、本次移除的 14 款 id 清單

1. finish-lyric  
2. reaction-speed  
3. tongue-challenge  
4. emoji-puzzle  
5. soul-mate  
6. match-answer  
7. color-blind  
8. fast-type  
9. draw-guess  
10. music-chair  
11. bottle-cap  
12. rhythm-master  
13. balance-game  
14. late-night  

## 五、最終 85 款遊戲 id 清單

經合併與移除後，以下 85 款保留於 GAMES_META 與 GameLazyMap：

truth-or-dare, roulette, trivia, dice, never-have-i-ever, kings-cup, baskin-robbins-31, up-down-stairs, countdown-toast, random-picker, high-low, titanic, name-train, liar-dice, who-is-undercover, werewolf-lite, heartbeat-challenge, mimic-face, chemistry-test, charades, would-you-rather, punishment-wheel, who-most-likely, secret-reveal, thirteen-cards, blackjack, hot-potato, seven-tap, dare-dice, toast-relay, number-bomb, 369-clap, buzz-game, category-chain, two-truths-one-lie, spicy-truth-or-dare, spicy-never-have-i-ever, spicy-who-most-likely, between-cards, russian-roulette, couple-test, spicy-would-you-rather, paranoia-game, secret-confession, dare-cards, mind-reading, spicy-dice, reaction-master, drinking-culture, jiuling, wine-memory-match, history-trivia, true-false-news, who-said-it, anime-quiz, tongue-twister, emoji-battle, impersonation, impromptu-speech, alcohol-trivia, psych-quiz, drunk-truth, drinking-word, guess-song, photo-guess, word-chain, team-guess, photo-bomb, taboo, spot-diff, quick-math, shot-roulette, emotion-read, dice-war, price-guess, lucky-draw, bluffing, telephone, tic-tac-shot, compliment-battle, cocktail-mix, reverse-say, riddle-guess, story-chain, memory-match

## 六、衍生更新

- **GUEST_TRIAL_GAME_IDS**：未變更（dice, roulette, trivia, never-have-i-ever, liar-dice 皆保留）。
- **播放列表**：使用者可能存過已下架遊戲 id；前端依序播放時跳過不存在的 id。
- **R2-011 / game-list-scoring-research**：已於本輪更新當前數量與決策摘要。
