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
  { key: 'totalRevenue', icon: 'payments', iconBg: 'bg-[#DBEAFE]', iconColor: 'text-[#2563EB]' },
  { key: 'productsSold', icon: 'inventory_2', iconBg: 'bg-[#FFEDD5]', iconColor: 'text-[#EA580C]' },
  { key: 'averageBill', icon: 'receipt_long', iconBg: 'bg-[#DCFCE7]', iconColor: 'text-[#059669]' },
  { key: 'totalFines', icon: 'gavel', iconBg: 'bg-[#FEF2F2]', iconColor: 'text-[#DC2626]' },
] as const
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="card in cards"
      :key="card.key"
      class="bg-white rounded-2xl p-6 shadow-card"
    >
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="[card.iconBg, card.iconColor]">
          <span class="material-symbols-outlined">{{ card.icon }}</span>
        </div>
        <span class="text-xs text-muted font-medium">{{ t(`analytics.${card.key}`) }}</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-black text-on-surface">
          {{ card.key === 'productsSold' ? $props[card.key] : formatPrice($props[card.key]) }}
        </span>
        <span v-if="card.key !== 'productsSold'" class="text-xs font-bold text-muted">UZS</span>
        <span v-else class="text-xs font-bold text-muted">ta</span>
      </div>
    </div>
  </div>
</template>
