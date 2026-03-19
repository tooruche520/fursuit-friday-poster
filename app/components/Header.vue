<script setup lang="ts"></script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-40">
    <div
      class="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between"
    >
    <NuxtLink to="/" class="flex items-center gap-2">
      <h1
        class="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2"
      >
        🐾 FursuitFriday 發文神器
      </h1>
    </NuxtLink>

      <!-- 右側選單 -->
      <div class="flex">
        <Button variant="ghost" size="sm" asChild>
          <NuxtLink to="https://github.com/tooruche520/fursuit-friday-poster">
            <Icon name="lucide:github" />
          </NuxtLink>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <NuxtLink to="/setting">
            <Icon name="lucide:settings" />
          </NuxtLink>
        </Button>
      </div>
    </div>
  </header>
</template>
