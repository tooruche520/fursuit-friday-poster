<script setup lang="ts">
import type { Contact, Tag, Platform } from '~/types'
import Separator from './ui/separator/Separator.vue'

interface Props {
  modelValue: Contact | Tag | null
  title?: string
  confirmText?: string
  showAutocomplete?: boolean
  mode?: 'contact' | 'tag'
}

const props = withDefaults(defineProps<Props>(), {
  title: '編輯資料',
  confirmText: '確認',
  showAutocomplete: true,
  mode: 'tag'
})

const emit = defineEmits<{
  'update:modelValue': [value: Contact | Tag | null]
  confirm: [value: Contact | Tag]
  cancel: []
}>()

const { contacts } = useContacts()
const { roles, getRole } = useRoles()

const localData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 統一處理 Contact.defaultRoleId 與 Tag.roleId
const roleId = computed({
  get: () => {
    if (!localData.value) return ''
    return props.mode === 'contact'
      ? (localData.value as any).defaultRoleId ?? ''
      : (localData.value as any).roleId ?? ''
  },
  set: (val: string) => {
    if (!localData.value) return
    if (props.mode === 'contact') {
      (localData.value as any).defaultRoleId = val
    } else {
      (localData.value as any).roleId = val
    }
  }
})

// 本篇誓赔2者自訂輸出名稱（僅在 tag 模式 且 roleId === 'partner' 時顯示）
const partnerLabel = computed({
  get: () => (localData.value as any)?.partnerLabel ?? '',
  set: (val: string) => {
    if (!localData.value) return
    ;(localData.value as any).partnerLabel = val || undefined
  }
})

// 通訊錄預設搭檔顯示名稱（僅在 contact 模式 且 roleId === 'partner' 時顯示）
const partnerDisplay = computed({
  get: () => (localData.value as any)?.partnerDisplay ?? '',
  set: (val: string) => {
    if (!localData.value) return
    ;(localData.value as any).partnerDisplay = val || undefined
  }
})

const isPartnerRole = computed(() => roleId.value === 'partner')

const isOpen = computed({
  get: () => !!props.modelValue,
  set: (val) => {
    if (!val) {
      emit('update:modelValue', null)
      emit('cancel')
    }
  }
})

const handleConfirm = () => {
  if (localData.value) {
    emit('confirm', localData.value)
  }
}

const handleCancel = () => {
  emit('update:modelValue', null)
  emit('cancel')
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-3xl w-[95vw] max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon name="lucide:user-plus" class="w-5 h-5 text-primary" />
          {{ title }}
        </DialogTitle>
      </DialogHeader>
      
      <div v-if="localData" class="flex-1 overflow-auto space-y-4 mt-1 -m-1 p-1">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label class="mb-2 flex items-center gap-1">
              顯示名稱 (支援搜尋)
              <Icon v-if="showAutocomplete" name="lucide:sparkles" class="w-3 h-3" />
            </Label>
            <TagNameAutocomplete
              v-if="showAutocomplete"
              :name="localData.name"
              :contacts="contacts"
              @update="(fields) => localData && Object.assign(localData, fields)"
            />
            <Input
              v-else
              v-model="localData.name"
              placeholder="例如: 阿白"
            />
          </div>
          
          <div>
            <Label class="mb-2 block">{{ mode === 'contact' ? '預設定位' : '角色定位' }}</Label>
            <Select v-model="roleId">
              <SelectTrigger class="w-full">
                <div class="flex items-center gap-2"> 
                  <Icon :name="getRole(roleId)?.icon" class="w-3 h-3" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="role in roles" 
                  :key="role.id" 
                  :value="role.id"
                >
                  <Icon :name="role.icon" class="w-3 h-3" />
                  {{ role.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <div v-if="isPartnerRole" class="mt-3">
              <Label class="mb-2 block">{{ mode === 'contact' ? '預設物種icon（可選）' : '本篇物種icon（可選）' }}</Label>
              <Input
                v-if="mode === 'contact'"
                v-model="partnerDisplay"
                placeholder="留空使用角色管理的輸出名稱"
              />
              <Input
                v-else
                v-model="partnerLabel"
                placeholder="留空使用預設物種icon"
              />
              <p class="text-xs text-muted-foreground mt-1">
                {{ mode === 'contact' ? '每次選此夥伴為搭檔時，會自動帶入此物種icon' : '若填寫，將取代輸出標籤' }}
              </p>
            </div>
          </div>
          
        </div>
        <Separator />
        <div>
          <Label class="mb-2 block ">社群平台設定</Label>
          <div class="text-xs text-muted-foreground my-2 flex items-center gap-1">
            需加上@符號
          </div>
          <PlatformListEditor
            :platforms="localData.platforms"
            @update="(platforms) => localData!.platforms = platforms"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="ghost" @click="handleCancel">取消</Button>
        <Button class="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" @click="handleConfirm">
          <Icon name="lucide:check" class="w-4 h-4" />
          {{ confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
