import type { PlatformDefinition } from '~/types'

export function usePlatforms() {
  const platforms: PlatformDefinition[] = [
    { id: 'twitter', name: 'X (Twitter)', icon: 'lucide:twitter' },
    { id: 'plurk', name: 'Plurk', icon: 'lucide:message-circle' },
    { id: 'facebook', name: 'Facebook', icon: 'lucide:facebook' },
    { id: 'bsky', name: 'Bluesky', icon: 'lucide:cloud' },
    { id: 'ig', name: 'Instagram', icon: 'lucide:instagram' },
    { id: 'threads', name: 'Threads', icon: 'lucide:at-sign' },
    { id: 'custom', name: '自訂', icon: 'lucide:globe' },
  ]

  const getPlatform = (id: string): PlatformDefinition => {
    return platforms.find(p => p.id === id) || platforms.find(p => p.id === 'custom')!
  }

  return {
    platforms,
    getPlatform
  }
}
