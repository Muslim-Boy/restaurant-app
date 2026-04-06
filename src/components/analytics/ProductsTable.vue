<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  data: { name: string; sold: number; total: number }[]
}>()

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-card overflow-hidden">
    <div class="px-5 py-4 border-b border-surface-container">
      <h3 class="text-sm font-semibold text-on-surface flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[20px]">restaurant_menu</span>
        {{ t('analytics.byProducts') }}
      </h3>
    </div>
    <div v-if="data.length === 0" class="p-6 text-center text-outline text-sm">
      {{ t('common.noData') }}
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-container">
            <th class="px-5 py-3 text-left label-md">{{ t('analytics.productName') }}</th>
            <th class="px-5 py-3 text-right label-md">{{ t('analytics.soldCount') }}</th>
            <th class="px-5 py-3 text-right label-md">{{ t('common.sum') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-container">
          <tr v-for="(row, i) in data" :key="i" class="hover:bg-surface-container/30 transition-colors">
            <td class="px-5 py-3 font-medium text-on-surface">{{ row.name }}</td>
            <td class="px-5 py-3 text-right text-on-surface">{{ row.sold }}</td>
            <td class="px-5 py-3 text-right font-semibold text-primary">{{ formatPrice(row.total) }} UZS</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
