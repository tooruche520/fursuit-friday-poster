<script setup lang="ts">
import { useSidebar } from "@/components/ui/sidebar";
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import ModeToggle from './ModeToggle.vue'

const { toggleSidebar } = useSidebar();
const { activeTab, navigate } = useSettingTabs();

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMd = breakpoints.greaterOrEqual('md')

// 回上一頁
const goBack = async () => {
  if (activeTab.value !== 'setting-home' && !isMd.value) {
    navigate('setting-home');
  } else {
    await navigateTo('/')
  }
};
</script>

<template>
  <header class="bg-background border-b sticky top-0 z-40">
    <div class="mx-auto px-4 h-16 flex items-center justify-between">
      <!-- 右側選單 -->
      <div class="flex items-center justify-around">
        <!-- 回上一頁 -->
        <Button
          variant="ghost"
          size="icon"
          class="-ml-2"
          @click="goBack"
        >
          <Icon name="lucide:arrow-left" :size="16"/>
        </Button>

        <!-- 開啟關閉菜單 -->
        <Button
          variant="ghost"
          size="icon"
          class=""
          @click="toggleSidebar"
        >
          <Icon name="lucide:menu" :size="16"/>
        </Button>

        <h1 class="text-lg font-bold text-foreground ml-3">設定</h1>

      </div>

      <!-- 左側主題切換 -->
      <ModeToggle />
    </div>
  </header>
</template>
