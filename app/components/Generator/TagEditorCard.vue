<script setup lang="ts">
import type { Tag } from '~/types'
import { toast } from 'vue-sonner'

const props = defineProps<{
  modelValue: Tag[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Tag[]]
}>()

const { upsertContact } = useContacts()
const { roles } = useRoles()
const { getPlatform } = usePlatforms()

const tags = computed({
  get: () => props.modelValue,
  set: (value: Tag[]) => emit('update:modelValue', value),
})

const editingTag = ref<Tag | null>(null)
const dragItem = ref<number | null>(null)
const dragOverItem = ref<number | null>(null)

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2, 11)
}

const cloneTag = (tag: Tag): Tag => JSON.parse(JSON.stringify(tag))

const handleDragSort = () => {
  if (dragItem.value === null || dragOverItem.value === null) return

  const sortedTags = [...tags.value]
  const currentTag = sortedTags[dragItem.value]
  if (!currentTag) return

  sortedTags.splice(dragItem.value, 1)
  sortedTags.splice(dragOverItem.value, 0, currentTag)
  tags.value = sortedTags

  dragItem.value = null
  dragOverItem.value = null
}

const saveTag = () => {
  if (!editingTag.value) return

  if (!editingTag.value.name.trim()) {
    toast.error('請輸入顯示名稱')
    return
  }

  const tagId = editingTag.value.id || createId()
  const nextTag = {
    ...cloneTag(editingTag.value),
    id: tagId,
  }

  upsertContact({
    id: tagId,
    name: nextTag.name,
    role: nextTag.role,
    platforms: cloneTag(nextTag).platforms,
  })

  const index = tags.value.findIndex((tag) => tag.id === tagId)
  if (index >= 0) {
    tags.value = [
      ...tags.value.slice(0, index),
      nextTag,
      ...tags.value.slice(index + 1),
    ]
  } else {
    tags.value = [...tags.value, nextTag]
  }

  editingTag.value = null
  toast.success('標記已儲存')
}

const removeTag = (id: string) => {
  tags.value = tags.value.filter((tag) => tag.id !== id)
  toast.success('已移除標記')
}

const startEditTag = (tag: Tag) => {
  editingTag.value = cloneTag(tag)
}

const createNewTag = () => {
  editingTag.value = {
    id: '',
    name: '',
    role: roles.value[0]?.name || '🐾 搭檔',
    platforms: [
      {
        id: createId(),
        type: 'twitter',
        handle: '',
      },
    ],
  }
}
</script>

<template>
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
        class="text-center p-8 bg-input/30 border rounded-md text-muted-foreground text-sm"
      >
        尚無綁定任何夥伴
      </div>

      <div
        v-for="(tag, index) in tags"
        :key="tag.id"
        draggable="true"
        class="flex items-center justify-between p-3 bg-background dark:bg-input/30 border rounded-md shadow-sm group hover:bg-accent/50 dark:hover:bg-input/50 transition-colors cursor-move"
        @dragstart="dragItem = index"
        @dragenter="dragOverItem = index"
        @dragend="handleDragSort"
        @dragover.prevent
      >
        <div class="flex items-center gap-3 overflow-hidden">
          <Icon name="lucide:grip-vertical" class="w-4 h-4 shrink-0" />
          <span
            class="bg-card text-foreground text-xs px-2 py-1 rounded border border-accent whitespace-nowrap"
          >
            {{ tag.role }}
          </span>
          <span class="font-medium text-foreground truncate">
            {{ tag.name || '未命名夥伴' }}
          </span>
          <div class="flex items-center gap-2 ml-2">
            <Icon
              v-for="platform in tag.platforms.filter((item) => item.handle)"
              :key="platform.id"
              :name="getPlatform(platform.type).icon"
              class="w-3.5 h-3.5 text-foreground"
            />
          </div>
        </div>
        <div class="flex items-center opacity-100">
          <Button
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            @click="startEditTag(tag)"
          >
            <Icon name="lucide:edit-2" class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
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

  <ContactTagEditor
    v-model="editingTag"
    :title="editingTag?.id ? '編輯本篇貼文標記' : '新增本篇貼文標記'"
    confirm-text="確認綁定"
    @confirm="saveTag"
  />
</template>