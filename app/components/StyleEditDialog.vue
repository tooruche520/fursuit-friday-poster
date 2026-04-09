<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { StylePreset } from '~/composables/useStyles'

const props = defineProps<{
  style?: StylePreset | null
}>()

const emit = defineEmits<{
  saved: [style: StylePreset]
}>()

const open = defineModel<boolean>('open', { default: false })

const { styles, upsertStyle } = useStyles()

const isNew = computed(() => !props.style || !styles.value.find(s => s.id === props.style!.id))

const draft = ref<StylePreset>({ id: '', name: '', prompt: '' })

watch(open, (val) => {
  if (!val) return
  draft.value = props.style
    ? JSON.parse(JSON.stringify(props.style))
    : { id: `custom-${Date.now()}`, name: '', prompt: '' }
})

const save = () => {
  if (!draft.value.name.trim()) {
    toast.error('風格名稱不可為空')
    return
  }
  if (!draft.value.prompt.trim()) {
    toast.error('提示詞不可為空')
    return
  }
  try {
    upsertStyle(draft.value)
    emit('saved', draft.value)
    open.value = false
    toast.success('風格已儲存')
  } catch (error) {
    toast.error((error as Error).message)
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-3xl w-[90vw]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon name="lucide:palette" class="w-5 h-5 text-primary" />
          {{ isNew ? '新增風格' : '編輯風格' }}
        </DialogTitle>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="style-edit-name">風格名稱</Label>
          <Input
            id="style-edit-name"
            v-model="draft.name"
            placeholder="例如：詩意抒情"
          />
        </div>
        <div class="space-y-2">
          <Label for="style-edit-prompt">提示詞內容</Label>
          <Textarea
            id="style-edit-prompt"
            v-model="draft.prompt"
            placeholder="請用詩意的文字描述這張照片的氛圍..."
            class="min-h-24 max-h-52 resize-y"
          />
          <p class="text-xs text-muted-foreground">
            💡 提示詞會傳送給 AI 模型，影響生成文案的風格與內容
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="open = false">取消</Button>
        <Button class="bg-primary text-primary-foreground hover:bg-primary/90" @click="save">
          確認儲存
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
