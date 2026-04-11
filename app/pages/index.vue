<script setup lang="ts">
import type { ContactImportPayload } from '~/types'
import { useTour } from '~/composables/useTour'

const { autoStartIfNew } = useTour()
const { decodeImportParam } = useContactImport()
const route = useRoute()
const router = useRouter()

const pendingImport = ref<ContactImportPayload[] | null>(null)

onMounted(() => {
  autoStartIfNew()

  const raw = route.query.import
  if (typeof raw === 'string' && raw) {
    const payload = decodeImportParam(raw)
    if (payload) {
      pendingImport.value = payload
    }
    // 無論解碼是否成功，清除 URL query string 避免重整再觸發
    router.replace({ query: { ...route.query, import: undefined } })
  }
})

const handleImportClose = () => {
  pendingImport.value = null
}
</script>

<template>
  <div class="min-h-screen bg-background font-sans text-slate-900 pb-12">
    <Header />

    <!-- Main Content -->
    <main class="px-4 mt-4">
      <GeneratorPage />
    </main>

    <ContactImportDialog
      :payload="pendingImport"
      @close="handleImportClose"
    />
  </div>
</template>
