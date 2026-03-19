<script setup lang="ts">
import { useSidebar } from '@/components/ui/sidebar'
const {
  state,
  open,
  setOpen,
  openMobile,
  setOpenMobile,
  isMobile,
  toggleSidebar,
} = useSidebar()

const tabValue = ref("contacts");

const onMenuButtonClick = (value: string) => {
  tabValue.value = value;
  setOpenMobile(false); // 關閉手機端的側邊欄
  setOpen(false); // 關閉桌面端的側邊欄
};
</script>

<template>
  <Tabs default-value="generator" v-model="tabValue">
    <div class="w-screen">
      <HeaderSetting />

      <div class="flex flex-1">
        <Sidebar class="mt-12 h-[calc(100vh-3rem)] shrink-0 bg-background" :default-open="true" >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>設定</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton @click="onMenuButtonClick('styles')" :is-active="tabValue === 'styles'">
                      <Icon name="lucide:palette" />
                      提示詞風格
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton @click="onMenuButtonClick('contacts')" :is-active="tabValue === 'contacts'">
                      <Icon name="lucide:users" />
                      通訊錄
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter> wuiroh </SidebarFooter>
        </Sidebar>

        <div class="flex flex-1">
          <main class="px-4 mt-4 w-full">
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
        </div>
      </div>
    </div>
  </Tabs>
</template>
