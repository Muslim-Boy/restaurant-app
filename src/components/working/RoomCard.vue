<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrdersStore } from '../../stores/orders'
import type { Room } from '../../types'

const props = defineProps<{
  room: Room
}>()

const emit = defineEmits<{
  addProducts: [roomId: number]
  showBill: [roomId: number]
}>()

const { t } = useI18n()
const ordersStore = useOrdersStore()

const isOccupied = computed(() => ordersStore.isRoomOccupied(props.room.id))
const order = computed(() => ordersStore.getOrder(props.room.id))
const total = computed(() => ordersStore.getOrderTotal(props.room.id))
const itemCount = computed(() => ordersStore.getOrderItemCount(props.room.id))

const startTimeFormatted = computed(() => {
  if (!order.value) return ''
  const d = new Date(order.value.startTime)
  return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
})

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}
</script>

<template>
  <!-- Occupied Card -->
  <div
    v-if="isOccupied"
    class="group bg-white p-5 rounded-2xl ring-2 ring-primary shadow-xl shadow-blue-500/5 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
  >
    <!-- Band badge -->
    <div class="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl tracking-widest uppercase">
      {{ t('working.occupied') }}
    </div>

    <!-- Header -->
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-2xl font-black text-on-surface">{{ room.name }}</h3>
      </div>
      <span class="material-symbols-outlined text-primary-fixed-dim text-3xl">restaurant</span>
    </div>

    <!-- Info -->
    <div class="space-y-3 pt-2">
      <div class="flex items-center justify-between text-sm">
        <span class="text-outline flex items-center gap-2">
          <span class="material-symbols-outlined text-lg">schedule</span>
          {{ t('common.time') }}:
        </span>
        <span class="font-bold text-on-surface">{{ startTimeFormatted }}</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-outline flex items-center gap-2">
          <span class="material-symbols-outlined text-lg">flatware</span>
          {{ t('working.products') }}:
        </span>
        <span class="font-bold text-on-surface">{{ itemCount }} ta</span>
      </div>
      <div class="mt-4 pt-4 border-t border-surface-container flex items-center justify-between">
        <span class="text-xs font-black text-outline uppercase tracking-wider">{{ t('common.total') }}</span>
        <span class="text-lg font-black text-primary">{{ formatPrice(total) }} {{ t('common.currency') }}</span>
      </div>
    </div>

    <!-- Hover overlay -->
    <div class="absolute inset-0 bg-primary/90 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <button
        class="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
        @click="emit('addProducts', room.id)"
      >
        <span class="material-symbols-outlined text-2xl">add_shopping_cart</span>
        <span class="text-[10px] font-bold uppercase tracking-wider">{{ t('working.addProduct') }}</span>
      </button>
      <button
        class="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
        @click="emit('showBill', room.id)"
      >
        <span class="material-symbols-outlined text-2xl">receipt_long</span>
        <span class="text-[10px] font-bold uppercase tracking-wider">{{ t('working.bill') }}</span>
      </button>
    </div>
  </div>

  <!-- Free Card -->
  <div
    v-else
    class="group bg-surface-container/50 p-5 rounded-2xl ring-1 ring-outline-variant/30 shadow-sm transition-all duration-300 hover:bg-white hover:ring-outline-variant hover:shadow-card"
  >
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-2xl font-black text-outline/50">{{ room.name }}</h3>
        <p class="text-xs font-semibold text-outline/40">{{ t('working.free') }}</p>
      </div>
      <span class="material-symbols-outlined text-outline/20 text-3xl">deck</span>
    </div>
    <div class="flex flex-col items-center justify-center py-6 opacity-30">
      <span class="material-symbols-outlined text-5xl">event_available</span>
    </div>
    <div class="mt-4 pt-4 border-t border-outline-variant/20 flex items-center justify-center">
      <button
        class="text-xs font-bold text-outline/50 uppercase tracking-widest group-hover:text-primary transition-colors"
        @click="emit('addProducts', room.id)"
      >
        {{ t('working.newOrder') }}
      </button>
    </div>
  </div>
</template>
