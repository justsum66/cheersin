# 六地用戶視角：遊戲與課程審查（台灣、香港、大陸、韓國、日本、新加坡）

## 遊戲：刪除 10 個最低吸引力

依六地 persona（派對/酒桌/情侶、文化接受度、設備依賴）評估，以下 10 個從前台列表移除（仍保留組件供直連）：

| ID | 名稱 | 理由 |
|----|------|------|
| voice-mod | 變聲器 | 設備/麥克風依賴高，泛亞接受度較低 |
| lip-sync-battle | 對嘴大賽 | 需表演，門檻高 |
| beer-pong-vr | 虛擬啤酒乒乓球 | VR/設備依賴，不適合多數行動場景 |
| dance-battle | 舞蹈對決 | 空間與表演門檻 |
| pitch-perfect | 完美音準 | 音樂專業門檻高 |
| sound-sleuth | 聲音偵探 | 小眾 |
| vocal-war | 歌喉戰 | 與猜歌/對嘴重疊，保留猜歌即可 |
| gesture-guess | 手勢猜謎 | 與比手畫腳重疊 |
| poker-face | 撲克臉 | 與誰是臥底重疊 |
| sound-imitate | 聲音模仿 | 小眾、設備依賴 |

## 遊戲：新增 5 個符合六地 persona

| ID | 名稱 | 說明 | 組件複用 |
|----|------|------|----------|
| drinking-fist | 酒拳 | 亞洲常見猜拳喝酒，二人即可 | FingerGuessing |
| captain-hook | 虎克船長 | 名字接龍類，港台大陸熟悉 | NameTrain |
| count-seven | 數七 | 遇 7 倍數拍手，日韓新加坡常見 | BuzzGame |
| ultimate-code | 終極密碼 | 數字範圍猜謎，泛亞 | NumberBomb |
| support-front | 支援前線 | 隨機抽人/抽籤，派對熱門 | RandomPicker |

## 課程：刪除 5 個最低吸引力（已實作）

已從 `getCourseIds()` 與 `COURSE_META` 移除：`wset-d4-sparkling-pro`、`mw-viticulture`、`mw-vinification`、`mw-business`、`wine-law-regions`（過於冷門/專業考試向）。

## 課程：新增 2 個符合六地 persona（已實作）

- **sake-shochu-intro**：日韓清酒與燒酎入門（`data/courses/sake-shochu-intro.json`）
- **hk-sg-cocktail-etiquette**：新加坡・香港調酒與法規禮儀（`data/courses/hk-sg-cocktail-etiquette.json`）
