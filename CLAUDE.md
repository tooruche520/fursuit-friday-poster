# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install          # 安裝依賴
bun run dev          # 開發伺服器（port 14514）
bun run build        # 生產建置
bun run generate     # 靜態網站生成
bun run preview      # 預覽生產建置
```

Package manager: **bun**. Development environment: **Windows**.

## Architecture

**Nuxt 4 SPA**（SSR disabled）用於生成獸裝星期五（Fursuit Friday）社群媒體貼文說明文字。支援 Google Gemini、OpenAI、Anthropic 三種 AI 提供者。

### Data Flow

所有應用狀態儲存於 **localStorage**（透過 @vueuse/core），無後端 API：

| Key | 用途 |
|-----|------|
| `fursuit-friday-contacts` | 聯絡人/夥伴清單 |
| `fursuit-friday-api-keys` | AI 提供者 API 金鑰配置 |
| `fursuit-friday-platforms` | 平台定義（Twitter、Instagram 等） |
| `fursuit-friday-roles` | 角色定義（攝影、夥伴等） |
| `fursuit-friday-styles` | AI 生成的風格提示範本 |
| `fursuit-friday-active-ai-provider` | 目前選用的 AI 提供者 |

### AI 提供者抽象層

`useAI()` composable 統一包裝三個提供者：
- `useGemini()` — @google/generative-ai
- `useOpenAI()` — openai SDK，指向自訂端點
- `useAnthropic()` — @anthropic-ai/sdk

API 金鑰透過 `useApiKeys()` 管理，儲存於 localStorage（非環境變數）。環境變數 `NUXT_*_API_KEY` 僅作為伺服器端預設值。

### 頁面與組件結構

```
pages/
  index.vue          → Generator Page（主功能）
  setting.vue        → Settings Page（API 金鑰、聯絡人、角色、風格）

components/
  Generator/
    AIGeneratorCard  → AI 說明文字生成介面
    TagEditorCard    → 聯絡人/標籤管理
    PreviewCard      → 生成結果預覽
    HashtagsCard     → 主題標籤建議
  Setting/
    ApiKeysView      → 多 AI 提供者金鑰設定
    ContactsView     → 聯絡人 CRUD
    RolesView        → 角色定義
    StylesView       → 風格提示範本
```

### UI 規範

- **shadcn-nuxt** 組件無前綴（直接 `<Button>` 非 `<UiButton>`）
- 圖示使用 **lucide-vue-next**
- Toast 通知使用 **vue-sonner** 的 `toast.success()` / `toast.error()`
- 顏色模式：`@nuxtjs/color-mode`，無後綴 class（`dark` 非 `dark-mode`）

## Commit Message 格式

使用**繁體中文（zh_TW）**撰寫 conventional commits：

```
type(scope): 簡短描述（不超過 50 字）

- 詳細說明第一點
- 詳細說明第二點
```

Types：`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**禁止**在 commit 中加入 `Co-Authored-By` 或任何 Claude 署名 trailer。
