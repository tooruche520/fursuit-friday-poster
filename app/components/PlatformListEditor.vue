<script setup lang="ts">
import type { Platform } from '~/types'

const props = defineProps<{
  platforms: Platform[]
}>()

const emit = defineEmits<{
  update: [platforms: Platform[]]
}>()

const { builtInPlatforms, customPlatforms, getPlatform } = usePlatforms()

// 選單選項：內建平台 + 已建立的自訂平台 + 固定的「自訂」選項
const platformOptions = computed(() => [
  ...builtInPlatforms,
  ...customPlatforms.value,
  { id: 'custom', name: '自訂', icon: 'lucide:globe' }
])

// 檢查某個平台類型是否已被其他項目使用
const isPlatformUsed = (platformType: string, currentId: string) => {
  // 自訂平台（包括「自訂」和已存在的自訂平台）可以重複使用
  if (platformType === 'custom' || platformType.startsWith('custom-')) {
    return false
  }
  // 內建平台只能使用一次
  return props.platforms.some(p => p.id !== currentId && p.type === platformType)
}

const addPlatform = () => {
  // 找出第一個尚未使用的平台類型
  const usedTypes = props.platforms.map(p => p.type)
  const availablePlatform = platformOptions.value.find(pDef => !usedTypes.includes(pDef.id as Platform['type']))
  const defaultType = availablePlatform?.id || 'custom'
  
  const newPlatforms = [...props.platforms, {
    id: Math.random().toString(36).substr(2, 9),
    type: defaultType as Platform['type'],
    handle: '',
    customName: ''
  }]
  emit('update', newPlatforms)
}

const updatePlatform = (id: string, field: keyof Platform, value: any) => {
  const updated = props.platforms.map(p =>
    p.id === id ? { ...p, [field]: value } : p
  )
  emit('update', updated)
}

// 處理平台類型變更（包含選擇已存在的自訂平台）
const handlePlatformTypeChange = (platformId: string, selectedValue: string) => {
  // 查找是否為已存在的自訂平台
  const customPlatform = customPlatforms.value.find(cp => cp.id === selectedValue)
  
  if (customPlatform) {
    // 選擇已存在的自訂平台：設置 type='custom' 並自動填入 customName
    const updated = props.platforms.map(p =>
      p.id === platformId 
        ? { ...p, type: 'custom' as Platform['type'], customName: customPlatform.name }
        : p
    )
    emit('update', updated)
  } else {
    // 選擇內建平台或新的「自訂」
    updatePlatform(platformId, 'type', selectedValue)
    
    // 如果選擇的是「自訂」，清空 customName
    if (selectedValue === 'custom') {
      const updated = props.platforms.map(p =>
        p.id === platformId ? { ...p, customName: '' } : p
      )
      emit('update', updated)
    }
  }
}

// 取得平台選擇器顯示的值
const getPlatformSelectValue = (platform: Platform): string => {
  // 如果是 custom 類型且有 customName，嘗試找到對應的自訂平台 ID
  if (platform.type === 'custom' && platform.customName) {
    const customPlatform = customPlatforms.value.find(cp => cp.name === platform.customName)
    if (customPlatform) {
      return customPlatform.id
    }
  }
  return platform.type
}

const removePlatform = (id: string) => {
  const filtered = props.platforms.filter(p => p.id !== id)
  emit('update', filtered)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="platform in platforms"
      :key="platform.id"
      class="grid grid-cols-12 gap-2 items-start"
    >
      <!-- 平台選擇 -->
      <div class="col-span-4">
        <Select
          :model-value="getPlatformSelectValue(platform)"
          @update:model-value="(val) => handlePlatformTypeChange(platform.id, String(val))"
        >
          <SelectTrigger class="h-9 text-xs w-full">
            <div class="flex items-center gap-2">
              <Icon :name="getPlatform(platform.type).icon" class="w-3.5 h-3.5" />
              <span>
                {{ platform.type === 'custom' && platform.customName ? platform.customName : getPlatform(platform.type).name }}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="pDef in platformOptions"
              :key="pDef.id"
              :value="pDef.id"
              :disabled="isPlatformUsed(pDef.id, platform.id)"
            >
              <div class="flex items-center gap-2">
                <Icon :name="pDef.icon" class="w-3.5 h-3.5" />
                <span>{{ pDef.name }}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- 自訂名稱 (僅選擇「自訂」時顯示，選擇已存在的自訂平台時不顯示) -->
      <div v-if="platform.type === 'custom' && !customPlatforms.find(cp => cp.name === platform.customName)" class="col-span-3">
        <Input
          :model-value="platform.customName"
          placeholder="平台名稱"
          class="h-9 text-xs"
          @update:model-value="(val) => updatePlatform(platform.id, 'customName', String(val))"
        />
      </div>

      <!-- 帳號輸入 -->
      <div :class="platform.type === 'custom' && !customPlatforms.find(cp => cp.name === platform.customName) ? 'col-span-4' : 'col-span-7'">
        <Input
          :model-value="platform.handle"
          :placeholder="platform.type === 'twitter' ? '@username' : '帳號名稱'"
          class="h-9 text-xs"
          @update:model-value="(val) => updatePlatform(platform.id, 'handle', String(val))"
        />
      </div>

      <!-- 刪除按鈕 -->
      <div class="col-span-1 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          class="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
          @click="removePlatform(platform.id)"
        >
          <Icon name="lucide:trash-2" class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- 新增按鈕 -->
    <Button
      variant="outline"
      size="sm"
      class="w-full border-dashed text-xs text-muted-foreground hover:text-foreground hover:border-muted-foreground"
      @click="addPlatform"
    >
      <Icon name="lucide:plus" />
      新增社群平台
    </Button>
  </div>
</template>
