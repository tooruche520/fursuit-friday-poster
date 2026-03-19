<script setup lang="ts">
import type { Tag, Platform, Contact } from "~/types";
import { toast } from "vue-sonner";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const { contacts, upsertContact } = useContacts();
const { platforms, activePlatform, getPlatform, getPlatformName } = usePlatforms();
const { copy } = useCopyToClipboard();
const { generateCaption } = useGemini();
const { styles } = useStyles();

// 風格選擇
const selectedStyle = ref<string | null>(null);

// 臨時指令
const additionalPrompt = ref<string>("");
const showAdditionalPrompt = ref<boolean>(false);

// 狀態管理
const imageFile = ref<File | null>(null);
const imagePreview = ref<string>("");
const imageUploaded = ref(false);
const isGenerating = ref(false);
const mainText = ref("");
const hashtags = useLocalStorage<string>(
  "fursuit-friday-hashtags",
  "#FursuitFriday #Fursuit #Kemono",
);
const tags = ref<Tag[]>([]);
const copied = ref(false);

// 編輯狀態
const editingTag = ref<Tag | null>(null);

// 拖曳排序
const dragItem = ref<number | null>(null);
const dragOverItem = ref<number | null>(null);

const handleDragSort = () => {
  if (dragItem.value === null || dragOverItem.value === null) return;

  const copyTags = [...tags.value];
  const dragItemContent = copyTags[dragItem.value];
  if (!dragItemContent) return;

  copyTags.splice(dragItem.value, 1);
  copyTags.splice(dragOverItem.value, 0, dragItemContent);

  tags.value = copyTags;
  dragItem.value = null;
  dragOverItem.value = null;
};

// 圖片上傳處理
const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("請上傳圖片檔案");
    return;
  }

  imageFile.value = file;
  imageUploaded.value = true;

  // 生成預覽
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  toast.success("圖片已上傳");
};

// 獲取選中的風格提示詞
const getSelectedStylePrompt = (): string | undefined => {
  if (!selectedStyle.value) return undefined;

  const style = styles.value.find((s) => s.id === selectedStyle.value);
  return style?.prompt;
};

// AI 生成
const handleGenerateAI = async () => {
  if (!imageFile.value) {
    toast.error("請先上傳圖片");
    return;
  }

  isGenerating.value = true;

  try {
    // 將圖片轉為 base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // 移除 data:image/...;base64, 前綴
        const base64 = result.split(",")[1];
        resolve(base64 || "");
      };
    });
    reader.readAsDataURL(imageFile.value);
    const imageBase64 = await base64Promise;

    // 調用 Gemini API
    const result = await generateCaption({
      stylePrompt: getSelectedStylePrompt(),
      additionalPrompt: additionalPrompt.value.trim() || undefined,
      imageBase64,
      imageType: imageFile.value.type,
    });

    if (result.success && result.text) {
      mainText.value = result.text;
      toast.success("AI 草稿生成完成！");
    } else {
      toast.error(result.error || "生成失敗，請稍後再試");
    }
  } catch (error: any) {
    console.error("AI 生成錯誤:", error);
    toast.error("生成失敗，請檢查網路連線");
  } finally {
    isGenerating.value = false;
  }
};

// 複製功能
const handleCopy = async () => {
  const text = generateFinalText();
  const success = await copy(text);

  if (success) {
    copied.value = true;
    toast.success("複製成功！快去貼文吧 🎉");
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } else {
    toast.error("複製失敗，請手動複製");
  }
};

// 生成最終文字
const generateFinalText = (): string => {
  let result = mainText.value + "\n\n";

  // 按角色分組
  const groupedByRole = tags.value.reduce(
    (acc, tag) => {
      if (!acc[tag.role]) acc[tag.role] = [];
      acc[tag.role]!.push(tag);
      return acc;
    },
    {} as Record<string, Tag[]>,
  );

  // 輸出每個角色分組
  Object.entries(groupedByRole).forEach(([role, tagList]) => {
    const handles = tagList
      .map((tag) => {
        let platform
        
        // 如果 activePlatform 是自訂平台（custom-xxx）
        if (activePlatform.value.startsWith('custom-')) {
          const customName = getPlatform(activePlatform.value).name
          platform = tag.platforms.find(
            (p) => p.type === 'custom' && p.customName === customName,
          )
        } else {
          platform = tag.platforms.find(
            (p) => p.type === activePlatform.value,
          )
        }
        
        // 若沒有選中平台的帳號，直接使用顯示名稱
        return platform?.handle || tag.name;
      })
      .filter(Boolean)
      .join(" ");

    if (handles) {
      result += `${role}：${handles}\n`;
    }
  });

  result += "\n" + hashtags.value;

  return result;
};

