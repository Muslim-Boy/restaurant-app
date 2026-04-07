<script setup lang="ts">
defineProps<{
  hoverable?: boolean
  padding?: string
}>()
</script>

<template>
  <div
    class="rounded-2xl bg-white shadow-card-border transition-all duration-200"
    :class="[
      hoverable ? 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : '',
      padding || 'p-4',
    ]"
  >
    <slot />
  </div>
</template>
