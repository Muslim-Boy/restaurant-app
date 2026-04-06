<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'
import LanguageSwitch from './components/layout/LanguageSwitch.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-surface">
    <!-- Sidebar -->
    <AppSidebar>
      <template #footer>
        <LanguageSwitch />
      </template>
    </AppSidebar>

    <!-- Mobile sidebar overlay -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Mobile sidebar -->
    <Transition name="slide">
      <aside
        v-if="sidebarOpen"
        class="fixed left-0 top-0 z-40 h-screen w-64 bg-white shadow-2xl flex flex-col py-6 md:hidden"
      >
        <div class="px-6 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white font-black text-lg"
              >
                R
              </div>
              <h2 class="text-lg font-black text-primary leading-none">Restaurant Pro</h2>
            </div>
            <button
              class="p-1 rounded-lg hover:bg-surface-container"
              @click="sidebarOpen = false"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <nav class="flex-1 space-y-1 px-3">
          <RouterLink
            v-for="item in [
              { to: '/working', icon: 'layers', label: $t('nav.working') },
              { to: '/settings', icon: 'settings', label: $t('nav.settings') },
              { to: '/analytics', icon: 'analytics', label: $t('nav.analytics') },
            ]"
            :key="item.to"
            :to="item.to"
            class="relative flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200"
            :class="
              $route.path === item.to
                ? 'text-primary font-semibold bg-primary-fixed/50'
                : 'text-outline hover:bg-surface-container-high hover:text-on-surface'
            "
            @click="sidebarOpen = false"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span class="text-sm tracking-wide">{{ item.label }}</span>
          </RouterLink>
        </nav>
        <div class="px-3">
          <LanguageSwitch />
        </div>
      </aside>
    </Transition>

    <!-- Main content -->
    <div class="flex-1 flex flex-col md:ml-64 overflow-hidden">
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
