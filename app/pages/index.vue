<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
    <Tabs default-value="generator" >
      <!-- Header -->
      <header
        class="bg-white border-b border-slate-200 sticky top-0 z-40 mb-4 shadow-sm"
      >
        <div
          class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"
        >
          <h1
            class="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2"
          >
            🐾 FursuitFriday 發文神器
          </h1>

          <TabsList>
            <TabsTrigger value="generator"> 編輯貼文 </TabsTrigger>
            <TabsTrigger value="contacts"> 通訊錄管理 </TabsTrigger>
          </TabsList>
        </div>
      </header>

      <!-- Main Content -->
      <main class="px-4">
        <TabsContent value="generator">
          <GeneratorView />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsView />
        </TabsContent>
      </main>
    </Tabs>
  </div>
</template>
