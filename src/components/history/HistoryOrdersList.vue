<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HistoryEntry } from '../../types'

const { t } = useI18n()

const props = defineProps<{
  entries: HistoryEntry[]
}>()

const expandedIds = ref<Set<number>>(new Set())

function toggleExpand(id: number) {
  const next = new Set(expandedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedIds.value = next
}

const sortedEntries = computed(() =>
  [...props.entries].sort((a, b) => b.closedAt.localeCompare(a.closedAt)),
)

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('uz-UZ') +
    ' ' +
    d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  )
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card-border overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-border">
      <h3 class="text-sm font-semibold text-on-surface flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[20px]">history</span>
        {{ t('history.title') }}
      </h3>
    </div>

    <!-- Empty state -->
    <div v-if="entries.length === 0" class="p-12 text-center">
      <span class="material-symbols-outlined text-outline/40 text-[48px] mb-3">receipt_long</span>
      <p class="text-sm text-muted">{{ t('history.noHistory') }}</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-tab-bg">
            <td class="px-4 py-3 w-10"></td>
            <td class="px-4 py-3 label-md">{{ t('history.orderId') }}</td>
            <td class="px-4 py-3 label-md">{{ t('history.roomName') }}</td>
            <td class="px-4 py-3 label-md">{{ t('history.closedAt') }}</td>
            <td class="px-4 py-3 text-right label-md">{{ t('history.itemsCount') }}</td>
            <td class="px-4 py-3 text-right label-md">{{ t('history.grandTotal') }}</td>
          </tr>
        </thead>
        <tbody>
          <template v-for="entry in sortedEntries" :key="entry.id">
            <!-- Summary row -->
            <tr
              class="border-t border-border hover:bg-outline-variant/10 transition-colors cursor-pointer"
              @click="toggleExpand(entry.id)"
            >
              <td class="px-4 py-4">
                <span
                  class="material-symbols-outlined text-outline text-[18px] transition-transform duration-200"
                  :class="{ 'rotate-90': expandedIds.has(entry.id) }"
                >
                  chevron_right
                </span>
              </td>
              <td class="px-4 py-4 font-medium text-on-surface">#{{ entry.id }}</td>
              <td class="px-4 py-4 text-on-surface">{{ entry.roomName }}</td>
              <td class="px-4 py-4 text-outline">{{ formatDateTime(entry.closedAt) }}</td>
              <td class="px-4 py-4 text-right text-outline">
                {{ entry.items.reduce((s, i) => s + i.quantity, 0) }}
              </td>
              <td class="px-4 py-4 text-right font-semibold text-[#2563EB]">
                {{ formatPrice(entry.grandTotal) }}
                <span class="text-xs text-muted font-normal">UZS</span>
              </td>
            </tr>

            <!-- Expanded detail -->
            <tr v-if="expandedIds.has(entry.id)">
              <td colspan="6" class="px-6 py-5 bg-surface-container/30 border-t border-border/50">
                <div class="space-y-4">
                  <!-- Items table -->
                  <div>
                    <h4 class="text-xs font-semibold text-outline uppercase tracking-wider mb-2">
                      {{ t('history.orderDetails') }}
                    </h4>
                    <div class="bg-white rounded-xl border border-border overflow-hidden">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="bg-tab-bg">
                            <td class="px-4 py-2 label-md">{{ t('common.name') }}</td>
                            <td class="px-4 py-2 text-right label-md">{{ t('common.quantity') }}</td>
                            <td class="px-4 py-2 text-right label-md">{{ t('common.price') }}</td>
                            <td class="px-4 py-2 text-right label-md">{{ t('common.sum') }}</td>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="item in entry.items"
                            :key="item.productId"
                            class="border-t border-border/50"
                          >
                            <td class="px-4 py-2 text-on-surface">{{ item.name }}</td>
                            <td class="px-4 py-2 text-right text-outline">{{ item.quantity }}</td>
                            <td class="px-4 py-2 text-right text-outline">
                              {{ formatPrice(item.price) }}
                            </td>
                            <td class="px-4 py-2 text-right font-medium text-on-surface">
                              {{ formatPrice(item.total) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Charges breakdown -->
                  <div class="flex justify-end">
                    <div class="w-full sm:w-64 space-y-1 text-sm">
                      <div class="flex justify-between text-outline">
                        <span>{{ t('history.subtotal') }}</span>
                        <span>{{ formatPrice(entry.subtotal) }}</span>
                      </div>
                      <div v-if="entry.serviceCharge > 0" class="flex justify-between text-outline">
                        <span>{{ t('history.serviceCharge') }}</span>
                        <span>{{ formatPrice(entry.serviceCharge) }}</span>
                      </div>
                      <div v-if="entry.roomCharge > 0" class="flex justify-between text-outline">
                        <span>{{ t('history.roomCharge') }}</span>
                        <span>{{ formatPrice(entry.roomCharge) }}</span>
                      </div>
                      <div
                        class="flex justify-between font-bold text-on-surface pt-1 border-t border-border"
                      >
                        <span>{{ t('history.grandTotal') }}</span>
                        <span class="text-[#2563EB]">{{ formatPrice(entry.grandTotal) }} UZS</span>
                      </div>
                    </div>
                  </div>

                  <!-- Removed items -->
                  <div v-if="entry.removedItems.length > 0">
                    <h4
                      class="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1"
                    >
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                      {{ t('history.removedItems') }}
                    </h4>
                    <div class="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="bg-red-100/50">
                            <td class="px-4 py-2 label-md text-red-700">{{ t('common.name') }}</td>
                            <td class="px-4 py-2 label-md text-red-700">
                              {{ t('history.reason') }}
                            </td>
                            <td class="px-4 py-2 text-right label-md text-red-700">
                              {{ t('history.fine') }}
                            </td>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(rm, idx) in entry.removedItems"
                            :key="idx"
                            class="border-t border-red-100"
                          >
                            <td class="px-4 py-2 text-on-surface">
                              {{ rm.name }}
                              <span class="text-outline">(x{{ rm.quantity }})</span>
                            </td>
                            <td class="px-4 py-2 text-outline">
                              {{ t('working.reasons.' + rm.reason) }}
                            </td>
                            <td class="px-4 py-2 text-right font-medium text-red-600">
                              {{ rm.fine > 0 ? formatPrice(rm.fine) + ' UZS' : '---' }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
