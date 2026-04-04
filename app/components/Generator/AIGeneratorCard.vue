<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { AIProvider } from '~/composables/useAI'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { generateCaption, activeProvider, availableProviders, setActiveProvider } = useAI()
const { styles } = useStyles()

const mainText = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

const selectedStyle = ref<string | null>(null)
const additionalPrompt = ref('')
const showAdditionalPrompt = ref(false)
const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const imageUploaded = ref(false)
const isGenerating = ref(false)

const providerLabels: Record<AIProvider, string> = {
  gemini: 'Gemini',
  openai: 'OpenAI',
  anthropic: 'Claude',
  custom: 'Custom',
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('請上傳圖片檔案')
    return
  }

  imageFile.value = file
  imageUploaded.value = true

  const reader = new FileReader()
  reader.onload = (loadEvent) => {
    imagePreview.value = loadEvent.target?.result as string
  }
  reader.readAsDataURL(file)

  toast.success('圖片已上傳')
}

const getSelectedStylePrompt = (): string | undefined => {
  if (!selectedStyle.value) return undefined
  const style = styles.value.find((item) => item.id === selectedStyle.value)
  return style?.prompt
}

const handleGenerateAI = async () => {
  if (!imageFile.value) {
    toast.error('請先上傳圖片')
    return
  }

  if (availableProviders.value.length === 0) {
    toast.error('請先前往「設定 > API 金鑰」設定並啟用至少一個 AI 服務')
    return
  }

  isGenerating.value = true

  try {
    const reader = new FileReader()
    const imageBase64 = await new Promise<string>((resolve) => {
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string
        resolve(result.split(',')[1] || '')
      }
      reader.readAsDataURL(imageFile.value!)
    })

    const result = await generateCaption({
      stylePrompt: getSelectedStylePrompt(),
      additionalPrompt: additionalPrompt.value.trim() || undefined,
      imageBase64,
      imageType: imageFile.value.type,
    })

    if (result.success && result.text) {
      mainText.value = result.text
      toast.success('AI 草稿生成完成！')
      return
    }

    toast.error(result.error || '生成失敗，請稍後再試')
  } catch (error) {
    console.error('AI 生成錯誤:', error)
    toast.error('生成失敗，請檢查網路連線')
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <Card id="tour-ai-card" class="p-6 shadow-none rounded-md">
    <div class="flex items-center gap-3">
      <Icon name="lucide:message-square" class="w-5 h-5 text-primary" />
      <h2 class="text-lg font-semibold">1. AI 文案生成</h2>
    </div>

    <div class="space-y-4">
      <div class="relative">
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageUpload"
        />
        <label
          id="tour-image-upload"
          for="image-upload"
          class="block border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors overflow-hidden border-primary/30 bg-input/30 hover:bg-input/40"
        >
          <div
            v-if="imagePreview"
            class="flex flex-col items-center justify-center"
          >
            <img
              :src="imagePreview"
              alt="預覽"
              class="max-h-48 rounded-lg mb-3 object-contain"
            />
            <p class="text-sm font-medium text-primary">點擊更換圖片</p>
          </div>
          <div v-else class="flex flex-col items-center justify-center">
            <Icon
              v-if="imageUploaded"
              name="lucide:check"
              class="w-10 h-10 text-primary mb-2"
            />
            <Icon
              v-else
              name="lucide:image"
              class="w-10 h-10 text-muted-foreground mb-2"
            />
            <p
              class="text-sm font-medium"
              :class="imageUploaded ? 'text-primary' : 'text-muted-foreground'"
            >
              {{ imageUploaded ? '圖片已上傳' : '點擊或拖曳上傳圖片' }}
            </p>
          </div>
        </label>
      </div>

      <div id="tour-style-badges" class="flex flex-wrap gap-2">
        <Badge
          v-for="style in styles"
          :key="style.id"
          :variant="selectedStyle === style.id ? 'default' : 'outline'"
          class="cursor-pointer transition-colors py-1"
          :class="
            selectedStyle === style.id
              ? 'bg-primary text-primary-foreground hover:bg-primary'
              : 'hover:bg-primary/10'
          "
          @click="selectedStyle = selectedStyle === style.id ? null : style.id"
        >
          {{ style.name }}
        </Badge>
        <Badge
          variant="outline"
          class="cursor-pointer border-dashed hover:bg-primary/10 transition-colors"
          @click="
            toast('請前往「風格管理」頁面新增自定義風格', {
              description: '點擊上方頁籤切換到風格管理',
            })
          "
        >
          <Icon name="lucide:plus" class="w-3 h-3" />
          自定義
        </Badge>
      </div>

      <div class="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          class="w-full justify-start gap-2 text-foreground h-8"
          @click="showAdditionalPrompt = !showAdditionalPrompt"
        >
          <Icon
            :name="showAdditionalPrompt ? 'lucide:chevron-down' : 'lucide:chevron-right'"
            class="w-4 h-4"
          />
          <Icon name="lucide:message-square-plus" class="w-4 h-4" />
          <span class="text-sm">臨時指令</span>
          <span class="text-xs text-muted-foreground">
            {{ additionalPrompt ? '(已填寫)' : '(選填，用於補充照片描述)' }}
          </span>
        </Button>
        <Textarea
          v-if="showAdditionalPrompt"
          v-model="additionalPrompt"
          placeholder="例如：這張照片是在戶外拍攝的、獸裝上有特殊配件、想要強調的重點等..."
          class="min-h-20 resize-y text-sm animate-in fade-in slide-in-from-top-2 duration-200"
        />
      </div>

      <!-- AI 提供者選擇 -->
      <div v-if="availableProviders.length > 1" class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground shrink-0">使用：</span>
        <div class="flex flex-wrap gap-1.5">
          <Badge
            v-for="p in availableProviders"
            :key="p.id"
            :variant="activeProvider === p.provider ? 'default' : 'outline'"
            class="cursor-pointer transition-colors"
            @click="setActiveProvider(p.provider)"
          >
            {{ providerLabels[p.provider] ?? p.name }}
          </Badge>
        </div>
      </div>

      <Button
        id="tour-generate-btn"
        class="w-full"
        :disabled="isGenerating || !imageFile"
        @click="handleGenerateAI"
      >
        <Icon v-if="!isGenerating" name="lucide:sparkles" class="w-4 h-4" />
        <span v-if="isGenerating" class="animate-pulse">✨ AI 靈感湧現中...</span>
        <span v-else>{{ imageFile ? '讓 AI 幫我寫草稿！' : '請先上傳圖片以使用 AI' }}</span>
      </Button>

      <Textarea
        id="tour-main-text"
        v-model="mainText"
        placeholder="草稿內容..."
        class="min-h-30 resize-y"
      />
    </div>
  </Card>
</template>
