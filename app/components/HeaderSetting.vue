<script setup lang="ts">
import { useSidebar } from "@/components/ui/sidebar";
import ModeToggle from './ModeToggle.vue'
const { toggleSidebar } = useSidebar();
</script>

<template>
  <header class="bg-background border-b sticky top-0 z-40">
    <div class="mx-auto px-4 h-12 flex items-center justify-between">
      <!-- 右側選單 -->
      <div class="flex items-center justify-around gap-2">
        <!-- 回上一頁 -->
        <Button
          variant="ghost"
          size="icon"
          class="-ml-2"
          asChild
        >
          <NuxtLink to="/">
            <Icon name="lucide:arrow-left" />
          </NuxtLink>
        </Button>

        <h1 class="font-bold text-foreground">設定</h1>

        <!-- 開啟關閉菜單 -->
        <Button
          variant="ghost"
          size="icon"
          class=""
          @click="toggleSidebar"
        >
          <Icon name="lucide:menu" />
        </Button>

      </div>

      <!-- 左側主題切換 -->
      <ModeToggle />
    </div>
  </header>
</template>
