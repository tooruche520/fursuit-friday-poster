<script setup lang="ts">
import { useSidebar } from "@/components/ui/sidebar";
const {
  state,
  open,
  setOpen,
  openMobile,
  setOpenMobile,
  isMobile,
  toggleSidebar,
} = useSidebar();
</script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
      <!-- 右側選單 -->
      <div class="flex items-center justify-between gap-4">
        <!-- 回上一頁 -->
        <Button
          variant="ghost"
          size="icon"
          class="size-7 -m-2"
          @click="$router.back()"
        >
          <Icon name="lucide:arrow-left" />
        </Button>

        <h1 class="font-bold text-slate-900">設定</h1>

        <!-- 開啟關閉菜單 -->
        <Button
          variant="ghost"
          size="icon"
          class="size-7 -m-2"
          @click="toggleSidebar"
        >
          <Icon name="lucide:menu" />
        </Button>
      </div>
    </div>
  </header>
</template>
