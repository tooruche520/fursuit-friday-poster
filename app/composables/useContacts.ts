import type { Contact } from '~/types'
import defaultContactsData from '~/data/defaultContacts.json'

const defaultContacts = defaultContactsData as Contact[]

type ContactStorageRecord = Omit<Contact, 'defaultRoleId'> & {
  defaultRoleId?: string
  role?: string
  partnerDisplay?: string
}

export function useContacts() {
  const contacts = useLocalStorage<Contact[]>('fursuit-friday-contacts', defaultContacts)
  const { roles } = useRoles()

  // 一次性 migration：舊版 role（顯示名稱字串）→ 新版 defaultRoleId（角色 ID）
  ;(function migrateLegacyData() {
    const current = contacts.value as unknown as ContactStorageRecord[]

    const hasLegacyRole = current.some(c => Boolean(c.role) && !c.defaultRoleId)
    const missingPartnerDisplay = current.some(
      c => c.defaultRoleId === 'partner' && !c.partnerDisplay,
    )

    if (!hasLegacyRole && !missingPartnerDisplay) return

    const partnerRole = roles.value.find(r => r.id === 'partner')
    const defaultPartnerDisplay = partnerRole?.displayName || partnerRole?.name || '🐾 搭檔'

    contacts.value = current.map((c): Contact => {
      if (c.defaultRoleId) {
        return {
          ...(c as Contact),
          partnerDisplay:
            c.defaultRoleId === 'partner'
              ? c.partnerDisplay || defaultPartnerDisplay
              : c.partnerDisplay,
        }
      }

      const { role, ...rest } = c
      const matchingRole = roles.value.find(r => r.name === role)
      const defaultRoleId = matchingRole?.id ?? roles.value[0]?.id ?? 'photography'

      return {
        ...rest,
        defaultRoleId,
        partnerDisplay: defaultRoleId === 'partner' ? (c.partnerDisplay || defaultPartnerDisplay) : c.partnerDisplay,
      }
    })
  })()

  // 新增或更新聯絡人
  const upsertContact = (contact: Contact) => {
    const { syncCustomPlatform } = usePlatforms()
    
    // 同步所有自訂平台到平台列表
    contact.platforms.forEach(platform => {
      if (platform.type === 'custom' && platform.customName) {
        syncCustomPlatform(platform.customName)
      }
    })
    
    const index = contacts.value.findIndex(c => c.id === contact.id)
    if (index >= 0) {
      contacts.value[index] = contact
    } else {
      contacts.value.push(contact)
    }
  }

  // 刪除聯絡人
  const deleteContact = (id: string) => {
    contacts.value = contacts.value.filter(c => c.id !== id)
  }

  // 尋找聯絡人
  const findContact = (name: string): Contact | undefined => {
    return contacts.value.find(c => c.name === name)
  }

  return {
    contacts,
    upsertContact,
    deleteContact,
    findContact
  }
}
