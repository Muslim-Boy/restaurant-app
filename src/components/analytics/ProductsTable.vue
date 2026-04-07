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
  <div class="bg-white rounded-2xl shadow-card-border overflow-hidden">
    <div class="px-6 py-4 border-b border-border">
      <h3 class="text-sm font-semibold text-on-surface flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[20px]">restaurant_menu</span>
        {{ t('analytics.byProducts') }}
      </h3>
    </div>
    <div v-if="data.length === 0" class="p-6 text-center text-muted text-sm">
      {{ t('common.noData') }}
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-tab-bg">
            <td class="px-6 py-3 label-md">{{ t('analytics.productName') }}</td>
            <td class="px-6 py-3 text-right label-md">{{ t('analytics.soldCount') }}</td>
            <td class="px-6 py-3 text-right label-md">{{ t('common.sum') }}</td>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in data"
            :key="i"
            class="border-t border-border hover:bg-outline-variant/10 transition-colors"
          >
            <td class="px-6 py-4 font-medium text-on-surface">{{ row.name }}</td>
            <td class="px-6 py-4 text-right text-outline">{{ row.sold }}</td>
            <td class="px-6 py-4 text-right font-semibold text-[#2563EB]">{{ formatPrice(row.total) }} UZS</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
