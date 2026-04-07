<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoomsStore } from '../stores/rooms'
import { useOrdersStore } from '../stores/orders'
import RoomCard from '../components/working/RoomCard.vue'
import OrderModal from '../components/working/OrderModal.vue'
import BillModal from '../components/working/BillModal.vue'

const { t } = useI18n()
const roomsStore = useRoomsStore()
const ordersStore = useOrdersStore()

const occupiedRooms = computed(() =>
  roomsStore.rooms.filter((r) => ordersStore.isRoomOccupied(r.id)),
)
const freeRooms = computed(() =>
  roomsStore.rooms.filter((r) => !ordersStore.isRoomOccupied(r.id)),
)

const totalItems = computed(() => {
  let count = 0
  for (const room of occupiedRooms.value) {
    count += ordersStore.getOrderItemCount(room.id)
  }
  return count
})

const totalRevenue = computed(() => {
  let sum = 0
  for (const room of occupiedRooms.value) {
    sum += ordersStore.getOrderTotal(room.id)
  }
  return sum
})

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}

// Modal states
const showOrderModal = ref(false)
const showBillModal = ref(false)
const selectedRoomId = ref<number | null>(null)

function openOrderModal(roomId?: number) {
  selectedRoomId.value = roomId ?? null
  showOrderModal.value = true
}

function openBillModal(roomId: number) {
  selectedRoomId.value = roomId
  showBillModal.value = true
}
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-8 lg:space-y-10">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-[30px] font-extrabold leading-9 tracking-tight text-on-surface">
          {{ t('working.title') }}
        </h1>
        <p class="text-sm sm:text-base font-medium text-outline mt-1">
          {{ t('working.subtitle') || t('working.title') }}
        </p>
      </div>
      <button
        class="group flex items-center gap-4 bg-gradient-to-br from-primary to-[#2563EB] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 shrink-0"
        @click="openOrderModal()"
      >
        <div class="flex flex-col items-start">
          <span class="text-[10px] uppercase tracking-[0.2em] font-black opacity-80">
            {{ t('common.add') }}
          </span>
          <span class="text-lg font-bold">{{ t('working.newOrder') }}</span>
        </div>
        <span class="material-symbols-outlined text-3xl transition-transform group-hover:rotate-90">add_circle</span>
      </button>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" v-if="roomsStore.rooms.length > 0">
      <div class="flex items-center gap-3 bg-white rounded-2xl px-4 sm:px-5 py-3 shadow-card">
        <div class="w-10 h-10 rounded-xl bg-[#DBEAFE] flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[#2563EB]">meeting_room</span>
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-wide text-outline">{{ t('working.occupied') }}</p>
          <p class="text-xl font-black text-on-surface">{{ occupiedRooms.length }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 bg-white rounded-2xl px-4 sm:px-5 py-3 shadow-card">
        <div class="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[#059669]">event_available</span>
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-wide text-outline">{{ t('working.free') }}</p>
          <p class="text-xl font-black text-on-surface">{{ freeRooms.length }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 bg-white rounded-2xl px-4 sm:px-5 py-3 shadow-card">
        <div class="w-10 h-10 rounded-xl bg-[#FFEDD5] flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[#EA580C]">flatware</span>
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-wide text-outline">{{ t('working.products') }}</p>
          <p class="text-xl font-black text-on-surface">{{ totalItems }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 bg-white rounded-2xl px-4 sm:px-5 py-3 shadow-card">
        <div class="w-10 h-10 rounded-xl bg-[#DBEAFE] flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[#2563EB]">payments</span>
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-wide text-outline truncate">{{ t('common.total') }}</p>
          <p class="text-xl font-black text-on-surface">{{ formatPrice(totalRevenue) }}</p>
        </div>
      </div>
    </div>

    <!-- No rooms warning -->
    <div
      v-if="roomsStore.rooms.length === 0"
      class="flex flex-col items-center justify-center py-20 text-outline"
    >
      <span class="material-symbols-outlined text-6xl mb-4 opacity-30">meeting_room</span>
      <p class="text-sm">{{ t('common.noData') }}</p>
      <RouterLink to="/settings" class="btn-primary mt-4">
        <span class="material-symbols-outlined text-[18px]">settings</span>
        {{ t('nav.settings') }}
      </RouterLink>
    </div>

    <template v-else>
      <!-- Occupied Rooms -->
      <section v-if="occupiedRooms.length > 0">
        <div class="flex items-center gap-3 mb-6">
          <div class="h-8 w-1.5 bg-primary rounded-full" />
          <h2 class="text-xl font-bold text-on-surface uppercase tracking-[2px]">
            {{ t('working.occupied') }} ({{ occupiedRooms.length }})
          </h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <RoomCard
            v-for="room in occupiedRooms"
            :key="room.id"
            :room="room"
            @add-products="openOrderModal"
            @show-bill="openBillModal"
          />
        </div>
      </section>

      <!-- Free Rooms -->
      <section v-if="freeRooms.length > 0">
        <div class="flex items-center gap-3 mb-6">
          <div class="h-8 w-1.5 bg-outline-variant rounded-full" />
          <h2 class="text-xl font-bold text-outline uppercase tracking-[2px]">
            {{ t('working.free') }} ({{ freeRooms.length }})
          </h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <RoomCard
            v-for="room in freeRooms"
            :key="room.id"
            :room="room"
            @add-products="openOrderModal"
            @show-bill="openBillModal"
          />
        </div>
      </section>
    </template>

    <!-- Order Modal -->
    <OrderModal
      :show="showOrderModal"
      :initial-room-id="selectedRoomId"
      @close="showOrderModal = false"
    />

    <!-- Bill Modal -->
    <BillModal
      :show="showBillModal"
      :room-id="selectedRoomId"
      @close="showBillModal = false"
    />
  </div>
</template>
