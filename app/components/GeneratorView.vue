<script setup lang="ts">
import type { Tag, Platform, Contact } from '~/types'
import { toast } from 'vue-sonner'

const { contacts, upsertContact } = useContacts()
const { getPlatform } = usePlatforms()
const { copy } = useCopyToClipboard()

// AI 風格提示詞
const defaultStyles = ref([
  { id: 'casual', name: '輕鬆日常', prompt: '請用輕鬆活潑的語氣描述這張照片' },
  { id: 'professional', name: '專業攝影', prompt: '請用專業的攝影角度分析這張作品' },
  { id: 'excited', name: '興奮分享', prompt: '請用充滿熱情和興奮的語氣分享這個時刻' },
  { id: 'grateful', name: '感謝致意', prompt: '請著重表達對合作夥伴的感謝' }
])
const customStyles = ref<Array<{ id: string; name: string; prompt: string }>>([])
const selectedStyle = ref<string | null>(null)
const isAddingStyle = ref(false)
const newStyleName = ref('')
const newStylePrompt = ref('')

// 狀態管理
const imageUploaded = ref(false)
const isGenerating = ref(false)
const mainText = ref('')
const hashtags = ref('#FursuitFriday #Fursuit #Kemono')
const tags = ref<Tag[]>([
  {
    id: 't1',
    role: '📸 攝影',
    name: '阿白',
    platforms: [{ id: 'pt1', type: 'twitter', handle: '@shiro_tw' }]
  }
])
const activePlatform = ref('twitter')
const copied = ref(false)

// 編輯狀態
const editingTag = ref<Tag | null>(null)

// 拖曳排序
const dragItem = ref<number | null>(null)
const dragOverItem = ref<number | null>(null)

const handleDragSort = () => {
  if (dragItem.value === null || dragOverItem.value === null) return
  
  const copyTags = [...tags.value]
  const dragItemContent = copyTags[dragItem.value]
  if (!dragItemContent) return
  
  copyTags.splice(dragItem.value, 1)
  copyTags.splice(dragOverItem.value, 0, dragItemContent)
  
  tags.value = copyTags
  dragItem.value = null
  dragOverItem.value = null
}

// AI 生成
const handleGenerateAI = () => {
  isGenerating.value = true
  setTimeout(() => {
    mainText.value = '今天參加了超棒的毛毛聚會！認識了好多新朋友，大家的毛裝都超可愛的！感謝攝影師幫我們拍下這些美好的瞬間 🐾✨'
    isGenerating.value = false
    toast.success('AI 草稿生成完成！')
  }, 2000)
}

// 複製功能
const handleCopy = async () => {
  const text = generateFinalText()
  const success = await copy(text)
  
  if (success) {
    copied.value = true
    toast.success('複製成功！快去貼文吧 🎉')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } else {
    toast.error('複製失敗，請手動複製')
  }
}

// 新增自定義風格
const handleAddCustomStyle = () => {
  if (!newStyleName.value.trim() || !newStylePrompt.value.trim()) {
    toast.error('請填寫完整的風格名稱和提示詞')
    return
  }
  
  customStyles.value.push({
    id: `custom-${Date.now()}`,
    name: newStyleName.value,
    prompt: newStylePrompt.value
  })
  
  toast.success('自定義風格已新增')
  newStyleName.value = ''
  newStylePrompt.value = ''
  isAddingStyle.value = false
}

// 生成最終文字
const generateFinalText = (): string => {
  let result = mainText.value + '\n\n'
  
  // 按角色分組
  const groupedByRole = tags.value.reduce((acc, tag) => {
    if (!acc[tag.role]) acc[tag.role] = []
    acc[tag.role]!.push(tag)
    return acc
  }, {} as Record<string, Tag[]>)
  
  // 輸出每個角色分組
  Object.entries(groupedByRole).forEach(([role, tagList]) => {
    const handles = tagList
      .map(tag => {
        const platform = tag.platforms.find(p => p.type === activePlatform.value)
        // 若沒有選中平台的帳號，直接使用顯示名稱
        return platform?.handle || tag.name
      })
      .filter(Boolean)
      .join(' ')
    
    if (handles) {
      result += `${role}：${handles}\n`
    }
  })
  
  result += '\n' + hashtags.value
  
  return result
}

