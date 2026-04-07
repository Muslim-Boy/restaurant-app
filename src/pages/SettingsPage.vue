<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import RoomsTab from '../components/settings/RoomsTab.vue'
import ProductsTab from '../components/settings/ProductsTab.vue'
import EmployeesTab from '../components/settings/EmployeesTab.vue'

const { t } = useI18n()

const activeTab = ref<'rooms' | 'products' | 'employees'>('rooms')

const tabs = [
  { key: 'rooms' as const, label: () => t('settings.tabs.rooms') },
  { key: 'products' as const, label: () => t('settings.tabs.products') },
  { key: 'employees' as const, label: () => t('settings.tabs.employees') },
]
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Page Header & Tabs -->
    <div class="space-y-6 mb-8">
      <!-- Header -->
      <div>
        <h1 class="text-2xl sm:text-[30px] font-extrabold leading-9 tracking-tight text-on-surface">
          {{ t('settings.title') }}
        </h1>
        <p class="text-sm text-outline mt-1">
          {{ t('settings.subtitle') }}
        </p>
      </div>

      <!-- Tab Bar -->
      <div class="inline-flex items-center bg-tab-bg rounded-2xl p-1 gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          :class="
            activeTab === tab.key
              ? 'bg-white shadow-tab text-primary font-semibold'
              : 'text-outline hover:text-on-surface'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label() }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <RoomsTab v-if="activeTab === 'rooms'" />
    <ProductsTab v-else-if="activeTab === 'products'" />
    <EmployeesTab v-else-if="activeTab === 'employees'" />
  </div>
</template>
