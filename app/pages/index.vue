<script setup lang="ts">
import { useTour } from '~/composables/useTour'

const { autoStartIfNew } = useTour()
onMounted(autoStartIfNew)
</script>

<template>
  <div class="min-h-screen bg-background font-sans text-slate-900 pb-12">
    <Header />

    <!-- Main Content -->
    <main class="px-4 mt-4">
      <GeneratorPage />
    </main>
  </div>
</template>
