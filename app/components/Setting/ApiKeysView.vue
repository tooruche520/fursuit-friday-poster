<script setup lang="ts">
import type { ApiKeyConfig } from "~/types";
import { toast } from "vue-sonner";

const { apiKeys, updateApiKey, toggleApiKey, validateApiKey } = useApiKeys();

// 顯示/隱藏 API Key
const showApiKey = ref<Record<string, boolean>>({});

// 編輯中的 API Key
const editingKeys = ref<Record<string, string>>({});

// 初始化編輯狀態
onMounted(() => {
  apiKeys.value.forEach((config) => {
    editingKeys.value[config.id] = config.key;
    showApiKey.value[config.id] = false;
  });
});

// 監聽 apiKeys 變化，同步編輯狀態
watch(
  apiKeys,
  (newKeys) => {
    newKeys.forEach((config) => {
      if (!(config.id in editingKeys.value)) {
        editingKeys.value[config.id] = config.key;
        showApiKey.value[config.id] = false;
      }
    });
  },
  { deep: true },
);

// 切換 API Key 顯示
const toggleShowKey = (id: string) => {
  showApiKey.value[id] = !showApiKey.value[id];
};

// 儲存 API Key
const saveApiKey = (config: ApiKeyConfig) => {
  const newKey = editingKeys.value[config.id] || "";

  if (!newKey.trim()) {
    toast.error("API Key 不能為空");
    return;
  }

  if (!validateApiKey(config.provider, newKey)) {
    toast.warning("API Key 格式可能不正確，但已儲存");
  }

  updateApiKey(config.provider, newKey);
  toast.success(`${config.name} API Key 已更新`);
};

// 測試 API Key
const testingKey = ref<string | null>(null);

const testApiKey = async (config: ApiKeyConfig) => {
  if (!config.key.trim()) {
    toast.error("請先輸入並儲存 API Key");
    return;
  }

  testingKey.value = config.id;
  try {
    let result: { success: boolean; error?: string };

    if (config.provider === "gemini") {
      const { testConnection } = useGemini();
      result = await testConnection();
    } else if (config.provider === "openai") {
      const { testConnection } = useOpenAI();
      result = await testConnection();
    } else if (config.provider === "anthropic") {
      const { testConnection } = useAnthropic();
      result = await testConnection();
    } else {
      toast.info("自訂 API 無法自動測試");
      return;
    }

    if (result.success) {
      toast.success(`${config.name} 連線測試成功！`);
    } else {
      toast.error(`連線失敗：${result.error}`);
    }
  } finally {
    testingKey.value = null;
  }
};

// 複製 API Key
const copyApiKey = async (key: string) => {
  const { copy } = useCopyToClipboard();
  const success = await copy(key);
  if (success) {
    toast.success("API Key 已複製到剪貼簿");
  } else {
    toast.error("複製失敗");
  }
};

// 取得 Provider 圖示
const getProviderIcon = (provider: ApiKeyConfig["provider"]): string => {
  const icons = {
    gemini: "lucide:sparkles",
    openai: "lucide:brain",
    anthropic: "lucide:bot",
    custom: "lucide:globe",
  };
  return icons[provider] || "lucide:key";
};

// 取得 Provider 顏色
const getProviderColor = (provider: ApiKeyConfig["provider"]): string => {
  const colors = {
    gemini: "text-purple-600",
    openai: "text-green-600",
    anthropic: "text-orange-600",
    custom: "text-blue-600",
  };
  return colors[provider] || "text-slate-600";
};