// 儲存標記
const saveTag = () => {
  if (!editingTag.value) return;

  if (!editingTag.value.name.trim()) {
    toast.error("請輸入顯示名稱");
    return;
  }

  // 同步更新到通訊錄（新增或更新）
  upsertContact({
    // 如果 editingTag 有 id，就用它（可能是從通訊錄選的或編輯的）
    // 如果沒有 id，就生成新的（全新的標記）
    id: editingTag.value.id || Math.random().toString(36).substr(2, 9),
    name: editingTag.value.name,
    role: editingTag.value.role,
    platforms: JSON.parse(JSON.stringify(editingTag.value.platforms)),
  });

  // 更新或新增標記到本次貼文的標記列表
  if (tags.value.some(t => t.id === editingTag.value!.id)) {
    // 已存在，更新
    const index = tags.value.findIndex((t) => t.id === editingTag.value!.id);
    if (index >= 0) {
      tags.value[index] = { ...editingTag.value };
    }
  } else {
    // 不存在，新增（確保有 id）
    tags.value.push({
      ...editingTag.value,
      id: editingTag.value.id || Math.random().toString(36).substr(2, 9),
    });
  }

  editingTag.value = null;
  toast.success("標記已儲存");
};

const removeTag = (id: string) => {
  tags.value = tags.value.filter((t) => t.id !== id);
  toast.success("已移除標記");
};

const startEditTag = (tag: Tag) => {
  editingTag.value = JSON.parse(JSON.stringify(tag));
};

const createNewTag = () => {
  editingTag.value = {
    id: "",
    name: "",
    role: "🐾 搭檔",
    platforms: [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: "twitter",
        handle: "",
      },
    ],
  };
};
</script>

