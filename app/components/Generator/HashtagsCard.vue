<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const hashtags = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <Card class="p-6 shadow-none rounded-md">
    <div class="flex items-center gap-3">
      <Icon name="lucide:hash" class="w-5 h-5 text-primary" />
      <h2 class="text-lg font-semibold">3. Hashtags</h2>
    </div>
    <Input v-model="hashtags" placeholder="#FursuitFriday #Kemono" />
  </Card>
</template>