export interface Platform {
  id: string
  type: 'twitter' | 'ig' | 'bsky' | 'threads' | 'plurk' | 'facebook' | 'custom'
  handle: string
  customName?: string
}

export interface Contact {
  id: string
  name: string
  role: string
  platforms: Platform[]
}

export interface Tag {
  id: string
  name: string
  role: string
  platforms: Platform[]
}

export interface PlatformDefinition {
  id: string
  name: string
  icon: string
}
