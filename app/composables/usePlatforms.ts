import type { PlatformDefinition } from '~/types'

export function usePlatforms() {
  const platforms: PlatformDefinition[] = [
    { id: 'twitter', name: 'X (Twitter)', icon: 'lucide:twitter' },
    { id: 'ig', name: 'Instagram', icon: 'lucide:instagram' },
    { id: 'bsky', name: 'Bluesky', icon: 'lucide:cloud' },
    { id: 'threads', name: 'Threads', icon: 'lucide:at-sign' },
    { id: 'plurk', name: 'Plurk', icon: 'lucide:message-circle' },
    { id: 'facebook', name: 'Facebook', icon: 'lucide:facebook' },
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
