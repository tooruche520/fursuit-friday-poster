<script setup lang="ts">
import type { Contact, Platform } from '~/types'
import { toast } from 'vue-sonner'

const { contacts, upsertContact, deleteContact } = useContacts()
const { getPlatform } = usePlatforms()

const editingContact = ref<Contact | null>(null)
const deletingId = ref<string | null>(null)

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

const handleDeleteContact = (id: string) => {
  deleteContact(id)
  deletingId.value = null
  toast.success('聯絡人已刪除')
}

const startEdit = (contact: Contact) => {
  editingContact.value = JSON.parse(JSON.stringify(contact))
}

const createNew = () => {
  editingContact.value = {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    role: '📸 攝影',
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
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Icon name="lucide:book" class="w-6 h-6 text-primary" />
          通訊錄管理
        </h2>
        <p class="text-slate-500 mt-1">
          集中管理常合作的夥伴,發文時可一鍵快速帶入所有跨平台帳號。
        </p>
      </div>
      <Button class="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" @click="createNew">
        <Icon name="lucide:plus" class="w-4 h-4" />
        新增夥伴
      </Button>
    </div>

    <Card class="overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-1/4">名稱 / 預設定位</TableHead>
              <TableHead class="w-1/2">已綁定社群帳號</TableHead>
              <TableHead class="w-1/4 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="contacts.length === 0">
              <TableCell colspan="3" class="text-center py-16">
                <Icon name="lucide:users" class="w-12 h-12 mx-auto text-slate-200 mb-3" />
                <p class="text-base font-medium text-slate-700">通訊錄目前是空的</p>
                <p class="text-sm text-slate-500 mt-1">點擊上方「新增夥伴」開始建立通訊錄</p>
              </TableCell>
            </TableRow>
            
            <TableRow
              v-for="contact in contacts"
              :key="contact.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <TableCell>
                <div class="font-medium text-slate-900 text-base">{{ contact.name }}</div>
                <div class="text-xs text-slate-500 mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                  {{ contact.role }}
                </div>
              </TableCell>
              
              <TableCell>
                <div v-if="contact.platforms && contact.platforms.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="platform in contact.platforms"
                    :key="platform.id"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs shadow-sm text-slate-600"
                  >
                    <Icon :name="getPlatform(platform.type).icon" class="w-3.5 h-3.5" />
                    <span v-if="platform.type === 'custom' && platform.customName" class="font-medium mr-1">
                      {{ platform.customName }}:
                    </span>
                    <span v-if="platform.handle">{{ platform.handle }}</span>
                    <span v-else class="text-slate-400 italic">未填寫</span>
                  </span>
                </div>
                <span v-else class="text-slate-400 italic">尚未設定任何帳號</span>
              </TableCell>
              
              <TableCell class="text-right">
                <div v-if="deletingId === contact.id" class="flex justify-end items-center gap-2">
                  <span class="text-xs text-slate-500">確定刪除？</span>
                  <Button variant="ghost" size="sm" @click="deletingId = null">取消</Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    class="bg-red-500 hover:bg-red-600"
                    @click="handleDeleteContact(contact.id)"
                  >
                    確認
                  </Button>
                </div>
                <div v-else class="space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    @click="startEdit(contact)"
                  >
                    編輯
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="text-red-500 hover:text-red-600 hover:bg-red-50"
                    @click="deletingId = contact.id"
                  >
                    刪除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>

    <ContactTagEditor
      v-model="editingContact"
      :title="editingContact?.id ? '編輯夥伴資料' : '新增夥伴資料'"
      confirm-text="儲存資料"
      :show-autocomplete="false"
      @confirm="saveContact"
    />
  </div>
</template>
