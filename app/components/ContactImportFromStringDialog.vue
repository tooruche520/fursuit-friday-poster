<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button'
import { ScrollAreaCorner } from 'reka-ui'
import { toast } from 'vue-sonner'

const open = defineModel<boolean>('open', { default: false })

const { decodeImportParam, findDuplicate, importContacts } = useContactImport()
const { getRole } = useRoles()
const { getPlatform } = usePlatforms()

const inputString = ref('')

// 清空輸入框於關閉時
watch(open, (val) => {
  if (!val) inputString.value = ''
})

const decoded = computed(() => {
  const str = inputString.value.trim()
  if (!str) return null
  return decodeImportParam(str)
})

const decodeError = computed(() => {
  const str = inputString.value.trim()
  if (!str || decoded.value !== null) return null
  return '字串格式無效，請確認是否完整複製'
})

const duplicateNames = computed(() => {
  if (!decoded.value) return new Set<string>()
  return new Set(
    decoded.value.filter(p => findDuplicate(p.name)).map(p => p.name),
  )
})

const hasDuplicates = computed(() => duplicateNames.value.size > 0)

const handleImport = (mode: 'overwrite-duplicates' | 'skip-duplicates') => {
  if (!decoded.value) return
  const count = importContacts(decoded.value, mode)
  const skipped = decoded.value.length - count
  if (skipped > 0) {
    toast.success(`已導入 ${count} 筆，跳過 ${skipped} 筆重複`)
  } else {
    toast.success(`已成功導入 ${count} 筆聯絡人`)
  }
  open.value = false
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent class="max-w-lg">
      <AlertDialogHeader>
        <AlertDialogTitle>從字串導入</AlertDialogTitle>
        <AlertDialogDescription>
          貼上由「複製導入字串」產生的字串，確認內容後寫入本地通訊錄。
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div class="space-y-4">
        <!-- 輸入區 -->
        <div class="grid space-y-1.5">
          <Textarea
            v-model="inputString"
            placeholder="貼上導入字串..."
            class="text-xs text-wrap font-mono text-muted-foreground max-h-25"
          />
          <p v-if="decodeError" class="flex items-center gap-1.5 text-sm text-destructive">
            <Icon name="lucide:circle-x" class="w-3.5 h-3.5 shrink-0" />
            {{ decodeError }}
          </p>
        </div>

        <!-- 預覽區 -->
        <div v-if="decoded" class="space-y-2">
          <p class="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Icon name="lucide:list-checks" class="w-4 h-4" />
            預覽（共 {{ decoded.length }} 筆）
          </p>

          <!-- 重複警告 -->
          <div v-if="hasDuplicates" class="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md px-3 py-2">
            <Icon name="lucide:triangle-alert" class="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              有 {{ duplicateNames.size }} 筆與現有聯絡人同名（{{ [...duplicateNames].join('、') }}），請選擇處理方式。
            </span>
          </div>

          <!-- 聯絡人清單 -->
          <ScrollArea class="h-60 pr-3 -mr-3">
            <div class="space-y-2">
              <div
                v-for="(payload, i) in decoded"
                :key="i"
                class="rounded-md border bg-muted/40 px-3 py-2.5 space-y-1.5"
              >
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium text-foreground text-sm">{{ payload.name }}</span>
                  <Badge variant="secondary" class="gap-1 text-xs">
                    <Icon :name="getRole(payload.defaultRoleId).icon" class="w-3 h-3" />
                    {{ getRole(payload.defaultRoleId).name }}
                  </Badge>
                  <Badge v-if="payload.partnerDisplay" variant="outline" class="text-xs">
                    {{ payload.partnerDisplay }}
                  </Badge>
                  <Badge v-if="duplicateNames.has(payload.name)" variant="outline" class="text-xs text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                    <Icon name="lucide:triangle-alert" class="w-2.5 h-2.5 mr-1" />
                    重複
                  </Badge>
                </div>
  
                <div v-if="payload.platforms.length > 0" class="flex flex-wrap gap-1.5">
                  <Badge
                    v-for="(platform, j) in payload.platforms"
                    :key="j"
                    variant="outline"
                    class="gap-1 text-xs"
                  >
                    <Icon :name="getPlatform(platform.type).icon" class="w-3 h-3" />
                    <span v-if="platform.type === 'custom' && platform.customName" class="font-medium">
                      {{ platform.customName }}:
                    </span>
                    <span v-if="platform.handle">{{ platform.handle }}</span>
                    <span v-else class="text-muted-foreground italic">未填寫</span>
                  </Badge>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>

        <template v-if="decoded">
          <!-- 有重複：提供跳過 / 覆蓋兩個選項 -->
          <template v-if="hasDuplicates">
            <AlertDialogAction
              @click="handleImport('skip-duplicates')"
            >
              跳過重複
            </AlertDialogAction>
            <AlertDialogAction @click="handleImport('overwrite-duplicates')">
              覆蓋重複
            </AlertDialogAction>
          </template>

          <!-- 無重複：單一導入按鈕 -->
          <template v-else>
            <AlertDialogAction @click="handleImport('skip-duplicates')">
              全部導入
            </AlertDialogAction>
          </template>
        </template>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
