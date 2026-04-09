<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

const navItems = [
  { to: '/working', icon: 'layers', label: 'nav.working' },
  { to: '/settings', icon: 'settings', label: 'nav.settings' },
  { to: '/history', icon: 'history', label: 'nav.history' },
  { to: '/analytics', icon: 'analytics', label: 'nav.analytics' },
]
</script>

<template>
  <aside
    class="h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50/80 backdrop-blur-xl flex flex-col py-6 shadow-[4px_0_24px_rgba(0,74,198,0.04)] hidden md:flex"
  >
    <!-- Logo -->
    <div class="px-6 mb-8">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white font-black text-lg"
        >
          R
        </div>
        <div>
          <h2 class="text-lg font-black text-primary leading-none">
            {{ t('app.name') }}
          </h2>
          <span class="text-[10px] uppercase tracking-widest text-outline font-bold">
            Management
          </span>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 px-3">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="relative flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 active:scale-95"
        :class="
          route.path === item.to
            ? 'text-primary font-semibold bg-primary-fixed/50 before:absolute before:left-0 before:w-1 before:h-6 before:bg-primary before:rounded-full'
            : 'text-outline hover:bg-surface-container-high hover:text-on-surface'
        "
      >
        <span class="material-symbols-outlined" :class="{ filled: route.path === item.to }">
          {{ item.icon }}
        </span>
        <span class="text-sm tracking-wide">{{ t(item.label) }}</span>
      </RouterLink>
    </nav>

    <!-- Language Switch slot -->
    <div class="px-3 mt-auto">
      <slot name="footer" />
    </div>
  </aside>
</template>