// 儲存標記
const saveTag = () => {
  if (!editingTag.value) return
  
  if (!editingTag.value.name.trim()) {
    toast.error('請輸入顯示名稱')
    return
  }
  
  // 檢查是否存在於通訊錄，不存在則自動加入
  const existingContact = contacts.value.find((c: Contact) => c.name === editingTag.value!.name)
  if (!existingContact) {
    upsertContact({
      id: Math.random().toString(36).substr(2, 9),
      name: editingTag.value.name,
      role: editingTag.value.role,
      platforms: JSON.parse(JSON.stringify(editingTag.value.platforms))
    })
  }
  
  // 更新或新增標記
  if (editingTag.value.id) {
    const index = tags.value.findIndex(t => t.id === editingTag.value!.id)
    if (index >= 0) {
      tags.value[index] = { ...editingTag.value }
    }
  } else {
    tags.value.push({
      ...editingTag.value,
      id: Math.random().toString(36).substr(2, 9)
    })
  }
  
  editingTag.value = null
  toast.success('標記已儲存')
}

const removeTag = (id: string) => {
  tags.value = tags.value.filter(t => t.id !== id)
  toast.success('已移除標記')
}

const startEditTag = (tag: Tag) => {
  editingTag.value = JSON.parse(JSON.stringify(tag))
}

