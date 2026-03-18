export function useCopyToClipboard() {
  const copy = async (text: string): Promise<boolean> => {
    try {
      // 優先使用 Clipboard API
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }
      
      // 備用方案：使用 execCommand
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return success
    } catch (error) {
      console.error('Failed to copy:', error)
      return false
    }
  }

  return {
    copy
  }
}
