<script setup lang="ts">
import { useTour } from '~/composables/useTour'

const { startTour } = useTour()
</script>

<template>
  <header class="bg-background border-b sticky top-0 z-40">
    <div
      class="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between"
    >
    <NuxtLink to="/" class="flex items-center gap-2">
      <h1
        class="text-lg font-bold tracking-tight text-foreground"
      >
        FursuitFriday 發文神器
      </h1>
    </NuxtLink>

      <!-- 右側選單 -->
      <div class="flex items-center">
        <Button
          id="tour-help-btn"
          variant="ghost"
          size="icon"
          class="text-foreground"
          title="功能導覽"
          @click="startTour"
        >
          <Icon name="lucide:circle-help" class="h-[1.2rem] w-[1.2rem]" />
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <NuxtLink to="https://github.com/tooruche520/fursuit-friday-poster" class="text-foreground">
            <Icon name="lucide:github" class="h-[1.2rem] w-[1.2rem]" />
          </NuxtLink>
        </Button>
        <Button id="tour-settings-link" variant="ghost" size="icon" asChild>
          <NuxtLink to="/setting" class="text-foreground">
            <Icon name="lucide:settings" class="h-[1.2rem] w-[1.2rem]" />
          </NuxtLink>
        </Button>

        <ModeToggle />
      </div>
    </div>
  </header>
</template>
