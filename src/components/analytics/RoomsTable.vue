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
  <div class="bg-white rounded-2xl shadow-card-border overflow-hidden">
    <div class="px-6 py-4 border-b border-border">
      <h3 class="text-sm font-semibold text-on-surface flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[20px]">meeting_room</span>
        {{ t('analytics.byRooms') }}
      </h3>
    </div>
    <div v-if="data.length === 0" class="p-6 text-center text-muted text-sm">
      {{ t('common.noData') }}
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-tab-bg">
            <td class="px-6 py-3 label-md">{{ t('analytics.roomName') }}</td>
            <td class="px-6 py-3 text-right label-md">{{ t('analytics.productCount') }}</td>
            <td class="px-6 py-3 text-right label-md">{{ t('common.sum') }}</td>
            <td class="px-6 py-3 text-right label-md">{{ t('analytics.occupiedTime') }}</td>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in data"
            :key="i"
            class="border-t border-border hover:bg-outline-variant/10 transition-colors"
          >
            <td class="px-6 py-4 font-medium text-on-surface">{{ row.name }}</td>
            <td class="px-6 py-4 text-right text-outline">{{ row.productCount }}</td>
            <td class="px-6 py-4 text-right font-semibold text-[#2563EB]">{{ formatPrice(row.total) }} UZS</td>
            <td class="px-6 py-4 text-right text-muted">{{ formatDuration(row.occupiedMinutes) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
