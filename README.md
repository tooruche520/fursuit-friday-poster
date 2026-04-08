# Fursuit Friday Poster

一款為獸裝攝影愛好者打造的社群媒體貼文生成工具。上傳照片後，透過 AI 自動產生繁體中文貼文內容，並整合標記夥伴、主題標籤管理、多平台格式複製等功能，讓每週五的獸裝貼文更輕鬆。

## 功能概覽

**貼文生成**
- 上傳獸裝照片，搭配 AI 視覺分析產生符合社群風格的貼文說明
- 支援三種 AI 提供者：Google Gemini、OpenAI、Anthropic Claude
- 可選擇預設風格範本（輕鬆、正式、興奮、感謝等）或自訂風格提示詞

> 若不需 AI 撰文，也可自行輸入貼文

**標籤與夥伴管理**
- 建立聯絡人資料庫，記錄各平台帳號與預設角色
- 在貼文中快速加入攝影師、獸裝師、夥伴等貢獻者標記
- 支援拖曳排序標籤順序

**多平台支援**
- Twitter/X、Instagram、Bluesky、Plurk、Facebook、Threads
- 即時預覽各平台格式化輸出，一鍵複製
- 可自訂額外平台

**其他**
- 深色／淺色模式切換
- 所有資料儲存於瀏覽器 localStorage，無需帳號、無後端
- 首次使用提供互動式功能導覽

## 使用前準備：取得 AI API 金鑰

本工具需要至少一組 AI 提供者的 API 金鑰才能生成貼文。請擇一申請：

| 提供者 | 申請頁面 | 金鑰格式 |
|--------|---------|---------|
| Google Gemini | https://makersuite.google.com/app/apikey | 以 `AIza` 開頭 |
| OpenAI | https://platform.openai.com/api-keys | 以 `sk-` 開頭 |
| Anthropic | https://console.anthropic.com/ | 以 `sk-ant-` 開頭 |

取得金鑰後，進入應用程式的「設定 > API 金鑰」頁面填入即可。

> **注意：** API 金鑰僅儲存於你的瀏覽器中，不會傳送至任何第三方伺服器（除了直接呼叫 AI 提供者的官方 API）。


## 使用方式

1. **設定 API 金鑰**：前往右上角「設定」，在「API 金鑰」頁面填入你的金鑰並測試連線。

2. **建立聯絡人**：在「設定 > 聯絡人」頁面，預先建立常合作的攝影師或夥伴資料，包含各平台帳號。

3. **生成貼文**：
   - 回到首頁，上傳獸裝照片
   - 選擇貼文風格（可留空使用預設）
   - 填入補充資訊（例如：戶外拍攝、特殊活動）
   - 點擊「生成」，等待 AI 產生說明文字

4. **加入標籤**：在標籤欄搜尋聯絡人，或直接輸入名稱，選擇角色後加入。

5. **複製貼文**：在右側預覽選擇目標平台，點擊複製按鈕即可貼上。

## 自訂設定

| 設定項目 | 說明 |
|---------|------|
| API 金鑰 | 新增、測試、啟用或停用各 AI 提供者的金鑰 |
| 聯絡人 | 管理夥伴資料與各平台帳號 |
| 角色 | 自訂角色類型（攝影師、獸裝師等）及其顯示名稱 |
| 風格範本 | 建立自訂 AI 提示詞範本，用於不同貼文風格 |

## 技術架構

- **框架**：Nuxt 4
- **UI**：Tailwind CSS + shadcn-nuxt
- **狀態管理**：VueUse localStorage composables（無後端）
- **AI SDK**：@google/generative-ai、openai、@anthropic-ai/sdk
- **套件管理**：Bun

## 快速開始

### 環境需求

- [Bun](https://bun.sh/) 1.x

### 安裝與啟動

```bash
# 安裝依賴
bun install

# 啟動開發伺服器（http://localhost:14514）
bun run dev
```

### 其他指令

```bash
bun run build      # 生產建置
bun run generate   # 靜態網站生成
bun run preview    # 預覽生產建置
```

## 授權

本專案原始碼以 MIT 授權釋出。