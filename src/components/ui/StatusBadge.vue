<script setup lang="ts">
defineProps<{
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
}>()

const variantClasses: Record<string, string> = {
  success: 'bg-success-container text-success',
  warning: 'bg-tertiary-container text-tertiary',
  error: 'bg-error-container text-error',
  info: 'bg-primary-fixed text-primary',
  neutral: 'bg-surface-container-high text-outline',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
    :class="variantClasses[variant || 'neutral']"
  >
    <slot />
  </span>
</template>
