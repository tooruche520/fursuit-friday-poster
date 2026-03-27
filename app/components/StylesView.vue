<script setup lang="ts">
import type { StylePreset } from '~/composables/useStyles'
import { toast } from 'vue-sonner'

const { styles, upsertStyle, deleteStyle } = useStyles()

const editingStyle = ref<StylePreset | null>(null)
const deleteTargetId = ref<string | null>(null)
const isDeleteDialogOpen = ref(false)

const isEditingOpen = computed({
  get: () => editingStyle.value !== null,
  set: (value) => {
    if (!value) editingStyle.value = null
  }
})

const saveStyle = () => {
  if (!editingStyle.value) return
  
  if (!editingStyle.value.name.trim()) {
    toast.error('風格名稱不可為空')
    return
  }
  
  if (!editingStyle.value.prompt.trim()) {
    toast.error('提示詞不可為空')
    return
  }
  
  try {
    upsertStyle(editingStyle.value)
    editingStyle.value = null
    toast.success('風格已儲存')
  } catch (error) {
    const err = error as Error
    toast.error(err.message)
  }
}

const confirmDelete = () => {
  if (deleteTargetId.value) {
    try {
      deleteStyle(deleteTargetId.value)
      toast.success('風格已刪除')
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
    }
  }
  isDeleteDialogOpen.value = false
  deleteTargetId.value = null
}

const openDeleteDialog = (id: string) => {
  deleteTargetId.value = id
  isDeleteDialogOpen.value = true
}

const startEdit = (style: StylePreset) => {
  editingStyle.value = JSON.parse(JSON.stringify(style))
}

const createNew = () => {
  editingStyle.value = {
    id: `custom-${Date.now()}`,
    name: '',
    prompt: '',
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-foreground flex items-center gap-2">
          <Icon name="lucide:palette" class="w-6 h-6 text-primary" />
          風格提示詞管理
        </h2>
        <p class="text-muted-foreground mt-1">
          管理 AI 文案生成的風格提示詞,自訂專屬的創作風格。
        </p>
      </div>
      <Button class="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" @click="createNew">
        <Icon name="lucide:plus" class="w-4 h-4" />
        新增風格
      </Button>
    </div>

    <div class="border rounded-md bg-background">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-1/4 pl-3 text-muted-foreground">風格名稱</TableHead>
              <TableHead class="w-1/2 text-muted-foreground">提示詞內容</TableHead>
              <TableHead class="w-1/4 pr-3 text-right text-muted-foreground">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="styles.length === 0">
              <TableCell colspan="3" class="text-center py-16">
                <Icon name="lucide:palette" class="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p class="text-base font-medium text-foreground">尚未建立任何風格</p>
                <p class="text-sm text-muted-foreground mt-1">點擊上方「新增風格」開始建立</p>
              </TableCell>
            </TableRow>
            
            <TableRow
              v-for="style in styles"
              :key="style.id"
              class="hover:bg-accent/50 transition-colors"
            >
              <TableCell class="pl-3">
                <div class="flex items-center gap-2">
                  <div class="font-medium text-foreground text-base">{{ style.name }}</div>
                </div>
              </TableCell>
              
              <TableCell>
                <div class="text-sm text-muted-foreground truncate max-w-md">
                  {{ style.prompt }}
                </div>
              </TableCell>
              
              <TableCell class="text-right pr-3">
                <Button
                  variant="ghost"
                  size="icon"
                  @click="startEdit(style)"
                >
                  <Icon name="lucide:pencil" class="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-destructive hover:text-destructive hover:bg-destructive/10"
                  @click="openDeleteDialog(style.id)"
                >
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- 編輯風格 Dialog -->
    <Dialog v-model:open="isEditingOpen">
      <DialogContent class="sm:max-w-3xl w-[90vw] ">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Icon name="lucide:palette" class="w-5 h-5 text-primary" />
            {{ (editingStyle && editingStyle.id.startsWith('custom-') && !styles.find(s => s.id === editingStyle?.id)) ? '新增風格' : '編輯風格' }}
          </DialogTitle>
        </DialogHeader>
        
        <div v-if="editingStyle" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="style-name">風格名稱</Label>
            <Input
              id="style-name"
              v-model="editingStyle.name"
              placeholder="例如:詩意抒情"
            />
          </div>
          <div class="space-y-2">
            <Label for="style-prompt">提示詞內容</Label>
            <Textarea
              id="style-prompt"
              v-model="editingStyle.prompt"
              placeholder="請用詩意的文字描述這張照片的氛圍..."
              class="min-h-24 max-h-52 resize-y"
            />
            <p class="text-xs text-muted-foreground">
              💡 提示詞會傳送給 AI 模型,影響生成文案的風格與內容
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="editingStyle = null">
            取消
          </Button>
          <Button class="bg-primary text-primary-foreground hover:bg-primary/90" @click="saveStyle">
            確認儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="isDeleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認刪除</AlertDialogTitle>
          <AlertDialogDescription>
            確定要刪除這個風格嗎?此操作無法復原。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive hover:bg-destructive/90"
            @click="confirmDelete"
          >
            確認刪除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
