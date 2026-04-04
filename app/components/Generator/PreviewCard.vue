<script setup lang="ts">
import type { Tag } from '~/types'
import { toast } from 'vue-sonner'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const props = defineProps<{
  mainText: string
  hashtags: string
  tags: Tag[]
  activePlatform: string
}>()

const emit = defineEmits<{
  'update:activePlatform': [value: string]
}>()

const { builtInPlatforms, getPlatform } = usePlatforms()
const { roles } = useRoles()
const { copy } = useCopyToClipboard()

const copied = ref(false)

const activePlatformModel = computed({
  get: () => props.activePlatform,
  set: (value: string) => emit('update:activePlatform', value),
})

const finalText = computed(() => {
  let result = props.mainText + '\n\n'

  // 以 roleId + partnerLabel 組合為分組鍵，同組才合併到同一行
  const groups = new Map<string, { roleId: string; partnerLabel: string | undefined; tags: Tag[] }>()

  props.tags.forEach(tag => {
    const key = `${tag.roleId}::${tag.partnerLabel ?? ''}`
    if (!groups.has(key)) {
      groups.set(key, { roleId: tag.roleId, partnerLabel: tag.partnerLabel, tags: [] })
    }
    groups.get(key)!.tags.push(tag)
  })

  groups.forEach(({ roleId, partnerLabel, tags: tagList }) => {
    const handles = tagList
      .map((tag) => {
        if (props.activePlatform.startsWith('custom-')) {
          const customName = getPlatform(props.activePlatform).name
          return tag.platforms.find(
            (platform) => platform.type === 'custom' && platform.customName === customName,
          )?.handle || tag.name
        }

        return tag.platforms.find((platform) => platform.type === props.activePlatform)?.handle || tag.name
      })
      .filter(Boolean)
      .join(' ')

    if (!handles) return

    const roleDefinition = roles.value.find((item) => item.id === roleId)
    const displayName = partnerLabel || roleDefinition?.displayName || roleId
    result += `${displayName}: ${handles}\n`
  })

  result += '\n' + props.hashtags
  return result
})

const hasContent = computed(() => finalText.value.trim().length > 0)

const handleCopy = async () => {
  const success = await copy(finalText.value)

  if (!success) {
    toast.error('複製失敗，請手動複製')
    return
  }

  copied.value = true
  toast.success('複製成功！快去貼文吧 🎉')
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="sticky top-16 space-y-4">
    <Card class="overflow-hidden shadow-none rounded-md pt-0 gap-0">
      <CardContent class="p-2">
        <Tabs v-model="activePlatformModel" class="w-full gap-0">
          <TabsList class="w-full bg-background dark:bg-card grid grid-cols-5">
            <TabsTrigger
              v-for="platform in builtInPlatforms.slice(0, 5)"
              :key="platform.id"
              :value="platform.id"
              class="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground rounded flex items-center justify-center gap-1 text-xs transition"
            >
              <Icon :name="platform.icon" class="w-4 h-4" />
              <span class="hidden sm:inline">{{ platform.name }}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
      <div class="border-t p-6 min-h-75">
        <div class="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
          <span v-if="!hasContent" class="text-slate-400 italic">尚未輸入內容...</span>
          <span v-else>{{ finalText }}</span>
        </div>
      </div>
    </Card>

    <ButtonGroup class="w-full">
      <Button
        class="flex-1 h-14 text-base font-bold shadow-lg transition-all"
        @click="handleCopy"
      >
        <div v-if="!copied" class="flex items-center gap-3">
          複製
          <div class="flex items-center gap-1">
            <Icon :name="getPlatform(activePlatformModel).icon" />
            {{ getPlatform(activePlatformModel).name }}
          </div>
          專屬格式
        </div>
        <template v-else>複製成功！快去貼文吧 🎉</template>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button class="h-14 shadow-lg">
            <Icon name="lucide:chevron-down" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="platform in builtInPlatforms"
            :key="platform.id"
            @click="activePlatformModel = platform.id"
          >
            <Icon :name="platform.icon" class="w-4 h-4" />
            {{ platform.name }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>

    <CopyRightInfo />
  </div>
</template>