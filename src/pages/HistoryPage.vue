<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHistoryStore } from '../stores/history'
import HistorySummary from '../components/history/HistorySummary.vue'
import HistoryOrdersList from '../components/history/HistoryOrdersList.vue'

const { t } = useI18n()
const historyStore = useHistoryStore()

// Date filter
const today = new Date().toISOString().split('T')[0]!
const startDate = ref(today)
const endDate = ref(today)

// Filtered history
const filteredHistory = computed(() => {
  return historyStore.history.filter((entry) => {
    const d = entry.closedAt.split('T')[0]!
    return d >= startDate.value && d <= endDate.value
  })
})

// KPI
const totalOrders = computed(() => filteredHistory.value.length)
const totalRevenue = computed(() =>
  filteredHistory.value.reduce((s, e) => s + e.grandTotal, 0),
)
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl sm:text-[30px] font-extrabold leading-9 tracking-tight text-on-surface">
        {{ t('history.title') }}
      </h1>
      <p class="text-sm text-outline mt-1">{{ t('history.subtitle') }}</p>
    </div>

    <!-- Date Filter -->
    <div class="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
      <div class="flex-1 sm:flex-none">
        <label class="label-md mb-1.5 block">{{ t('analytics.startDate') }}</label>
        <input
          v-model="startDate"
          type="date"
          class="bg-white rounded-xl border border-border px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 w-full sm:w-48"
        />
      </div>
      <div class="flex-1 sm:flex-none">
        <label class="label-md mb-1.5 block">{{ t('analytics.endDate') }}</label>
        <input
          v-model="endDate"
          type="date"
          class="bg-white rounded-xl border border-border px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 w-full sm:w-48"
        />
      </div>
    </div>

    <!-- Summary Cards -->
    <HistorySummary :total-orders="totalOrders" :total-revenue="totalRevenue" />

    <!-- Orders List -->
    <HistoryOrdersList :entries="filteredHistory" />
  </div>
</template>
