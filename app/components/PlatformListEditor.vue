<script setup lang="ts">
import type { Platform } from '~/types'

const props = defineProps<{
  platforms: Platform[]
}>()

const emit = defineEmits<{
  update: [platforms: Platform[]]
}>()

const { platforms: platformDefs, getPlatform } = usePlatforms()

const addPlatform = () => {
  const newPlatforms = [...props.platforms, {
    id: Math.random().toString(36).substr(2, 9),
    type: 'twitter' as const,
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
          :model-value="platform.type"
          @update:model-value="(val) => updatePlatform(platform.id, 'type', String(val))"
        >
          <SelectTrigger class="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="pDef in platformDefs"
              :key="pDef.id"
              :value="pDef.id"
            >
              <div class="flex items-center gap-2">
                <Icon :name="pDef.icon" class="w-3.5 h-3.5" />
                <span>{{ pDef.name }}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- 自訂名稱 (僅 custom 顯示) -->
      <div v-if="platform.type === 'custom'" class="col-span-3">
        <Input
          :model-value="platform.customName"
          placeholder="平台名稱"
          class="h-9 text-xs"
          @update:model-value="(val) => updatePlatform(platform.id, 'customName', String(val))"
        />
      </div>

      <!-- 帳號輸入 -->
      <div :class="platform.type === 'custom' ? 'col-span-4' : 'col-span-7'">
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
          class="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
          @click="removePlatform(platform.id)"
        >
          <Icon name="lucide:x" class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- 新增按鈕 -->
    <Button
      variant="outline"
      size="sm"
      class="w-full border-dashed text-xs text-slate-500 hover:text-slate-700 hover:border-slate-400"
      @click="addPlatform"
    >
      <Icon name="lucide:plus" />
      新增社群平台
    </Button>
  </div>
</template>