<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto animate-in fade-in duration-300"
  >
    <!-- 左側操作區 -->
    <div class="lg:col-span-7 space-y-6">
      <!-- 1. AI 文案生成 -->
      <Card class="p-6 shadow-none rounded-md">
        <div class="flex items-center gap-3">
          <Icon name="lucide:message-square" class="w-5 h-5 text-primary" />
          <h2 class="text-lg font-semibold">1. AI 文案生成</h2>
        </div>

        <div class="space-y-4">
          <div class="relative">
            <input
              type="file"
              accept="image/*"
              class="hidden"
              id="image-upload"
              @change="handleImageUpload"
            />
            <label
              for="image-upload"
              class="block border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors overflow-hidden"
              :class="
                imageUploaded
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-300 hover:bg-slate-50 bg-white'
              "
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
                  class="w-10 h-10 text-slate-400 mb-2"
                />
                <p
                  class="text-sm font-medium"
                  :class="imageUploaded ? 'text-primary' : 'text-slate-600'"
                >
                  {{ imageUploaded ? "圖片已上傳" : "點擊或拖曳上傳圖片" }}
                </p>
              </div>
            </label>
          </div>

          <!-- 風格選擇 -->
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="style in styles"
              :key="style.id"
              :variant="selectedStyle === style.id ? 'default' : 'outline'"
              class="cursor-pointer transition-colors py-1"
              :class="
                selectedStyle === style.id
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'hover:bg-slate-100'
              "
              @click="
                selectedStyle = selectedStyle === style.id ? null : style.id
              "
            >
              {{ style.name }}
            </Badge>
            <Badge
              variant="outline"
              class="cursor-pointer border-dashed hover:bg-slate-100 transition-colors"
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

          <!-- 臨時指令（可摺疊） -->
          <div class="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              class="w-full justify-start gap-2 text-slate-600 hover:text-slate-900 h-8"
              @click="showAdditionalPrompt = !showAdditionalPrompt"
            >
              <Icon
                :name="showAdditionalPrompt ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                class="w-4 h-4"
              />
              <Icon name="lucide:message-square-plus" class="w-4 h-4" />
              <span class="text-sm">臨時指令</span>
              <span class="text-xs text-slate-400">
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

          <Button
            class="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            :disabled="isGenerating || !imageFile"
            @click="handleGenerateAI"
          >
            <Icon v-if="!isGenerating" name="lucide:sparkles" class="w-4 h-4" />
            <span v-if="isGenerating" class="animate-pulse"
              >✨ AI 靈感湧現中...</span
            >
            <span v-else>{{
              imageFile ? "讓 AI 幫我寫草稿！" : "請先上傳圖片以使用 AI"
            }}</span>
          </Button>

          <Textarea
            v-model="mainText"
            placeholder="草稿內容..."
            class="min-h-30 resize-y"
          />
        </div>
      </Card>

      <!-- 2. 標記者 -->
      <Card class="p-6 shadow-none rounded-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Icon name="lucide:users" class="w-5 h-5 text-primary" />
            <h2 class="text-lg font-semibold">2. 標記者</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="gap-2"
            @click="createNewTag"
          >
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
              <Icon
                name="lucide:grip-vertical"
                class="w-4 h-4 text-slate-400 shrink-0"
              />
              <span
                class="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded border border-slate-200 whitespace-nowrap"
              >
                {{ tag.role }}
              </span>
              <span class="font-medium text-slate-900 truncate">
                {{ tag.name || "未命名夥伴" }}
              </span>
              <div class="flex items-center gap-2 ml-2">
                <Icon
                  v-for="platform in tag.platforms.filter((p) => p.handle)"
                  :key="platform.id"
                  :name="getPlatform(platform.type).icon"
                  class="w-3.5 h-3.5 text-slate-400"
                />
              </div>
            </div>
            <div class="flex items-center opacity-100">
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

          <p
            v-if="tags.length > 1"
            class="text-xs text-slate-400 text-center mt-3 pt-2"
          >
            💡 提示:按住項目可以拖曳自訂順序,相同定位的夥伴會自動合併於同一行
          </p>
        </div>
      </Card>

      <!-- 3. 排版與 Hashtags -->
      <Card class="p-6 shadow-none rounded-md">
        <div class="flex items-center gap-3">
          <Icon name="lucide:hash" class="w-5 h-5 text-primary" />
          <h2 class="text-lg font-semibold">3. Hashtags</h2>
        </div>
        <Input v-model="hashtags" placeholder="#FursuitFriday #Kemono" />
      </Card>
    </div>

    <!-- 右側預覽區 -->
    <div class="lg:col-span-5 relative">
      <div class="sticky top-16 space-y-4">
        <Card class="overflow-hidden shadow-none rounded-md pt-0 gap-0">
          <CardContent class="p-2">
            <Tabs v-model="activePlatform" class="w-full gap-0">
              <TabsList class="w-full bg-background grid grid-cols-5">
                <TabsTrigger
                  value="twitter"
                  class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded flex items-center justify-center gap-1 text-xs"
                >
                  <Icon name="lucide:twitter" class="w-4 h-4" />
                  <span class="hidden sm:inline">X</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ig"
                  class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded flex items-center justify-center gap-1 text-xs"
                >
                  <Icon name="lucide:instagram" class="w-4 h-4" />
                  <span class="hidden sm:inline">IG</span>
                </TabsTrigger>
                <TabsTrigger
                  value="bsky"
                  class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded flex items-center justify-center gap-1 text-xs"
                >
                  <Icon name="lucide:cloud" class="w-4 h-4" />
                  <span class="hidden sm:inline">Bsky</span>
                </TabsTrigger>
                <TabsTrigger
                  value="threads"
                  class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded flex items-center justify-center gap-1 text-xs"
                >
                  <Icon name="lucide:at-sign" class="w-4 h-4" />
                  <span class="hidden sm:inline">Threads</span>
                </TabsTrigger>
                <TabsTrigger
                  value="plurk"
                  class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded flex items-center justify-center gap-1 text-xs"
                >
                  <Icon name="lucide:message-circle" class="w-4 h-4" />
                  <span class="hidden sm:inline">Plurk</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
          <div class="border-t border-slate-200 p-6 min-h-75">
            <div
              class="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed"
            >
              <span v-if="!generateFinalText()" class="text-slate-400 italic"
                >尚未輸入內容...</span
              >
              <span v-else>{{ generateFinalText() }}</span>
            </div>
          </div>
        </Card>

        <ButtonGroup class="w-full">
          <Button
            class="flex-1 h-14 text-base font-bold shadow-lg transition-all"
            :class="
              copied
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            "
            @click="handleCopy"
          >
            <div v-if="!copied" class="flex items-center gap-3">
              複製
              <div class="flex items-center gap-1">
                <Icon :name="getPlatform(activePlatform).icon" />
                {{ getPlatform(activePlatform).name }} 
              </div>
              專屬格式
            </div>
            <template v-else> 複製成功！快去貼文吧 🎉 </template>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                class="h-14 shadow-lg"
                :class="
                  copied
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                "
                size="icon"
              >
                <Icon name="lucide:chevron-down" class="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                v-for="platform in platforms.filter(p => p.id !== 'custom')"
                :key="platform.id"
                @click="activePlatform = platform.id"
              >
                <Icon :name="platform.icon" class="w-4 h-4" />
                {{ platform.name }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
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
</template>
