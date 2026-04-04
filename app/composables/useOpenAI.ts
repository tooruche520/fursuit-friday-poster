export function useOpenAI() {
  const { getApiKey } = useApiKeys()

  const generateCaption = async (options: {
    stylePrompt?: string
    additionalPrompt?: string
    imageBase64?: string
    imageType?: string
    model?: string
  }) => {
    try {
      const apiKey = getApiKey('openai')
      if (!apiKey) {
        throw new Error('OpenAI API Key 未設定，請前往「設定 > API 金鑰」頁面設定')
      }

      let prompt = '請根據這張 fursuit 照片生成一段適合社群媒體的貼文內容。'

      if (options.stylePrompt) {
        prompt += `\n\n風格要求: ${options.stylePrompt}`
      }

      if (options.additionalPrompt) {
        prompt += `\n\n補充資訊: ${options.additionalPrompt}`
      }

      prompt += '\n\n請使用繁體中文，語氣輕鬆自然，約 50-100 字。只回傳貼文內容，不要有其他說明。不要有hashtag。'

      type ContentPart =
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }

      const content: ContentPart[] = []

      if (options.imageBase64 && options.imageType) {
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:${options.imageType};base64,${options.imageBase64}`,
          },
        })
      }

      content.push({ type: 'text', text: prompt })

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || 'gpt-4o-mini',
          messages: [{ role: 'user', content }],
          max_tokens: 300,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${response.status}`)
      }

      const data = await response.json() as {
        choices: { message: { content: string } }[]
      }
      const text = data.choices[0]?.message?.content?.trim() ?? ''

      return { success: true, text }
    } catch (error) {
      const err = error as Error
      console.error('OpenAI API 錯誤:', err)
      return { success: false, error: err.message || '生成失敗，請稍後再試' }
    }
  }

  const testConnection = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const apiKey = getApiKey('openai')
      if (!apiKey) throw new Error('OpenAI API Key 未設定')

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${response.status}`)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  return { generateCaption, testConnection }
}
