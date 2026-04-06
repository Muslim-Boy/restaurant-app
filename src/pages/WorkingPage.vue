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

// Modal states (komponentlari keyingi sessiyada)
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
  <div class="p-6 space-y-8">
    <!-- Header + New Order Button -->
    <div class="flex items-center justify-between">
      <div />
      <button
        class="group relative flex items-center gap-4 bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
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
        <div class="flex items-center gap-3 mb-4">
          <div class="h-8 w-1.5 bg-primary rounded-full" />
          <h2 class="text-sm font-bold text-on-surface uppercase tracking-widest">
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
        <div class="flex items-center gap-3 mb-4">
          <div class="h-8 w-1.5 bg-outline-variant rounded-full" />
          <h2 class="text-sm font-bold text-outline uppercase tracking-widest">
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
