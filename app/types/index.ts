export interface Platform {
  id: string
  type: 'twitter' | 'ig' | 'bsky' | 'threads' | 'plurk' | 'facebook' | 'custom'
  handle: string
  customName?: string
}

export interface Contact {
  id: string
  name: string
  defaultRoleId: string
  partnerDisplay?: string
  platforms: Platform[]
}

export interface Tag {
  id: string
  name: string
  roleId: string
  partnerLabel?: string
  platforms: Platform[]
}

export interface PlatformDefinition {
  id: string
  name: string
  icon: string
}

export interface RoleDefinition {
  id: string
  name: string
  displayName: string
  icon: string
}

export interface ApiKeyConfig {
  id: string
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom'
  name: string
  key: string
  enabled: boolean
  description?: string
  customEndpoint?: string
}
