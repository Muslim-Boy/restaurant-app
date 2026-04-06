<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  data: { name: string; productCount: number; total: number; occupiedMinutes: number }[]
}>()

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return `${h}h ${m}m`
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-card overflow-hidden">
    <div class="px-5 py-4 border-b border-surface-container">
      <h3 class="text-sm font-semibold text-on-surface flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[20px]">meeting_room</span>
        {{ t('analytics.byRooms') }}
      </h3>
    </div>
    <div v-if="data.length === 0" class="p-6 text-center text-outline text-sm">
      {{ t('common.noData') }}
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-container">
            <th class="px-5 py-3 text-left label-md">{{ t('analytics.roomName') }}</th>
            <th class="px-5 py-3 text-right label-md">{{ t('analytics.productCount') }}</th>
            <th class="px-5 py-3 text-right label-md">{{ t('common.sum') }}</th>
            <th class="px-5 py-3 text-right label-md">{{ t('analytics.occupiedTime') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-container">
          <tr v-for="(row, i) in data" :key="i" class="hover:bg-surface-container/30 transition-colors">
            <td class="px-5 py-3 font-medium text-on-surface">{{ row.name }}</td>
            <td class="px-5 py-3 text-right text-on-surface">{{ row.productCount }}</td>
            <td class="px-5 py-3 text-right font-semibold text-primary">{{ formatPrice(row.total) }} UZS</td>
            <td class="px-5 py-3 text-right text-outline">{{ formatDuration(row.occupiedMinutes) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
