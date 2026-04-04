import type { ApiKeyConfig } from '~/types'

const DEFAULT_PROVIDERS: ApiKeyConfig[] = [
  {
    id: 'gemini',
    provider: 'gemini',
    name: 'Google Gemini',
    key: '',
    enabled: true,
    description: 'Google Gemini API 用於生成 AI 文案',
  },
  {
    id: 'openai',
    provider: 'openai',
    name: 'OpenAI GPT',
    key: '',
    enabled: false,
    description: 'OpenAI GPT-4o API 用於生成 AI 文案',
  },
  {
    id: 'anthropic',
    provider: 'anthropic',
    name: 'Anthropic Claude',
    key: '',
    enabled: false,
    description: 'Anthropic Claude API 用於生成 AI 文案',
  },
]

export function useApiKeys() {
  const apiKeys = useLocalStorage<ApiKeyConfig[]>('fursuit-friday-api-keys', DEFAULT_PROVIDERS)

  // Migration: 確保所有預設 provider 都存在
  const existingIds = apiKeys.value.map((k) => k.id)
  for (const def of DEFAULT_PROVIDERS) {
    if (!existingIds.includes(def.id)) {
      apiKeys.value = [...apiKeys.value, def]
    }
  }

  // 取得指定提供者的 API Key
  const getApiKey = (provider: ApiKeyConfig['provider']): string | null => {
    const config = apiKeys.value.find((k) => k.provider === provider && k.enabled)
    return config?.key || null
  }

  // 更新 API Key
  const updateApiKey = (provider: ApiKeyConfig['provider'], key: string) => {
    const index = apiKeys.value.findIndex((k) => k.provider === provider)
    if (index >= 0) {
      apiKeys.value[index] = { ...apiKeys.value[index]!, key }
    }
  }

  // 切換 API Key 啟用狀態
  const toggleApiKey = (provider: ApiKeyConfig['provider']) => {
    const index = apiKeys.value.findIndex((k) => k.provider === provider)
    if (index >= 0) {
      apiKeys.value[index] = {
        ...apiKeys.value[index]!,
        enabled: !apiKeys.value[index]!.enabled,
      }
    }
  }

  // 新增自訂 API Key
  const addCustomApiKey = (config: Omit<ApiKeyConfig, 'id'>) => {
    const newId = `custom-${Date.now()}`
    apiKeys.value = [...apiKeys.value, { ...config, id: newId }]
    return newId
  }

  // 刪除 API Key（僅限自訂）
  const deleteApiKey = (id: string) => {
    if (id.startsWith('custom-')) {
      apiKeys.value = apiKeys.value.filter((k) => k.id !== id)
    }
  }

  // 驗證 API Key 格式
  const validateApiKey = (provider: ApiKeyConfig['provider'], key: string): boolean => {
    if (!key.trim()) return false

    switch (provider) {
      case 'gemini':
        return key.startsWith('AIza') && key.length > 30
      case 'openai':
        return key.startsWith('sk-') && key.length > 40
      case 'anthropic':
        return key.startsWith('sk-ant-') && key.length > 40
      default:
        return key.length > 0
    }
  }

  return {
    apiKeys,
    getApiKey,
    updateApiKey,
    toggleApiKey,
    addCustomApiKey,
    deleteApiKey,
    validateApiKey,
  }
}
