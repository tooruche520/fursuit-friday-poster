<script setup lang="ts">
import { useSidebar } from '@/components/ui/sidebar'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

const { setOpenMobile } = useSidebar()
const { activeTab, tabs, navigate } = useSettingTabs()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMd = breakpoints.greaterOrEqual('md')

// setup 期間同步執行，首次渲染前就設定好正確頁面
if (isMd.value) {
  navigate('contacts')
}

const onMenuButtonClick = (value: string) => {
  navigate(value);
  setOpenMobile(false);
};
</script>

<template>
  <Tabs v-model="activeTab" class="w-full">
    <div class="w-full">
      <HeaderSetting />

      <div class="flex flex-1">
        <Sidebar 
          class="mt-16 h-[calc(100vh-4rem)] shrink-0 bg-background" 
          :default-open="isMd"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>設定</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem v-for="tab in tabs" :key="tab.value">
                    <SidebarMenuButton @click="onMenuButtonClick(tab.value)" :is-active="activeTab === tab.value">
                      <Icon :name="tab.icon" />
                      {{ tab.label }}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <CopyRightInfo />
          </SidebarFooter>
        </Sidebar>

        <div class="flex flex-1">
          <main class="px-4 my-4 w-full">
            <TabsContent value="setting-home">
              <SettingHomeView />
            </TabsContent>
            <TabsContent value="contacts">
              <SettingContactsView />
            </TabsContent>
            <TabsContent value="roles">
              <SettingRolesView />
            </TabsContent>
            <TabsContent value="styles">
              <SettingStylesView />
            </TabsContent>
            <TabsContent value="apikeys">
              <SettingApiKeysView />
            </TabsContent>
          </main>
        </div>
      </div>
    </div>
  </Tabs>
</template>
