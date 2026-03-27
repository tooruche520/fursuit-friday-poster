<script setup lang="ts">
import type { Tag } from '~/types'

const { activePlatform } = usePlatforms()

const mainText = ref('')
const hashtags = useLocalStorage(
  'fursuit-friday-hashtags',
  '#FursuitFriday #Fursuit #Kemono',
)
const tags = ref<Tag[]>([])
</script>

<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto animate-in fade-in duration-300"
  >
    <!-- 左側操作區 -->
    <div class="lg:col-span-7 space-y-6">
      <GeneratorAIGeneratorCard v-model="mainText" />
      <GeneratorTagEditorCard v-model="tags" />
      <GeneratorHashtagsCard v-model="hashtags" />
    </div>

    <div class="lg:col-span-5 relative">
      <GeneratorPreviewCard
        :main-text="mainText"
        :hashtags="hashtags"
        :tags="tags"
        :active-platform="activePlatform"
        @update:active-platform="activePlatform = $event"
      />
    </div>
  </div>
</template>
