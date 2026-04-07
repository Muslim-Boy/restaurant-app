<script setup lang="ts">
defineProps<{
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  dot?: boolean
}>()

const variantClasses: Record<string, string> = {
  success: 'bg-success-container text-green-700',
  warning: 'bg-warning-container text-warning',
  error: 'bg-error-container text-error',
  info: 'bg-primary-fixed text-primary',
  neutral: 'bg-surface-container-high text-outline',
}

const dotClasses: Record<string, string> = {
  success: 'bg-green-500',
  warning: 'bg-orange-500',
  error: 'bg-red-500',
  info: 'bg-primary',
  neutral: 'bg-outline',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="variantClasses[variant || 'neutral']"
  >
    <span
      v-if="dot"
      class="w-1.5 h-1.5 rounded-full"
      :class="dotClasses[variant || 'neutral']"
    ></span>
    <slot />
  </span>
</template>
