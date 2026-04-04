<script setup lang="ts">
import type { RoleDefinition } from '~/types'
import { toast } from 'vue-sonner'

const { roles, addRole, updateRole, deleteRole } = useRoles()

const editingRole = ref<RoleDefinition | null>(null)
const originalRoleId = ref<string | null>(null) // 記錄編輯前的原始 ID
const deleteTargetId = ref<string | null>(null)
const isDeleteDialogOpen = ref(false)
const isEditorOpen = ref(false)

const saveRole = () => {
  if (!editingRole.value) return
  
  if (!editingRole.value.name.trim()) {
    toast.error('角色名稱不可為空')
    return
  }

  if (!editingRole.value.id.trim()) {
    toast.error('角色 ID 不可為空')
    return
  }

  if (!editingRole.value.icon.trim()) {
    // 自動設定標籤圖示
    editingRole.value.icon = 'lucide:tag'
  }
  
  // 檢查 ID 是否重複（編輯時排除原始 ID）
  const isDuplicate = roles.value.some(r => 
    r.id === editingRole.value!.id && r.id !== originalRoleId.value
  )
  
  if (isDuplicate) {
    toast.error('角色 ID 已存在')
    return
  }

  // 判斷是新增還是更新（根據是否有原始 ID）
  const isExisting = originalRoleId.value !== null
  
  if (isExisting) {
    // 如果 ID 改變了，需要先刪除舊的，再新增
    if (originalRoleId.value !== editingRole.value.id) {
      deleteRole(originalRoleId.value!)
      addRole(editingRole.value)
    } else {
      updateRole(editingRole.value.id, {
        name: editingRole.value.name,
        displayName: editingRole.value.displayName,
        icon: editingRole.value.icon
      })
    }
    toast.success('角色定位已更新')
  } else {
    addRole(editingRole.value)
    toast.success('角色定位已新增')
  }
  
  editingRole.value = null
  originalRoleId.value = null
  isEditorOpen.value = false
}

const confirmDelete = () => {
  if (deleteTargetId.value) {
    deleteRole(deleteTargetId.value)
    toast.success('角色定位已刪除')
  }
  isDeleteDialogOpen.value = false
  deleteTargetId.value = null
}

const openDeleteDialog = (id: string) => {
  deleteTargetId.value = id
  isDeleteDialogOpen.value = true
}

const startEdit = (role: RoleDefinition) => {
  originalRoleId.value = role.id // 記錄原始 ID
  editingRole.value = JSON.parse(JSON.stringify(role))
  isEditorOpen.value = true
}

const createNew = () => {
  originalRoleId.value = null // 新增模式，沒有原始 ID
  editingRole.value = {
    id: '',
    name: '',
    displayName: '',
    icon: 'lucide:tag'
  }
  isEditorOpen.value = true
}

// 監聽對話框關閉，清理狀態
watch(isEditorOpen, (newValue) => {
  if (!newValue) {
    originalRoleId.value = null
  }
})
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
    <div class="flex items-center justify-between flex-wrap gap-4 mt-4">
      <div>
        <h2 class="text-2xl font-bold text-foreground flex items-center gap-2">
          角色定位管理
        </h2>
        <p class="text-muted-foreground mt-1">
          自訂角色定位的顯示文字，標記者會按照角色定位分組顯示。
        </p>
      </div>
      <Button class="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" @click="createNew">
        <Icon name="lucide:plus" class="w-4 h-4" />
        新增角色
      </Button>
    </div>

    <div class="grid col-1">
      <div class="border rounded-md bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-1/5 pl-3 text-muted-foreground">角色 ID</TableHead>
              <TableHead class="w-1/4 text-muted-foreground">選單名稱</TableHead>
              <TableHead class="w-1/4 text-muted-foreground">輸出名稱</TableHead>
              <TableHead class="w-1/5 pr-3 text-right text-muted-foreground">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="roles.length === 0">
              <TableCell colspan="4" class="text-center py-16">
                <Icon name="lucide:tag" class="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p class="text-base font-medium text-foreground">尚未設定任何角色定位</p>
                <p class="text-sm text-muted-foreground mt-1">點擊上方「新增角色」開始建立</p>
              </TableCell>
            </TableRow>
            
            <TableRow
              v-for="role in roles"
              :key="role.id"
              class="hover:bg-accent/50 transition-colors"
            >
              <TableCell class="pl-3">
                <div class="flex items-center gap-2">
                  <Icon :name="role.icon" class="w-4 h-4 text-muted-foreground" />
                  <code class="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">{{ role.id }}</code>
                </div>
              </TableCell>
              
              <TableCell>
                <div class="font-medium text-foreground text-base">{{ role.name }}</div>
              </TableCell>
              
              <TableCell>
                <div class="font-medium text-foreground text-base">{{ role.displayName }}</div>
              </TableCell>
              
              <TableCell class="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  @click="startEdit(role)"
                >
                  <Icon name="lucide:pencil" class="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-destructive hover:text-destructive hover:bg-destructive/10"
                  @click="openDeleteDialog(role.id)"
                >
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- 編輯/新增對話框 -->
    <Dialog v-model:open="isEditorOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Icon name="lucide:tag" class="w-5 h-5 text-primary" />
            {{ originalRoleId ? '編輯角色定位' : '新增角色定位' }}
          </DialogTitle>
        </DialogHeader>
        
        <div v-if="editingRole" class="space-y-4 mt-4">
          <div>
            <Label class="mb-2 block">角色 ID</Label>
            <Input
              v-model="editingRole.id"
              placeholder="例如: custom-role"
              :disabled="originalRoleId !== null"
            />
            <p class="text-xs text-muted-foreground mt-1">
              用於內部識別，建議使用英文、數字或連字號{{ originalRoleId ? '（編輯時無法修改）' : '' }}
            </p>
          </div>
          
          <div>
            <Label class="mb-2 block">選單名稱</Label>
            <Input
              v-model="editingRole.name"
              placeholder="例如: 📸 攝影"
            />
            <p class="text-xs text-muted-foreground mt-1">
              會顯示在新增/編輯標記者時的角色定位下拉選單中
            </p>
          </div>
          
          <div>
            <Label class="mb-2 block">輸出名稱</Label>
            <Input
              v-model="editingRole.displayName"
              placeholder="例如: 攝影"
            />
            <p class="text-xs text-muted-foreground mt-1">
              會顯示在最終輸出的貼文內容中（如：攝影：@xxx）
            </p>
          </div>
          
          <div>
            <Label class="mb-2 block">圖示（lucide icon）</Label>
            <Input
              v-model="editingRole.icon"
              placeholder="例如: lucide:camera"
            />
            <p class="text-xs text-muted-foreground mt-1">
              預留欄位，目前僅用於顯示參考
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" @click="isEditorOpen = false">取消</Button>
          <Button class="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" @click="saveRole">
            <Icon name="lucide:check" class="w-4 h-4" />
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 刪除確認對話框 -->
    <AlertDialog v-model:open="isDeleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確定要刪除這個角色定位嗎？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作無法復原。已使用此角色定位的聯絡人或標記者不會受影響，但無法再選擇此角色。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="isDeleteDialogOpen = false">取消</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete">刪除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