// 遮罩 API Key 顯示
const maskApiKey = (key: string): string => {
  if (!key) return "未設定";
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 4) + "••••" + key.slice(-4);
};
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
    <!-- 標題區 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">API 金鑰管理</h1>
        <p class="text-sm text-muted-foreground mt-1">
          管理各種 AI 服務的 API Keys，確保服務正常運作
        </p>
      </div>
    </div>

    <!-- API Keys 列表 -->
    <div class="space-y-4">
      <Card v-for="config in apiKeys" :key="config.id">
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div
                class="p-2 rounded-lg"
                :class="`bg-${config.provider === 'gemini' ? 'purple' : config.provider === 'openai' ? 'green' : config.provider === 'anthropic' ? 'orange' : 'blue'}-100`"
              >
                <Icon
                  :name="getProviderIcon(config.provider)"
                  class="w-5 h-5"
                  :class="getProviderColor(config.provider)"
                />
              </div>
              <div>
                <CardTitle class="text-lg">{{ config.name }}</CardTitle>
                <CardDescription v-if="config.description">
                  {{ config.description }}
                </CardDescription>
              </div>
            </div>
            <Badge :variant="config.enabled ? 'default' : 'outline'">
              {{ config.enabled ? "啟用中" : "已停用" }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- API Key 輸入 -->
          <div class="space-y-2">
            <Label :for="`api-key-${config.id}`">API Key</Label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <Input
                  :id="`api-key-${config.id}`"
                  v-model="editingKeys[config.id]"
                  :type="showApiKey[config.id] ? 'text' : 'password'"
                  :placeholder="`輸入 ${config.name} API Key`"
                  class="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  class="absolute right-0 top-0 h-full"
                  @click="toggleShowKey(config.id)"
                >
                  <Icon
                    :name="
                      showApiKey[config.id] ? 'lucide:eye-off' : 'lucide:eye'
                    "
                    class="w-4 h-4"
                  />
                </Button>
              </div>
              <Button
                variant="default"
                @click="saveApiKey(config)"
                :disabled="editingKeys[config.id] === config.key"
              >
                <Icon name="lucide:save" class="w-4 h-4 mr-2" />
                儲存
              </Button>
            </div>
          </div>

          <!-- API Key 資訊 -->
          <div
            v-if="config.key"
            class="flex items-center justify-between p-3 bg-muted rounded-lg"
          >
            <div class="flex items-center gap-2">
              <Icon name="lucide:check-circle" class="w-4 h-4 text-green-600" />
              <span class="text-sm text-muted-foreground">
                當前 API Key: {{ maskApiKey(config.key) }}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              @click="copyApiKey(config.key)"
              class="h-auto py-1"
            >
              <Icon name="lucide:copy" class="w-3.5 h-3.5 mr-1" />
              複製
            </Button>
          </div>

          <!-- 操作按鈕 -->
          <div class="flex items-center justify-between pt-2 border-t">
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="testApiKey(config)"
                :disabled="!config.key || testingKey === config.id"
              >
                <Icon
                  v-if="testingKey === config.id"
                  name="lucide:loader-circle"
                  class="w-4 h-4 mr-2 animate-spin"
                />
                <Icon v-else name="lucide:test-tube" class="w-4 h-4 mr-2" />
                {{ testingKey === config.id ? "測試中..." : "測試連線" }}
              </Button>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">
                {{ config.enabled ? "已啟用" : "已停用" }}
              </span>
              <Button
                variant="ghost"
                size="sm"
                @click="toggleApiKey(config.provider)"
              >
                <Icon
                  :name="
                    config.enabled ? 'lucide:toggle-right' : 'lucide:toggle-left'
                  "
                  class="w-5 h-5"
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 說明區 -->
    <Card class="bg-muted/50">
      <CardContent class="pt-0">
        <div class="flex gap-3">
          <Icon name="lucide:info" class="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div class="space-y-2">
            <h3 class="font-semibold text-foreground">如何取得 API Key？</h3>
            <ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                <strong>Google Gemini:</strong> 前往
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  class="underline hover:text-primary"
                  >Google AI Studio</a
                >
                申請
              </li>
              <li>
                <strong>OpenAI:</strong> 前往
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  class="underline hover:text-primary"
                  >OpenAI Platform</a
                >
                申請
              </li>
              <li>
                <strong>Anthropic:</strong> 前往
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  class="underline hover:text-primary"
                  >Anthropic Console</a
                >
                申請
              </li>
            </ul>
            <p class="text-sm text-muted-foreground mt-3">
              💡 API Key 僅儲存在您的瀏覽器本地，不會上傳至任何伺服器
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
