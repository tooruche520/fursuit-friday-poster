import type { Contact } from '~/types'

const STORAGE_KEY = 'fursuit-friday-contacts'

export function useContacts() {
  const contacts = useState<Contact[]>('contacts', () => [])

  // 從 localStorage 載入資料
  const loadContacts = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // 資料遷移：將舊版結構轉換為新版
          const migrated = parsed.map((c: Record<string, unknown>) => {
            if (!Array.isArray(c.platforms)) {
              const platforms = []
              if (c.twitter) platforms.push({ id: Math.random().toString(36).substr(2, 9), type: 'twitter', handle: c.twitter })
              if (c.ig) platforms.push({ id: Math.random().toString(36).substr(2, 9), type: 'ig', handle: c.ig })
              if (c.bsky) platforms.push({ id: Math.random().toString(36).substr(2, 9), type: 'bsky', handle: c.bsky })
              return { ...c, platforms }
            }
            return c
          })
          contacts.value = migrated
        } catch (e) {
          console.error('Failed to load contacts:', e)
        }
      }
    }
  }

  // 儲存至 localStorage
  const saveContacts = () => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts.value))
    }
  }

  // 新增或更新聯絡人
  const upsertContact = (contact: Contact) => {
    const index = contacts.value.findIndex(c => c.id === contact.id)
    if (index >= 0) {
      contacts.value[index] = contact
    } else {
      contacts.value.push(contact)
    }
    saveContacts()
  }

  // 刪除聯絡人
  const deleteContact = (id: string) => {
    contacts.value = contacts.value.filter(c => c.id !== id)
    saveContacts()
  }

  // 尋找聯絡人
  const findContact = (name: string): Contact | undefined => {
    return contacts.value.find(c => c.name === name)
  }

  // 初始化時載入
  onMounted(() => {
    loadContacts()
  })

  return {
    contacts,
    upsertContact,
    deleteContact,
    findContact,
    loadContacts
  }
}
