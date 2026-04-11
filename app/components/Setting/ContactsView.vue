<script setup lang="ts">
import type { Contact, Platform } from '~/types'
import { toast } from 'vue-sonner'

const { contacts, upsertContact, deleteContact } = useContacts()
const { getPlatform } = usePlatforms()
const { roles, getRole } = useRoles()
const { generateImportUrl } = useContactImport()
const { copy } = useCopyToClipboard()

// ── 編輯 / 刪除 ──────────────────────────────────────────
const editingContact = ref<Contact | null>(null)
const deleteTargetId = ref<string | null>(null)
const isDeleteDialogOpen = ref(false)

const saveContact = () => {
  if (!editingContact.value) return
  if (!editingContact.value.name.trim()) {
    toast.error('顯示名稱不可為空')
    return
  }
  upsertContact(editingContact.value)
  editingContact.value = null
  toast.success('聯絡人已儲存')
}

const confirmDelete = () => {
  if (deleteTargetId.value) {
    deleteContact(deleteTargetId.value)
    toast.success('聯絡人已刪除')
  }
  isDeleteDialogOpen.value = false
  deleteTargetId.value = null
}

const openDeleteDialog = (id: string) => {
  deleteTargetId.value = id
  isDeleteDialogOpen.value = true
}

const startEdit = (contact: Contact) => {
  editingContact.value = JSON.parse(JSON.stringify(contact))
}

const createNew = () => {
  editingContact.value = {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    defaultRoleId: roles.value[0]?.id || 'photography',
    platforms: [{
      id: Math.random().toString(36).substr(2, 9),
      type: 'twitter',
      handle: '',
    }],
  }
}

// ── 單筆複製導入連結 ──────────────────────────────────────
const copyImportLink = async (contact: Contact) => {
  const success = await copy(generateImportUrl(contact))
  if (success) toast.success('導入連結已複製到剪貼簿')
  else toast.error('複製失敗，請重試')
}

// ── 多選模式 ─────────────────────────────────────────────
const isSelecting = ref(false)
const selectedIds = ref<string[]>([])

const isSelected = (id: string) => selectedIds.value.includes(id)

const toggleSelect = (id: string) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const isAllSelected = computed(
  () => contacts.value.length > 0 && selectedIds.value.length === contacts.value.length,
)
const isIndeterminate = computed(
  () => selectedIds.value.length > 0 && selectedIds.value.length < contacts.value.length,
)

// reka-ui Checkbox 支援 'indeterminate' 作為三態值
const selectAllChecked = computed<boolean | 'indeterminate'>(() => {
  if (isAllSelected.value) return true
  if (isIndeterminate.value) return 'indeterminate'
  return false
})

const toggleSelectAll = () => {
  if (isAllSelected.value) selectedIds.value = []
  else selectedIds.value = contacts.value.map(c => c.id)
}

const startSelecting = () => {
  isSelecting.value = true
  selectedIds.value = []
}

const cancelSelection = () => {
  isSelecting.value = false
  selectedIds.value = []
}

// ── 批量匯出字串 ──────────────────────────────────────────
const exportingContacts = ref<Contact[] | null>(null)

const openExportDialog = () => {
  const selected = contacts.value.filter(c => selectedIds.value.includes(c.id))
  exportingContacts.value = selected
}

const handleExportClose = () => {
  exportingContacts.value = null
  cancelSelection()
}

