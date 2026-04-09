<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  totalOrders: number
  totalRevenue: number
}>()

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div class="bg-white rounded-2xl p-6 shadow-card">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[#DBEAFE] text-[#2563EB]">
          <span class="material-symbols-outlined">receipt_long</span>
        </div>
        <span class="text-xs text-muted font-medium">{{ t('history.totalOrders') }}</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-black text-on-surface">{{ totalOrders }}</span>
        <span class="text-xs font-bold text-muted">ta</span>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-card">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[#DCFCE7] text-[#059669]">
          <span class="material-symbols-outlined">payments</span>
        </div>
        <span class="text-xs text-muted font-medium">{{ t('history.totalRevenue') }}</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-black text-on-surface">{{ formatPrice(totalRevenue) }}</span>
        <span class="text-xs font-bold text-muted">UZS</span>
      </div>
    </div>
  </div>
</template>
