<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHistoryStore } from '../stores/history'
import SummaryCards from '../components/analytics/SummaryCards.vue'
import ProductsTable from '../components/analytics/ProductsTable.vue'
import RoomsTable from '../components/analytics/RoomsTable.vue'
import FinesTable from '../components/analytics/FinesTable.vue'
import RevenueChart from '../components/analytics/RevenueChart.vue'

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

const filteredFines = computed(() => {
  return historyStore.fines.filter((f) => {
    return f.date >= startDate.value && f.date <= endDate.value
  })
})

// KPI
const totalRevenue = computed(() =>
  filteredHistory.value.reduce((s, e) => s + e.grandTotal, 0),
)

const productsSold = computed(() =>
  filteredHistory.value.reduce((s, e) => s + e.items.reduce((si, i) => si + i.quantity, 0), 0),
)

const averageBill = computed(() => {
  if (filteredHistory.value.length === 0) return 0
  return Math.round(totalRevenue.value / filteredHistory.value.length)
})

const totalFines = computed(() =>
  filteredFines.value.reduce((s, f) => s + f.amount, 0),
)

// Products table data
const productsData = computed(() => {
  const map = new Map<string, { name: string; sold: number; total: number }>()
  for (const entry of filteredHistory.value) {
    for (const item of entry.items) {
      const existing = map.get(item.name)
      if (existing) {
        existing.sold += item.quantity
        existing.total += item.total
      } else {
        map.set(item.name, { name: item.name, sold: item.quantity, total: item.total })
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
})

// Rooms table data
const roomsData = computed(() => {
  const map = new Map<string, { name: string; productCount: number; total: number; occupiedMinutes: number }>()
  for (const entry of filteredHistory.value) {
    const existing = map.get(entry.roomName)
    const itemCount = entry.items.reduce((s, i) => s + i.quantity, 0)
    const estimatedMinutes = Math.max(30, itemCount * 10)

    if (existing) {
      existing.productCount += itemCount
      existing.total += entry.grandTotal
      existing.occupiedMinutes += estimatedMinutes
    } else {
      map.set(entry.roomName, {
        name: entry.roomName,
        productCount: itemCount,
        total: entry.grandTotal,
        occupiedMinutes: estimatedMinutes,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
})

// Revenue chart data (daily)
const revenueData = computed(() => {
  const map = new Map<string, number>()
  for (const entry of filteredHistory.value) {
    const d = entry.closedAt.split('T')[0]!
    map.set(d, (map.get(d) ?? 0) + entry.grandTotal)
  }
  return Array.from(map.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date))
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Date Filter -->
    <div class="flex flex-wrap items-end gap-4">
      <div>
        <label class="label-md mb-1 block">{{ t('analytics.startDate') }}</label>
        <input v-model="startDate" type="date" class="input-field w-44" />
      </div>
      <div>
        <label class="label-md mb-1 block">{{ t('analytics.endDate') }}</label>
        <input v-model="endDate" type="date" class="input-field w-44" />
      </div>
    </div>

    <!-- KPI Cards -->
    <SummaryCards
      :total-revenue="totalRevenue"
      :products-sold="productsSold"
      :average-bill="averageBill"
      :total-fines="totalFines"
    />

    <!-- Revenue Chart -->
    <RevenueChart :data="revenueData" />

    <!-- Tables Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProductsTable :data="productsData" />
      <RoomsTable :data="roomsData" />
    </div>

    <!-- Fines -->
    <FinesTable :data="filteredFines" />
  </div>
</template>
