import type { Contact } from '~/types'

export function useContacts() {
  // 使用 VueUse 的 useLocalStorage 管理聯絡人
  const contacts = useLocalStorage<Contact[]>('fursuit-friday-contacts', [])

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
