<script setup lang="ts">
import { useSidebar } from '@/components/ui/sidebar'
const { setOpenMobile } = useSidebar()

const tabValue = ref("contacts");

const onMenuButtonClick = (value: string) => {
  tabValue.value = value;
  setOpenMobile(false); // 關閉手機端的側邊欄
};
</script>

<template>
  <Tabs default-value="generator" v-model="tabValue" class="w-full">
    <div class="w-full">
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
                  <SidebarMenuItem>
                    <SidebarMenuButton @click="onMenuButtonClick('roles')" :is-active="tabValue === 'roles'">
                      <Icon name="lucide:tag" />
                      角色定位
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton @click="onMenuButtonClick('apikeys')" :is-active="tabValue === 'apikeys'">
                      <Icon name="lucide:key" />
                      API 金鑰
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
          <main class="px-4 mt-4 w-full">
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
