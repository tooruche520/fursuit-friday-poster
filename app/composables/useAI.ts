import type { ApiKeyConfig } from '~/types'

export type AIProvider = ApiKeyConfig['provider']

export function useAI() {
  const { apiKeys, getApiKey } = useApiKeys()
  const gemini = useGemini()
  const openai = useOpenAI()
  const anthropic = useAnthropic()

  // 目前選用的 AI 提供者（儲存在 localStorage）
  const activeProvider = useLocalStorage<AIProvider>('fursuit-friday-active-ai-provider', 'gemini')

  // 有設定 key 且啟用的提供者列表（排除 custom）
  const availableProviders = computed(() =>
    apiKeys.value.filter(
      (k) => k.provider !== 'custom' && k.enabled && k.key.trim(),
    ),
  )

  // 確保 activeProvider 還存在，否則回退到第一個可用
  watchEffect(() => {
    const found = availableProviders.value.find((k) => k.provider === activeProvider.value)
    if (!found && availableProviders.value[0]) {
      activeProvider.value = availableProviders.value[0].provider
    }
  })

  const setActiveProvider = (provider: AIProvider) => {
    activeProvider.value = provider
  }

  const generateCaption = async (options: {
    stylePrompt?: string
    additionalPrompt?: string
    imageBase64?: string
    imageType?: string
  }) => {
    const provider = activeProvider.value

    if (!getApiKey(provider)) {
      return {
        success: false,
        error: `${provider} API Key 未設定，請前往「設定 > API 金鑰」頁面設定`,
      }
    }

    switch (provider) {
      case 'gemini':
        return gemini.generateCaption(options)
      case 'openai':
        return openai.generateCaption(options)
      case 'anthropic':
        return anthropic.generateCaption(options)
      default:
        return { success: false, error: '不支援的 AI 提供者' }
    }
  }

  return {
    activeProvider,
    availableProviders,
    setActiveProvider,
    generateCaption,
  }
}
