import type { PlatformDefinition } from '~/types'

export function usePlatforms() {
  // 內建平台（固定）
  const builtInPlatforms: PlatformDefinition[] = [
    { id: 'twitter', name: 'X (Twitter)', icon: 'lucide:twitter' },
    { id: 'plurk', name: 'Plurk', icon: 'lucide:message-circle' },
    { id: 'facebook', name: 'Facebook', icon: 'lucide:facebook' },
    { id: 'bsky', name: 'Bluesky', icon: 'lucide:cloud' },
    { id: 'ig', name: 'Instagram', icon: 'lucide:instagram' },
    { id: 'threads', name: 'Threads', icon: 'lucide:at-sign' },
  ]

  // 自訂平台（儲存在 localStorage，動態新增）
  const customPlatforms = useLocalStorage<PlatformDefinition[]>('fursuit-friday-custom-platforms', [])

  // 當前選擇的平台（儲存在 localStorage）
  const activePlatform = useLocalStorage<string>('fursuit-friday-active-platform', 'twitter')

  // 所有平台（內建 + 自訂）
  const platforms = computed(() => [...builtInPlatforms, ...customPlatforms.value])

  // 固定的「自訂」平台定義（作為 fallback）
  const customPlatformDefault = { id: 'custom', name: '自訂', icon: 'lucide:globe' }

  const getPlatform = (id: string): PlatformDefinition => {
    return platforms.value.find(p => p.id === id) || customPlatformDefault
  }

  // 根據平台 ID 和自訂名稱取得顯示名稱
  const getPlatformName = (platformId: string, customName?: string): string => {
    if (platformId === 'custom' && customName) {
      return customName
    }
    const platform = getPlatform(platformId)
    return platform.name
  }

  // 同步自訂平台：從 customName 建立平台定義
  const syncCustomPlatform = (customName: string) => {
    if (!customName.trim()) return
    
    const platformId = `custom-${customName.toLowerCase().replace(/\s+/g, '-')}`
    const exists = customPlatforms.value.some(p => p.id === platformId)
    
    if (!exists) {
      customPlatforms.value = [
        ...customPlatforms.value,
        { id: platformId, name: customName, icon: 'lucide:globe' }
      ]
    }
  }

  // 新增自訂平台
  const addCustomPlatform = (platform: PlatformDefinition) => {
    customPlatforms.value = [...customPlatforms.value, platform]
  }

  // 更新自訂平台
  const updateCustomPlatform = (id: string, updates: Partial<PlatformDefinition>) => {
    const index = customPlatforms.value.findIndex(p => p.id === id)
    if (index >= 0) {
      customPlatforms.value[index] = { ...customPlatforms.value[index]!, ...updates }
    }
  }

  // 刪除自訂平台
  const deleteCustomPlatform = (id: string) => {
    customPlatforms.value = customPlatforms.value.filter(p => p.id !== id)
  }

  return {
    platforms,
    builtInPlatforms,
    customPlatforms,
    activePlatform,
    getPlatform,
    getPlatformName,
    syncCustomPlatform,
    addCustomPlatform,
    updateCustomPlatform,
    deleteCustomPlatform,
  }
}
