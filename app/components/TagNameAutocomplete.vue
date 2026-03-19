<script setup lang="ts">
import type { Contact, Platform } from '~/types'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  name: string
  contacts: readonly Contact[]
}>()

const emit = defineEmits<{
  update: [fields: { id?: string, name?: string, role?: string, platforms?: Platform[] }]
}>()

const isOpen = ref(false)
const search = ref(props.name || '')
const wrapperRef = ref<HTMLElement | null>(null)

watch(() => props.name, (newName) => {
  search.value = newName || ''
})

// 點擊外部關閉下拉選單
onClickOutside(wrapperRef, () => {
  isOpen.value = false
})

const filtered = computed(() => {
  return props.contacts.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

const handleInput = (value: string | number) => {
  const strValue = String(value)
  search.value = strValue
  emit('update', { name: strValue })
  isOpen.value = true
}

const selectContact = (contact: Contact) => {
  emit('update', {
    id: contact.id,  // 傳遞 id，讓 Tag.id 等於 Contact.id
    name: contact.name,
    role: contact.role,
    platforms: JSON.parse(JSON.stringify(contact.platforms))
  })
  isOpen.value = false
}
</script>

<template>
  <div ref="wrapperRef" class="relative w-full">
    <Input
      :model-value="search"
      placeholder="搜尋通訊錄或直接輸入..."
      @update:model-value="handleInput"
      @focus="isOpen = true"
    />
    
    <div
      v-if="isOpen && filtered.length > 0"
      class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto"
    >
      <div
        v-for="contact in filtered"
        :key="contact.id"
        class="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors"
        @click="selectContact(contact)"
      >
        <span class="font-medium text-slate-800">{{ contact.name }}</span>
        <span class="text-xs text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-md">
          {{ contact.role }}
        </span>
      </div>
    </div>
  </div>
</template>
