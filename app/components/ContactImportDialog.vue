<script setup lang="ts">
import type { ContactImportPayload } from '~/types'
import { buttonVariants } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const props = defineProps<{
  payload: ContactImportPayload[] | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { findDuplicate, importContact } = useContactImport()
const { getRole } = useRoles()
const { getPlatform } = usePlatforms()

// 控制 AlertDialog 開關
const open = ref(false)

watch(
  () => props.payload,
  (val) => { open.value = val !== null && val.length > 0 },
  { immediate: true },
)

const handleOpenChange = (val: boolean) => {
  if (!val) emit('close')
}

// 只處理第一筆（單筆導入）
const currentPayload = computed(() => props.payload?.[0] ?? null)

const duplicate = computed(() =>
  currentPayload.value ? findDuplicate(currentPayload.value.name) : undefined,
)

const handleImport = (mode: 'overwrite' | 'new') => {
  if (!currentPayload.value) return
  importContact(currentPayload.value, mode)
  toast.success(mode === 'overwrite' ? '已覆蓋聯絡人資料' : '聯絡人已成功導入')
}
</script>

<template>
  <AlertDialog v-model:open="open" @update:open="handleOpenChange">
    <AlertDialogContent class="max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle>導入聯絡人</AlertDialogTitle>
        <AlertDialogDescription>
          確認以下聯絡人資料是否正確，再寫入本地通訊錄。
        </AlertDialogDescription>
      </AlertDialogHeader>

      <template v-if="currentPayload">
        <!-- 聯絡人預覽卡 -->
        <div class="rounded-md border bg-muted/40 p-4 space-y-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-foreground text-base">{{ currentPayload.name }}</span>
            <Badge variant="secondary" class="gap-1">
              <Icon :name="getRole(currentPayload.defaultRoleId).icon" class="w-3 h-3" />
              {{ getRole(currentPayload.defaultRoleId).name }}
            </Badge>
            <Badge v-if="currentPayload.partnerDisplay" variant="outline" class="text-xs">
              {{ currentPayload.partnerDisplay }}
            </Badge>
          </div>

          <div v-if="currentPayload.platforms.length > 0" class="flex flex-wrap gap-2">
            <Badge
              v-for="(platform, i) in currentPayload.platforms"
              :key="i"
              variant="outline"
              class="gap-1"
            >
              <Icon :name="getPlatform(platform.type).icon" class="w-3.5 h-3.5" />
              <span v-if="platform.type === 'custom' && platform.customName" class="font-medium">
                {{ platform.customName }}:
              </span>
              <span v-if="platform.handle">{{ platform.handle }}</span>
              <span v-else class="text-muted-foreground italic">未填寫</span>
            </Badge>
          </div>
        </div>

        <!-- 重複聯絡人警告 -->
        <div v-if="duplicate" class="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md px-3 py-2">
          <Icon name="lucide:triangle-alert" class="w-4 h-4 mt-0.5 shrink-0" />
          <span>通訊錄已有同名聯絡人「{{ duplicate.name }}」，請選擇覆蓋或另存新筆。</span>
        </div>
      </template>

      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>

        <!-- 有重複時：兩個動作按鈕 -->
        <template v-if="duplicate">
          <AlertDialogAction
            @click="handleImport('new')"
          >
            另存新筆
          </AlertDialogAction>
          <AlertDialogAction @click="handleImport('overwrite')">
            覆蓋
          </AlertDialogAction>
        </template>

        <!-- 無重複時：單一導入按鈕 -->
        <template v-else>
          <AlertDialogAction @click="handleImport('new')">
            導入
          </AlertDialogAction>
        </template>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
