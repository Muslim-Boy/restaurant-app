<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Fine } from '../../types'

const { t } = useI18n()

defineProps<{
  data: Fine[]
}>()

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card-border overflow-hidden">
    <div class="px-6 py-4 border-b border-border">
      <h3 class="text-sm font-semibold text-on-surface flex items-center gap-2">
        <span class="material-symbols-outlined text-error text-[20px]">gavel</span>
        {{ t('analytics.fines') }}
      </h3>
    </div>
    <div v-if="data.length === 0" class="p-6 text-center text-muted text-sm">
      {{ t('common.noData') }}
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-tab-bg">
            <td class="px-6 py-3 label-md">{{ t('analytics.employee') }}</td>
            <td class="px-6 py-3 label-md">{{ t('analytics.reason') }}</td>
            <td class="px-6 py-3 text-right label-md">{{ t('analytics.amount') }}</td>
            <td class="px-6 py-3 text-right label-md">{{ t('common.date') }}</td>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="fine in data"
            :key="fine.id"
            class="border-t border-border hover:bg-outline-variant/10 transition-colors"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-primary-fixed text-primary text-[10px] font-bold flex items-center justify-center">
                  {{ fine.employeeId }}
                </span>
                <span class="font-medium text-on-surface">{{ fine.employeeName }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-outline">{{ fine.reason }}</td>
            <td class="px-6 py-4 text-right font-semibold text-error">{{ formatPrice(fine.amount) }} UZS</td>
            <td class="px-6 py-4 text-right text-muted">{{ fine.date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
