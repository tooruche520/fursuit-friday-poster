<script setup lang="ts">
import type { Contact } from '~/types'
import { toast } from 'vue-sonner'

const props = defineProps<{
  contacts: Contact[] | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { generateImportString } = useContactImport()
const { copy } = useCopyToClipboard()

const open = ref(false)

watch(
  () => props.contacts,
  (val) => { open.value = val !== null && val.length > 0 },
  { immediate: true },
)

const handleOpenChange = (val: boolean) => {
  if (!val) emit('close')
}

const encodedString = computed(() => {
  if (!props.contacts || props.contacts.length === 0) return ''
  return generateImportString(props.contacts)
})

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const handleCopy = async () => {
  const success = await copy(encodedString.value)
  if (success) {
    toast.success('已複製到剪貼簿')
  } else {
    toast.error('複製失敗，請手動選取後複製')
  }
}

const selectAll = () => {
  textareaRef.value?.select()
}
</script>

<template>
  <AlertDialog v-model:open="open" @update:open="handleOpenChange">
    <AlertDialogContent class="max-w-lg">
      <AlertDialogHeader>
        <AlertDialogTitle>複製導入字串</AlertDialogTitle>
        <AlertDialogDescription>
          複製以下字串，在通訊錄管理頁面點擊「從字串導入」貼上即可。
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div class="space-y-3">
        <!-- 字串展示區 -->
        <div class="grid">
          <Textarea
            ref="textareaRef"
            v-model="encodedString"
            readonly
            class="text-xs text-wrap font-mono text-muted-foreground max-h-30"
            @click="selectAll"
          />
        </div>

        <!-- 資訊列 -->
        <div class="flex items-center justify-between text-sm text-muted-foreground">
          <span class="flex items-center gap-1.5">
            <Icon name="lucide:users" class="w-3.5 h-3.5" />
            共 {{ contacts?.length ?? 0 }} 筆聯絡人
          </span>
          <span class="flex items-center gap-1.5">
            <Icon name="lucide:file-text" class="w-3.5 h-3.5" />
            {{ encodedString.length }} 字元
          </span>
        </div>
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel>關閉</AlertDialogCancel>
        <AlertDialogAction @click="handleCopy">
          <Icon name="lucide:copy" class="w-4 h-4 mr-1.5" />
          複製字串
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
