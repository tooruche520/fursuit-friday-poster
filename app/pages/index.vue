<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-background font-sans text-slate-900 pb-12">
    <Tabs default-value="generator">
      <Header />

      <!-- Main Content -->
      <main class="px-4 mt-4">
        <TabsContent value="generator">
          <GeneratorView />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsView />
        </TabsContent>
        <TabsContent value="styles">
          <StylesView />
        </TabsContent>
      </main>
    </Tabs>
  </div>
</template>
