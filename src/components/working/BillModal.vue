<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoomsStore } from '../../stores/rooms'
import { useProductsStore } from '../../stores/products'
import { useOrdersStore } from '../../stores/orders'
import { useHistoryStore } from '../../stores/history'
import type { HistoryItem } from '../../types'

const props = defineProps<{
  show: boolean
  roomId: number | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const roomsStore = useRoomsStore()
const productsStore = useProductsStore()
const ordersStore = useOrdersStore()
const historyStore = useHistoryStore()

const room = computed(() => {
  if (!props.roomId) return null
  return roomsStore.rooms.find((r) => r.id === props.roomId)
})

const order = computed(() => {
  if (!props.roomId) return null
  return ordersStore.getOrder(props.roomId)
})

const items = computed<(HistoryItem & { image: string | null })[]>(() => {
  if (!order.value) return []
  return order.value.items.map((i) => {
    const product = productsStore.products.find((p) => p.id === i.productId)
    return {
      productId: i.productId,
      name: product?.name ?? '—',
      quantity: i.quantity,
      price: i.priceAtOrder,
      total: i.priceAtOrder * i.quantity,
      image: product?.image ?? null,
    }
  })
})

const subtotal = computed(() => items.value.reduce((s, i) => s + i.total, 0))

const serviceCharge = computed(() => {
  if (room.value?.noServiceCharge) return 0
  return Math.round(subtotal.value * roomsStore.globalServicePercent / 100)
})

const roomCharge = computed(() => room.value?.extraCharge ?? 0)

const grandTotal = computed(() => subtotal.value + serviceCharge.value + roomCharge.value)

const startTimeFormatted = computed(() => {
  if (!order.value) return ''
  return new Date(order.value.startTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
})

function pay() {
  if (!props.roomId || !room.value || !order.value) return

  historyStore.addEntry({
    roomId: props.roomId,
    roomName: room.value.name,
    closedAt: new Date().toISOString(),
    items: items.value.map(({ image, ...rest }) => rest),
    subtotal: subtotal.value,
    serviceCharge: serviceCharge.value,
    roomCharge: roomCharge.value,
    grandTotal: grandTotal.value,
    removedItems: [],
  })

  ordersStore.clearOrder(props.roomId)
  emit('close')
}

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="bill">
      <div
        v-if="show && roomId"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-[rgba(15,23,42,0.4)] backdrop-blur-sm" @click="emit('close')" />

        <!-- Modal -->
        <div class="relative bg-white w-full max-w-2xl rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-on-surface">{{ t('working.closeBill') }}</h2>
              <p class="text-sm text-outline mt-0.5">
                {{ room?.name }} · {{ startTimeFormatted }}
              </p>
            </div>
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-tab-bg transition-colors" @click="emit('close')">
              <span class="material-symbols-outlined text-[#737686]">close</span>
            </button>
          </div>

          <!-- Body: Bento Grid -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-0">
            <!-- Left: Items List -->
            <div class="md:col-span-7 p-6 max-h-[50vh] overflow-y-auto">
              <div class="label-md mb-3">{{ t('working.orderItems') }}</div>
              <div class="space-y-2">
                <div
                  v-for="item in items"
                  :key="item.productId"
                  class="flex items-center gap-3 p-3 rounded-xl bg-tab-bg/50"
                >
                  <div class="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                    <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-sm text-outline/30">restaurant</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="text-sm font-medium text-on-surface truncate block">{{ item.name }}</span>
                    <span class="text-xs text-muted">{{ item.quantity }} × {{ formatPrice(item.price) }}</span>
                  </div>
                  <span class="text-sm font-bold text-on-surface shrink-0">{{ formatPrice(item.total) }}</span>
                </div>
              </div>

              <!-- Service badge -->
              <div v-if="!room?.noServiceCharge && roomsStore.globalServicePercent > 0" class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-xs font-semibold">
                <span class="material-symbols-outlined text-[14px]">percent</span>
                {{ t('working.serviceCharge') }}: {{ roomsStore.globalServicePercent }}%
              </div>
            </div>

            <!-- Right: Total Card -->
            <div class="md:col-span-5 p-6 bg-tab-bg/50 flex flex-col justify-between border-l border-border">
              <!-- Breakdown -->
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-outline">{{ t('common.total') }}</span>
                  <span class="font-semibold text-on-surface">{{ formatPrice(subtotal) }} UZS</span>
                </div>
                <div v-if="serviceCharge > 0" class="flex justify-between text-sm">
                  <span class="text-outline">{{ t('working.serviceCharge') }}</span>
                  <span class="font-semibold text-on-surface">+{{ formatPrice(serviceCharge) }} UZS</span>
                </div>
                <div v-if="roomCharge > 0" class="flex justify-between text-sm">
                  <span class="text-outline">{{ t('working.roomCharge') }}</span>
                  <span class="font-semibold text-on-surface">+{{ formatPrice(roomCharge) }} UZS</span>
                </div>
                <div class="border-t border-outline-variant/30 pt-3">
                  <div class="flex justify-between items-baseline">
                    <span class="text-[10px] font-bold text-outline uppercase tracking-wider">{{ t('working.grandTotal') }}</span>
                  </div>
                  <div class="mt-1 flex items-baseline gap-2">
                    <span class="text-3xl font-black text-on-surface">{{ formatPrice(grandTotal) }}</span>
                    <span class="text-sm font-bold text-outline">UZS</span>
                  </div>
                </div>
              </div>

              <!-- Pay Button -->
              <button
                class="w-full mt-6 bg-success py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                @click="pay"
              >
                <span class="material-symbols-outlined text-2xl">payments</span>
                {{ t('working.paid') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.bill-enter-active,
.bill-leave-active {
  transition: all 0.25s ease;
}
.bill-enter-active > div:last-child,
.bill-leave-active > div:last-child {
  transition: all 0.25s ease;
}
.bill-enter-from,
.bill-leave-to {
  opacity: 0;
}
.bill-enter-from > div:last-child,
.bill-leave-to > div:last-child {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
