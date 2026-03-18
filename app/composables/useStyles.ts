export interface StylePreset {
  id: string
  name: string
  prompt: string
}

export function useStyles() {
  // 使用 VueUse 的 useLocalStorage 管理風格，預設風格作為初始值
  const styles = useLocalStorage<StylePreset[]>('fursuit-friday-styles', [
    { id: 'casual', name: '輕鬆日常', prompt: '請用輕鬆活潑的語氣描述這張照片' },
    { id: 'professional', name: '專業攝影', prompt: '請用專業的攝影角度分析這張作品' },
    { id: 'excited', name: '興奮分享', prompt: '請用充滿熱情和興奮的語氣分享這個時刻' },
    { id: 'grateful', name: '感謝致意', prompt: '請著重表達對合作夥伴的感謝' }
  ])

  // 新增或更新風格
  const upsertStyle = (style: StylePreset) => {
    const index = styles.value.findIndex(s => s.id === style.id)
    if (index >= 0) {
      styles.value[index] = style
    } else {
      styles.value.push(style)
    }
  }

  // 刪除風格
  const deleteStyle = (id: string) => {
    styles.value = styles.value.filter(s => s.id !== id)
  }

  return {
    styles,
    upsertStyle,
    deleteStyle
  }
}
