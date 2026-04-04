<script setup lang="ts">
import type { Contact, Platform } from '~/types'
import { toast } from 'vue-sonner'

const { contacts, upsertContact, deleteContact } = useContacts()
const { getPlatform } = usePlatforms()
const { roles, getRole } = useRoles()

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
      handle: ''
    }]
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
    <div class="flex items-center justify-between flex-wrap gap-4 mt-4">
      <div>
        <h2 class="text-2xl font-bold text-foreground flex items-center gap-2">
          通訊錄管理
        </h2>
        <p class="text-muted-foreground mt-1">
          集中管理常合作的夥伴，發文時可一鍵快速帶入所有跨平台帳號。
        </p>
      </div>
      <Button class="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" @click="createNew">
        <Icon name="lucide:plus" class="w-4 h-4" />
        新增夥伴
      </Button>
    </div>

    <div class="grid col-1">
      <div class="border rounded-md bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-1/4 pl-3 text-muted-foreground">名稱 / 預設定位</TableHead>
              <TableHead class="w-1/2 text-muted-foreground">已綁定社群帳號</TableHead>
              <TableHead class="w-1/4 pr-3 text-right text-muted-foreground">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="contacts.length === 0">
              <TableCell colspan="3" class="text-center py-16">
                <Icon name="lucide:users" class="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p class="text-base font-medium text-foreground">通訊錄目前是空的</p>
                <p class="text-sm text-muted-foreground mt-1">點擊上方「新增夥伴」開始建立通訊錄</p>
              </TableCell>
            </TableRow>
            
            <TableRow
              v-for="contact in contacts"
              :key="contact.id"
              class="hover:bg-accent/50 transition-colors"
            >
              <TableCell class="pl-3">
                <div class="flex items-center gap-2">
                  <div class="font-medium text-foreground text-base">{{ contact.name }}</div>
                  <Badge v-if="getRole(contact.defaultRoleId)" variant="secondary">
                    <Icon :name="getRole(contact.defaultRoleId)!.icon" class="w-3 h-3" />
                    {{ getRole(contact.defaultRoleId)!.name }}
                  </Badge>
  
                </div>
              </TableCell>
              
              <TableCell>
                <div v-if="contact.platforms && contact.platforms.length > 0" class="flex flex-wrap gap-2">
                  <Badge
                    v-for="platform in contact.platforms"
                    :key="platform.id"
                    variant="outline"
                    class=""
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
              
              <TableCell class="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  @click="startEdit(contact)"
                >
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

    <ContactTagEditor
      v-model="editingContact"
      :title="editingContact?.id ? '編輯夥伴資料' : '新增夥伴資料'"
      confirm-text="儲存資料"
      :show-autocomplete="false"
      mode="contact"
      @confirm="saveContact"
    />

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
  </div>
</template>