const createNewTag = () => {
  editingTag.value = {
    id: '',
    name: '',
    role: '🐾 搭檔',
    platforms: [{
      id: Math.random().toString(36).substr(2, 9),
      type: 'twitter',
      handle: ''
    }]
  }
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto animate-in fade-in duration-300">
    <!-- 左側操作區 -->
    <div class="lg:col-span-7 space-y-6">
      <!-- 1. AI 文案生成 -->
      <Card class="p-6 shadow-sm">
        <div class="flex items-center gap-3">
          <Icon name="lucide:message-square" class="w-5 h-5 text-primary" />
          <h2 class="text-lg font-semibold">1. AI 文案生成</h2>
        </div>
        
        <div class="space-y-4">
          <div
            class="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
            :class="imageUploaded ? 'border-primary bg-primary/5' : 'border-slate-300 hover:bg-slate-50 bg-white'"
            @click="imageUploaded = true"
          >
            <Icon
              v-if="imageUploaded"
              name="lucide:check"
              class="w-10 h-10 text-primary mb-2"
            />
            <Icon
              v-else
              name="lucide:image"
              class="w-10 h-10 text-slate-400 mb-2"
            />
            <p class="text-sm font-medium" :class="imageUploaded ? 'text-primary' : 'text-slate-600'">
              {{ imageUploaded ? '圖片已上傳 (示範)' : '點擊或拖曳上傳' }}
            </p>
          </div>

          
          <!-- 風格選擇 -->
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="style in defaultStyles"
              :key="style.id"
              :variant="selectedStyle === style.id ? 'default' : 'outline'"
              class="cursor-pointer transition-colors py-1"
              :class="selectedStyle === style.id ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-slate-100'"
              @click="selectedStyle = selectedStyle === style.id ? null : style.id"
            >
              {{ style.name }}
            </Badge>
            <Badge
              v-for="style in customStyles"
              :key="style.id"
              :variant="selectedStyle === style.id ? 'default' : 'outline'"
              class="cursor-pointer transition-colors"
              :class="selectedStyle === style.id ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-slate-100'"
              @click="selectedStyle = selectedStyle === style.id ? null : style.id"
            >
              {{ style.name }}
            </Badge>
            <Badge
              variant="outline"
              class="cursor-pointer border-dashed hover:bg-slate-100 transition-colors"
              @click="isAddingStyle = true"
            >
              <Icon name="lucide:plus" class="w-3 h-3" />
              自定義
            </Badge>
          </div>
        
          
          <Button
            class="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            :disabled="isGenerating || !imageUploaded"
            @click="handleGenerateAI"
          >
            <Icon v-if="!isGenerating" name="lucide:sparkles" class="w-4 h-4" />
            <span v-if="isGenerating" class="animate-pulse">✨ AI 靈感湧現中...</span>
            <span v-else>{{ imageUploaded ? '讓 AI 幫我寫草稿！' : '請先上傳圖片以使用 AI' }}</span>
          </Button>
          
          <Textarea
            v-model="mainText"
            placeholder="草稿內容..."
            class="min-h-30 resize-y"
          />
        </div>
      </Card>

      <!-- 2. 標記者 -->
      <Card class="p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Icon name="lucide:users" class="w-5 h-5 text-primary" />
            <h2 class="text-lg font-semibold">2. 標記者</h2>
          </div>
          <Button variant="outline" size="sm" class="gap-2" @click="createNewTag">
            <Icon name="lucide:plus" class="w-4 h-4" />
            新增名單
          </Button>
        </div>

        <div class="space-y-2">
          <div
            v-if="tags.length === 0"
            class="text-center p-8 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm"
          >
            尚無綁定任何夥伴
          </div>
          
          <div
            v-for="(tag, index) in tags"
            :key="tag.id"
            draggable="true"
            class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-primary transition-colors cursor-move"
            @dragstart="dragItem = index"
            @dragenter="dragOverItem = index"
            @dragend="handleDragSort"
            @dragover.prevent
          >
            <div class="flex items-center gap-3 overflow-hidden">
              <Icon name="lucide:grip-vertical" class="w-4 h-4 text-slate-400 shrink-0" />
              <span class="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded border border-slate-200 whitespace-nowrap">
                {{ tag.role }}
              </span>
              <span class="font-medium text-slate-900 truncate">
                {{ tag.name || '未命名夥伴' }}
              </span>
              <div class="flex items-center gap-2 ml-2">
                <Icon
                  v-for="platform in tag.platforms.filter(p => p.handle)"
                  :key="platform.id"
                  :name="getPlatform(platform.type).icon"
                  class="w-3.5 h-3.5 text-slate-400"
                />
              </div>
            </div>
            <div class="flex items-center opacity-100 ">
              <Button
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                @click="startEditTag(tag)"
              >
                <Icon name="lucide:edit-2" class="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                @click="removeTag(tag.id)"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <p v-if="tags.length > 1" class="text-xs text-slate-400 text-center mt-3 pt-2">
            💡 提示:按住項目可以拖曳自訂順序,相同定位的夥伴會自動合併於同一行
          </p>
        </div>
      </Card>

      <!-- 3. 排版與 Hashtags -->
      <Card class="p-6 shadow-sm">
        <div class="flex items-center gap-3">
          <Icon name="lucide:hash" class="w-5 h-5 text-primary" />
          <h2 class="text-lg font-semibold">3. Hashtags</h2>
        </div>
        <Input v-model="hashtags" placeholder="#FursuitFriday #Kemono" />
      </Card>
    </div>

    <!-- 右側預覽區 -->
    <div class="lg:col-span-5 relative">
      <div class="sticky top-20 space-y-4">
        <Card class="overflow-hidden shadow-md pt-0 gap-0">
          <CardContent class="p-2">
            <Tabs v-model="activePlatform" class="w-full">
              <TabsList class="w-full bg-background grid grid-cols-5">
                <TabsTrigger value="twitter" class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1 text-xs">
                  <Icon name="lucide:twitter" class="w-4 h-4" />
                  <span class="hidden sm:inline">X</span>
                </TabsTrigger>
                <TabsTrigger value="ig" class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1 text-xs">
                  <Icon name="lucide:instagram" class="w-4 h-4" />
                  <span class="hidden sm:inline">IG</span>
                </TabsTrigger>
                <TabsTrigger value="bsky" class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1 text-xs">
                  <Icon name="lucide:cloud" class="w-4 h-4" />
                  <span class="hidden sm:inline">Bsky</span>
                </TabsTrigger>
                <TabsTrigger value="threads" class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1 text-xs">
                  <Icon name="lucide:at-sign" class="w-4 h-4" />
                  <span class="hidden sm:inline">Threads</span>
                </TabsTrigger>
                <TabsTrigger value="plurk" class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1 text-xs">
                  <Icon name="lucide:message-circle" class="w-4 h-4" />
                  <span class="hidden sm:inline">Plurk</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

          </CardContent>
          <div class="border-t border-slate-200 p-6 min-h-75">
            <div class="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
              <span v-if="!generateFinalText()" class="text-slate-400 italic">尚未輸入內容...</span>
              <span v-else>{{ generateFinalText() }}</span>
            </div>
          </div>
          
        </Card>

        <Button
          class="w-full h-14 text-base font-bold shadow-lg transition-all"
          :class="copied ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'"
          @click="handleCopy"
        >
          <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="w-5 h-5 mr-2" />
          {{ copied ? '複製成功！快去貼文吧' : '複製專屬格式' }}
        </Button>
      </div>
    </div>
  </div>

  <!-- 編輯標記 Dialog -->
  <ContactTagEditor
    v-model="editingTag"
    :title="editingTag?.id ? '編輯本篇貼文標記' : '新增本篇貼文標記'"
    confirm-text="確認綁定"
    @confirm="saveTag"
  />

  <!-- 新增自定義風格 Dialog -->
  <Dialog v-model:open="isAddingStyle">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>新增自定義風格</DialogTitle>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="style-name">風格名稱</Label>
          <Input
            id="style-name"
            v-model="newStyleName"
            placeholder="例如:詩意抒情"
            @keydown.enter="handleAddCustomStyle"
          />
        </div>
        <div class="space-y-2">
          <Label for="style-prompt">提示詞</Label>
          <Textarea
            id="style-prompt"
            v-model="newStylePrompt"
            placeholder="請用詩意的文字描述這張照片的氛圍..."
            class="min-h-24 resize-y"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isAddingStyle = false">
          取消
        </Button>
        <Button class="bg-primary text-primary-foreground hover:bg-primary/90" @click="handleAddCustomStyle">
          確認新增
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
