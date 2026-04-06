<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoomsStore } from '../../stores/rooms'
import BaseCard from '../ui/BaseCard.vue'

const { t } = useI18n()
const store = useRoomsStore()

// Room form
const roomForm = reactive({
  name: '',
  extraCharge: 0,
  serviceEnabled: false,
  servicePercent: 0,
})

const editingRoomId = ref<number | null>(null)

function submitRoom() {
  if (!roomForm.name.trim()) return

  if (editingRoomId.value !== null) {
    store.updateRoom(editingRoomId.value, { ...roomForm })
    editingRoomId.value = null
  } else {
    store.addRoom({ ...roomForm })
  }
  resetRoomForm()
}

function editRoom(id: number) {
  const room = store.rooms.find((r) => r.id === id)
  if (!room) return
  roomForm.name = room.name
  roomForm.extraCharge = room.extraCharge
  roomForm.serviceEnabled = room.serviceEnabled
  roomForm.servicePercent = room.servicePercent
  editingRoomId.value = id
}

function resetRoomForm() {
  roomForm.name = ''
  roomForm.extraCharge = 0
  roomForm.serviceEnabled = false
  roomForm.servicePercent = 0
  editingRoomId.value = null
}

// Table form
const tableName = ref('')
const editingTableId = ref<number | null>(null)

function submitTable() {
  if (!tableName.value.trim()) return

  if (editingTableId.value !== null) {
    store.updateTable(editingTableId.value, { name: tableName.value })
    editingTableId.value = null
  } else {
    store.addTable({ name: tableName.value })
  }
  tableName.value = ''
}

function editTable(id: number) {
  const table = store.tables.find((t) => t.id === id)
  if (!table) return
  tableName.value = table.name
  editingTableId.value = id
}

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Left: Forms -->
    <div class="space-y-6">
      <!-- Room Form -->
      <BaseCard>
        <h3 class="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">meeting_room</span>
          {{ editingRoomId !== null ? t('common.edit') : t('settings.rooms.addRoom') }}
        </h3>
        <form class="space-y-3" @submit.prevent="submitRoom">
          <div>
            <label class="label-md mb-1 block">{{ t('settings.rooms.roomName') }}</label>
            <input v-model="roomForm.name" type="text" class="input-field" :placeholder="t('settings.rooms.roomName')" />
          </div>
          <div>
            <label class="label-md mb-1 block">{{ t('settings.rooms.extraCharge') }}</label>
            <input v-model.number="roomForm.extraCharge" type="number" class="input-field" min="0" placeholder="0" />
          </div>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="roomForm.serviceEnabled"
                type="checkbox"
                class="rounded border-outline-variant text-primary focus:ring-primary/20"
              />
              <span class="text-sm text-on-surface">{{ t('settings.rooms.enableService') }}</span>
            </label>
          </div>
          <div v-if="roomForm.serviceEnabled">
            <label class="label-md mb-1 block">{{ t('settings.rooms.servicePercent') }}</label>
            <input v-model.number="roomForm.servicePercent" type="number" class="input-field" min="0" max="100" placeholder="10" />
          </div>
          <div class="flex gap-2 pt-2">
            <button type="submit" class="btn-primary flex-1">
              <span class="material-symbols-outlined text-[18px]">{{ editingRoomId !== null ? 'check' : 'add' }}</span>
              {{ editingRoomId !== null ? t('common.save') : t('common.add') }}
            </button>
            <button
              v-if="editingRoomId !== null"
              type="button"
              class="btn-secondary"
              @click="resetRoomForm"
            >
              {{ t('common.cancel') }}
            </button>
          </div>
        </form>
      </BaseCard>

      <!-- Table Form -->
      <BaseCard>
        <h3 class="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">table_restaurant</span>
          {{ editingTableId !== null ? t('common.edit') : t('settings.rooms.addTable') }}
        </h3>
        <form class="flex gap-2" @submit.prevent="submitTable">
          <input v-model="tableName" type="text" class="input-field flex-1" :placeholder="t('settings.rooms.tableName')" />
          <button type="submit" class="btn-primary">
            <span class="material-symbols-outlined text-[18px]">{{ editingTableId !== null ? 'check' : 'add' }}</span>
          </button>
          <button
            v-if="editingTableId !== null"
            type="button"
            class="btn-secondary"
            @click="editingTableId = null; tableName = ''"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </form>
      </BaseCard>
    </div>

    <!-- Right: Lists -->
    <div class="space-y-6">
      <!-- Rooms Table -->
      <BaseCard padding="p-0">
        <div class="px-4 py-3 border-b border-surface-container">
          <h3 class="text-sm font-semibold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">meeting_room</span>
            {{ t('settings.tabs.rooms') }}
            <span class="ml-auto text-xs font-normal text-outline">{{ store.rooms.length }}</span>
          </h3>
        </div>
        <div v-if="store.rooms.length === 0" class="p-6 text-center text-outline text-sm">
          {{ t('common.noData') }}
        </div>
        <div v-else class="divide-y divide-surface-container">
          <div
            v-for="room in store.rooms"
            :key="room.id"
            class="flex items-center gap-3 px-4 py-3 hover:bg-surface-container/50 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm text-on-surface truncate">{{ room.name }}</div>
              <div class="text-xs text-outline mt-0.5 flex items-center gap-2">
                <span v-if="room.extraCharge > 0">+{{ formatPrice(room.extraCharge) }} {{ t('common.currency') }}</span>
                <span v-if="room.serviceEnabled" class="inline-flex items-center gap-1 text-primary">
                  <span class="material-symbols-outlined text-[14px]">percent</span>
                  {{ room.servicePercent }}%
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button
                class="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-outline hover:text-primary"
                @click="editRoom(room.id)"
              >
                <span class="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                class="p-1.5 rounded-lg hover:bg-error-container transition-colors text-outline hover:text-error"
                @click="store.deleteRoom(room.id)"
              >
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Tables Grid -->
      <BaseCard padding="p-0">
        <div class="px-4 py-3 border-b border-surface-container">
          <h3 class="text-sm font-semibold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">table_restaurant</span>
            {{ t('settings.rooms.addTable').replace(t('common.add'), '').trim() || 'Stollar' }}
            <span class="ml-auto text-xs font-normal text-outline">{{ store.tables.length }}</span>
          </h3>
        </div>
        <div v-if="store.tables.length === 0" class="p-6 text-center text-outline text-sm">
          {{ t('common.noData') }}
        </div>
        <div v-else class="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div
            v-for="table in store.tables"
            :key="table.id"
            class="flex items-center justify-between rounded-lg bg-surface-container/50 px-3 py-2.5 group hover:bg-surface-container transition-colors"
          >
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md bg-primary-fixed text-primary text-xs font-bold flex items-center justify-center">
                {{ table.id }}
              </span>
              <span class="text-sm text-on-surface">{{ table.name }}</span>
            </div>
            <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                class="p-1 rounded hover:bg-surface-container-high text-outline hover:text-primary"
                @click="editTable(table.id)"
              >
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button
                class="p-1 rounded hover:bg-error-container text-outline hover:text-error"
                @click="store.deleteTable(table.id)"
              >
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
