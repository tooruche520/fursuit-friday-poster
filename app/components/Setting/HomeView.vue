<script setup lang="ts">
const { tabs, navigate } = useSettingTabs();
</script>

<template>
  <div class="">
    <!-- 標題 -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-foreground flex items-center gap-2 mt-4">
        設定
      </h2>
    </div>

    <!-- 列表 -->
    <ItemGroup class="mt-4 border rounded-md overflow-hidden">
      <template v-for="(tab, index) in tabs" :key="tab.value" >
        <Item class="hover:bg-accent rounded-none cursor-pointer" @click="navigate(tab.value)">
          <ItemMedia variant="icon" class="size-11 rounded-full my-auto">
            <Icon :name="tab.icon" :size="19"/>
          </ItemMedia>
          <ItemContent>
            <ItemTitle class="text-base font-medium">
              {{ tab.label }}
            </ItemTitle>
            <ItemDescription>{{ tab.description }}</ItemDescription>
          </ItemContent>
        </Item>
        <ItemSeparator v-if="index !== tabs.length - 1" />
      </template>
    </ItemGroup>
  </div>
</template>