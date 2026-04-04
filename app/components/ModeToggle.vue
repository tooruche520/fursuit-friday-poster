<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const colorMode = useColorMode()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="text-foreground">
        <Icon icon="lucide:moon" :size="16" class="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Icon icon="lucide:sun" :size="16" class="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="colorMode.preference = 'light'">
        亮色
      </DropdownMenuItem>
      <DropdownMenuItem @click="colorMode.preference = 'dark'">
        暗色
      </DropdownMenuItem>
      <DropdownMenuItem @click="colorMode.preference = 'system'">
        系統設定
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
