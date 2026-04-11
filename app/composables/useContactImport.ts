import type { Contact, ContactImportPayload } from '~/types'

// 將 Contact 轉換為精簡的 payload 格式
function buildPayload(contact: Contact): ContactImportPayload {
  return {
    name: contact.name,
    defaultRoleId: contact.defaultRoleId,
    ...(contact.partnerDisplay ? { partnerDisplay: contact.partnerDisplay } : {}),
    platforms: contact.platforms.map(p => ({
      type: p.type,
      handle: p.handle,
      ...(p.customName ? { customName: p.customName } : {}),
    })),
  }
}

export function useContactImport() {
  const { contacts, upsertContact } = useContacts()

  // Unicode 安全的 base64 編碼（支援中文等多位元組字元）
  const encodePayload = (payload: ContactImportPayload[]): string => {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
  }

  // Unicode 安全的 base64 解碼
  const decodePayload = (b64: string): ContactImportPayload[] | null => {
    try {
      const json = decodeURIComponent(escape(atob(b64)))
      const data = JSON.parse(json)
      if (!Array.isArray(data) || data.length === 0) return null
      return data as ContactImportPayload[]
    } catch {
      return null
    }
  }

  // 將單筆聯絡人序列化為帶 URL 的導入連結（單筆分享用）
  const generateImportUrl = (contact: Contact): string => {
    const encoded = encodePayload([buildPayload(contact)])
    return `${location.origin}/?import=${encodeURIComponent(encoded)}`
  }

  // 將多筆聯絡人序列化為純 base64 字串（批量分享用，不帶 URL）
  const generateImportString = (contactsToExport: Contact[]): string => {
    return encodePayload(contactsToExport.map(buildPayload))
  }

  // 解碼 URL query 中的 import 參數（URLSearchParams.get 已自動 URL decode）
  const decodeImportParam = (raw: string): ContactImportPayload[] | null => {
    return decodePayload(raw)
  }

  // 判斷是否存在同名聯絡人
  const findDuplicate = (name: string): Contact | undefined => {
    return contacts.value.find(c => c.name === name)
  }

  // 執行單筆導入：overwrite 沿用既有 id，new 重新生成 id
  const importContact = (payload: ContactImportPayload, mode: 'overwrite' | 'new'): Contact => {
    const existing = mode === 'overwrite' ? findDuplicate(payload.name) : undefined

    const contact: Contact = {
      id: existing?.id ?? Math.random().toString(36).substr(2, 9),
      name: payload.name,
      defaultRoleId: payload.defaultRoleId,
      ...(payload.partnerDisplay ? { partnerDisplay: payload.partnerDisplay } : {}),
      platforms: payload.platforms.map(p => ({
        id: Math.random().toString(36).substr(2, 9),
        type: p.type,
        handle: p.handle,
        ...(p.customName ? { customName: p.customName } : {}),
      })),
    }

    upsertContact(contact)
    return contact
  }

  // 批量導入：skip-duplicates 跳過同名者，overwrite-duplicates 覆蓋同名者
  const importContacts = (
    payloads: ContactImportPayload[],
    mode: 'overwrite-duplicates' | 'skip-duplicates',
  ): number => {
    let count = 0
    for (const payload of payloads) {
      const hasDuplicate = !!findDuplicate(payload.name)
      if (hasDuplicate && mode === 'skip-duplicates') continue
      importContact(payload, hasDuplicate ? 'overwrite' : 'new')
      count++
    }
    return count
  }

  return {
    generateImportUrl,
    generateImportString,
    decodeImportParam,
    findDuplicate,
    importContact,
    importContacts,
  }
}
