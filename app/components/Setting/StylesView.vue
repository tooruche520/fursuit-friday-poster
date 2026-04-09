<script setup lang="ts">
import type { StylePreset } from '~/composables/useStyles'
import { toast } from 'vue-sonner'

const { styles, deleteStyle } = useStyles()

const editingStyle = ref<StylePreset | null>(null)
const isEditDialogOpen = ref(false)
const deleteTargetId = ref<string | null>(null)
const isDeleteDialogOpen = ref(false)

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
  editingStyle.value = style
  isEditDialogOpen.value = true
}

const createNew = () => {
  editingStyle.value = null
  isEditDialogOpen.value = true
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
    <div class="flex items-center justify-between flex-wrap gap-4 mt-4">
      <div>
        <h2 class="text-2xl font-bold text-foreground flex items-center gap-2">
          風格提示詞管理
        </h2>
        <p class="text-muted-foreground mt-1">
          管理 AI 文案生成的風格提示詞，自訂專屬的創作風格。
        </p>
      </div>
      <Button class="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" @click="createNew">
        <Icon name="lucide:plus" class="w-4 h-4" />
        新增風格
      </Button>
    </div>

    <div class="grid col-1">
      <div class="border rounded-md bg-background overflow-x-auto">
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
                <div class="text-sm text-muted-foreground truncate max-w-60 sm:max-w-md">
                  {{ style.prompt }}
                </div>
              </TableCell>

              <TableCell class="text-right pr-3">
                <Button variant="ghost" size="icon" @click="startEdit(style)">
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

    <StyleEditDialog v-model:open="isEditDialogOpen" :style="editingStyle" />

    <AlertDialog v-model:open="isDeleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認刪除</AlertDialogTitle>
          <AlertDialogDescription>
            確定要刪除這個風格嗎？此操作無法復原。
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
