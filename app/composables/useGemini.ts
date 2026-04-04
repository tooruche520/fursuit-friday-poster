import { GoogleGenerativeAI } from '@google/generative-ai'

export function useGemini() {
  const config = useRuntimeConfig()
  const { getApiKey } = useApiKeys()
  
  const generateCaption = async (options: {
    stylePrompt?: string
    additionalPrompt?: string
    imageBase64?: string
    imageType?: string
  }) => {
    try {
      // 優先從 API Keys 管理取得，回退到環境變數
      const apiKey = getApiKey('gemini') || (config.public.geminiApiKey as string)
      if (!apiKey) {
        throw new Error('Gemini API Key 未設定，請前往「設定 > API 金鑰」頁面設定')
      }

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

      // 建構提示詞
      let prompt = '請根據這張 fursuit 照片生成一段適合社群媒體的貼文內容。'
      
      if (options.stylePrompt) {
        prompt += `\n\n風格要求: ${options.stylePrompt}`
      }
      
      if (options.additionalPrompt) {
        prompt += `\n\n補充資訊: ${options.additionalPrompt}`
      }
      
      prompt += '\n\n請使用繁體中文，語氣輕鬆自然，約 50-100 字。只回傳貼文內容，不要有其他說明。不要有hashtag。'

      let result
      if (options.imageBase64 && options.imageType) {
        // 有圖片時使用 Vision 模式
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: options.imageBase64,
              mimeType: options.imageType
            }
          }
        ])
      } else {
        // 沒有圖片時僅用文字提示
        result = await model.generateContent(prompt)
      }

      const response = await result.response
      const text = response.text()
      
      return {
        success: true,
        text: text.trim()
      }
    } catch (error) {
      const err = error as Error
      console.error('Gemini API 錯誤:', err)
      return {
        success: false,
        error: err.message || '生成失敗，請稍後再試'
      }
    }
  }

  const testConnection = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const apiKey = getApiKey('gemini') || (config.public.geminiApiKey as string)
      if (!apiKey) throw new Error('Gemini API Key 未設定')

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })
      await model.generateContent('hi')
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  return {
    generateCaption,
    testConnection,
  }
}
