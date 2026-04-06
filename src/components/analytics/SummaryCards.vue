<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  totalRevenue: number
  productsSold: number
  averageBill: number
  totalFines: number
}>()

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}

const cards = [
  { key: 'totalRevenue', icon: 'payments', color: 'bg-primary/10 text-primary' },
  { key: 'productsSold', icon: 'inventory_2', color: 'bg-tertiary/10 text-tertiary' },
  { key: 'averageBill', icon: 'receipt_long', color: 'bg-success/10 text-success' },
  { key: 'totalFines', icon: 'gavel', color: 'bg-error/10 text-error' },
] as const
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="card in cards"
      :key="card.key"
      class="bg-white rounded-xl p-5 shadow-card"
    >
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="card.color">
          <span class="material-symbols-outlined">{{ card.icon }}</span>
        </div>
        <span class="text-sm text-outline font-medium">{{ t(`analytics.${card.key}`) }}</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-black text-on-surface">
          {{ card.key === 'productsSold' ? $props[card.key] : formatPrice($props[card.key]) }}
        </span>
        <span v-if="card.key !== 'productsSold'" class="text-xs font-bold text-outline">UZS</span>
        <span v-else class="text-xs font-bold text-outline">ta</span>
      </div>
    </div>
  </div>
</template>
