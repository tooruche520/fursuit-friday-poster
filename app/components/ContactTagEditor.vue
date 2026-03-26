<script setup lang="ts">
import type { Contact, Tag, Platform } from '~/types'
import Separator from './ui/separator/Separator.vue'

interface Props {
  modelValue: Contact | Tag | null
  title?: string
  confirmText?: string
  showAutocomplete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '編輯資料',
  confirmText: '確認',
  showAutocomplete: true
})

const emit = defineEmits<{
  'update:modelValue': [value: Contact | Tag | null]
  confirm: [value: Contact | Tag]
  cancel: []
}>()

const { contacts } = useContacts()
const { roles } = useRoles()

const localData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

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
    <DialogContent class="max-w-2xl w-[80vw] max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon name="lucide:user-plus" class="w-5 h-5 text-primary" />
          {{ title }}
        </DialogTitle>
      </DialogHeader>
      
      <div v-if="localData" class="flex-1 overflow-auto space-y-4 mt-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label class="mb-2 text-primary flex items-center gap-1">
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
            <Label class="mb-2 block">角色定位</Label>
            <Select v-model="localData.role" >
              <SelectTrigger class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="role in roles" 
                  :key="role.id" 
                  :value="role.name"
                >
                  {{ role.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        </div>
        <Separator />
        <div>
          <Label class="mb-2 block ">社群平台設定</Label>
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