// ── 從字串導入 ────────────────────────────────────────────
const isImportFromStringOpen = ref(false)
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
    <!-- 標題列 -->
    <div class="flex items-center justify-between flex-wrap gap-4 mt-4">
      <div>
        <h2 class="text-2xl font-bold text-foreground flex items-center gap-2">
          通訊錄管理
        </h2>
        <p class="text-muted-foreground mt-1">
          集中管理常合作的夥伴，發文時可一鍵快速帶入所有跨平台帳號。
        </p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <!-- 從字串導入（常駐） -->
        <Button variant="outline" class="gap-2" @click="isImportFromStringOpen = true">
          <Icon name="lucide:clipboard-paste" class="w-4 h-4" />
          從字串導入
        </Button>

        <!-- 選取模式中：取消 -->
        <template v-if="isSelecting">
          <Button variant="outline" class="gap-2" @click="cancelSelection">
            <Icon name="lucide:x" class="w-4 h-4" />
            取消選取
          </Button>
        </template>

        <!-- 一般模式：批量複製 + 新增 -->
        <template v-else>
          <Button
            variant="outline"
            class="gap-2"
            :disabled="contacts.length === 0"
            @click="startSelecting"
          >
            <Icon name="lucide:copy" class="w-4 h-4" />
            批量複製
          </Button>
          <Button class="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" @click="createNew">
            <Icon name="lucide:plus" class="w-4 h-4" />
            新增夥伴
          </Button>
        </template>
      </div>
    </div>

    <!-- 通訊錄表格 -->
    <div class="grid col-1">
      <div class="border rounded-md bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <!-- 全選 checkbox（選取模式） -->
              <TableHead v-if="isSelecting" class="w-5 pl-3">
                <Checkbox
                  :modelValue="selectAllChecked"
                  @update:modelValue="toggleSelectAll"
                  class="cursor-pointer"
                />
              </TableHead>
              <TableHead class=" pl-3 text-muted-foreground">名稱 / 預設定位</TableHead>
              <TableHead class=" text-muted-foreground">已綁定社群帳號</TableHead>
              <TableHead v-if="!isSelecting" class=" pr-3 text-right text-muted-foreground">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <!-- 空狀態 -->
            <TableRow v-if="contacts.length === 0">
              <TableCell :colspan="isSelecting ? 3 : 3" class="text-center py-16">
                <Icon name="lucide:users" class="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p class="text-base font-medium text-foreground">通訊錄目前是空的</p>
                <p class="text-sm text-muted-foreground mt-1">點擊上方「新增夥伴」開始建立通訊錄</p>
              </TableCell>
            </TableRow>

            <!-- 聯絡人列 -->
            <TableRow
              v-for="contact in contacts"
              :key="contact.id"
              class="transition-colors"
              :class="[
                isSelecting ? 'cursor-pointer select-none h-13' : 'hover:bg-accent/50',
                isSelected(contact.id) ? 'bg-accent/40 hover:bg-accent/50' : '',
              ]"
              @click="isSelecting ? toggleSelect(contact.id) : undefined"
            >
              <!-- 勾選框（選取模式） -->
              <TableCell v-if="isSelecting" class="pl-3">
                <Checkbox
                  :modelValue="isSelected(contact.id)"
                  @update:modelValue="() => toggleSelect(contact.id)"
                  @click.stop
                  class="cursor-pointer"
                />
              </TableCell>

              <!-- 名稱 / 定位 -->
              <TableCell class="pl-3">
                <div class="flex items-center flex-wrap gap-2">
                  <div class="font-medium text-foreground text-base">{{ contact.name }}</div>
                  <Badge v-if="getRole(contact.defaultRoleId)" variant="secondary">
                    <Icon :name="getRole(contact.defaultRoleId)!.icon" class="w-3 h-3" />
                    {{ getRole(contact.defaultRoleId)!.name }}
                  </Badge>
                </div>
              </TableCell>

              <!-- 平台帳號 -->
              <TableCell>
                <div v-if="contact.platforms && contact.platforms.length > 0" class="flex flex-wrap gap-2">
                  <Badge
                    v-for="platform in contact.platforms"
                    :key="platform.id"
                    variant="outline"
                  >
                    <Icon :name="getPlatform(platform.type).icon" class="w-3.5 h-3.5" />
                    <span v-if="platform.type === 'custom' && platform.customName" class="font-medium mr-1">
                      {{ platform.customName }}:
                    </span>
                    <span v-if="platform.handle">{{ platform.handle }}</span>
                    <span v-else class="text-muted-foreground italic">未填寫</span>
                  </Badge>
                </div>
                <span v-else class="text-muted-foreground italic">尚未設定任何帳號</span>
              </TableCell>

              <!-- 操作按鈕（一般模式） -->
              <TableCell v-if="!isSelecting" class="text-right">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button variant="ghost" size="icon" @click="copyImportLink(contact)">
                      <Icon name="lucide:link" class="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>複製導入連結</TooltipContent>
                </Tooltip>
                <Button variant="ghost" size="icon" @click="startEdit(contact)">
                  <Icon name="lucide:pencil" class="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-destructive hover:text-destructive hover:bg-destructive/10"
                  @click="openDeleteDialog(contact.id)"
                >
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- 多選底部操作列 -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="isSelecting"
        class="sticky bottom-4 border rounded-lg bg-background/95 backdrop-blur-sm shadow-md px-4 py-3 flex items-center justify-between gap-4"
      >
        <span class="text-sm text-muted-foreground">
          已選取 <span class="font-semibold text-foreground">{{ selectedIds.length }}</span> / {{ contacts.length }} 筆
        </span>
        <Button
          :disabled="selectedIds.length === 0"
          class="gap-2"
          @click="openExportDialog"
        >
          <Icon name="lucide:copy" class="w-4 h-4" />
          複製字串
        </Button>
      </div>
    </Transition>

    <!-- 編輯 dialog -->
    <ContactTagEditor
      v-model="editingContact"
      :title="editingContact?.id ? '編輯夥伴資料' : '新增夥伴資料'"
      confirm-text="儲存資料"
      :show-autocomplete="false"
      mode="contact"
      @confirm="saveContact"
    />

    <!-- 刪除確認 -->
    <AlertDialog v-model:open="isDeleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認刪除</AlertDialogTitle>
          <AlertDialogDescription>
            確定要刪除這位夥伴嗎？此操作無法復原。
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

    <!-- 批量匯出字串 dialog -->
    <ContactExportStringDialog
      :contacts="exportingContacts"
      @close="handleExportClose"
    />

    <!-- 從字串導入 dialog -->
    <ContactImportFromStringDialog v-model:open="isImportFromStringOpen" />
  </div>
</template>
