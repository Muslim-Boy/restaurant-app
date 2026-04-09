<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const { t } = useI18n()
const route = useRoute()

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/settings': 'settings.title',
    '/working': 'working.title',
    '/analytics': 'analytics.title',
    '/history': 'history.title',
  }
  return t(map[route.path] || 'app.name')
})

const emit = defineEmits<{
  toggleSidebar: []
}>()
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-xl border-b border-outline-variant/30"
  >
    <div class="flex items-center gap-3">
      <!-- Mobile menu button -->
      <button
        class="md:hidden p-2 rounded-lg hover:bg-surface-container transition-colors"
        @click="emit('toggleSidebar')"
      >
        <span class="material-symbols-outlined">menu</span>
      </button>
      <h1 class="text-lg font-bold text-on-surface">{{ pageTitle }}</h1>
    </div>

    <div class="flex items-center gap-2">
      <slot />
    </div>
  </header>
</template>
