<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import RoomsTab from '../components/settings/RoomsTab.vue'
import ProductsTab from '../components/settings/ProductsTab.vue'
import EmployeesTab from '../components/settings/EmployeesTab.vue'

const { t } = useI18n()

const activeTab = ref<'rooms' | 'products' | 'employees'>('rooms')

const tabs = [
  { key: 'rooms' as const, icon: 'meeting_room', label: 'settings.tabs.rooms' },
  { key: 'products' as const, icon: 'restaurant_menu', label: 'settings.tabs.products' },
  { key: 'employees' as const, icon: 'badge', label: 'settings.tabs.employees' },
]
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Tabs -->
    <div class="flex gap-2 bg-surface-container rounded-xl p-1.5">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
        :class="
          activeTab === tab.key
            ? 'bg-white text-primary shadow-card font-semibold'
            : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
        "
        @click="activeTab = tab.key"
      >
        <span class="material-symbols-outlined text-[20px]">{{ tab.icon }}</span>
        {{ t(tab.label) }}
      </button>
    </div>

    <!-- Tab Content -->
    <KeepAlive>
      <RoomsTab v-if="activeTab === 'rooms'" />
      <ProductsTab v-else-if="activeTab === 'products'" />
      <EmployeesTab v-else />
    </KeepAlive>
  </div>
</template>
