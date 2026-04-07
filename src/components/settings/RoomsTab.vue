<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoomsStore } from '../../stores/rooms'

const { t } = useI18n()
const store = useRoomsStore()

// Room form
const roomForm = reactive({
  name: '',
  extraCharge: 0,
  noServiceCharge: false,
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
  roomForm.noServiceCharge = room.noServiceCharge
  editingRoomId.value = id
}

function resetRoomForm() {
  roomForm.name = ''
  roomForm.extraCharge = 0
  roomForm.noServiceCharge = false
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
  <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
    <!-- Left Column: Forms -->
    <div class="w-full lg:w-[346px] lg:shrink-0 space-y-6">
      <!-- Global Service Charge -->
      <div class="card p-6 pb-10">
        <div class="flex items-center gap-3 mb-6">
          <span class="material-symbols-outlined text-primary text-lg">percent</span>
          <h3 class="text-lg font-bold text-on-surface">
            {{ t('settings.rooms.globalServicePercent') }}
          </h3>
        </div>
        <div>
          <label class="label-md mb-1 block">{{ t('settings.rooms.servicePercent') }}</label>
          <div class="relative">
            <input
              v-model.number="store.globalServicePercent"
              type="number"
              class="input-field pr-12"
              min="0"
              max="100"
              placeholder="10"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-outline">%</span>
          </div>
        </div>
      </div>

      <!-- Add Room Form -->
      <div class="card p-6 pb-10">
        <div class="flex items-center gap-3 mb-6">
          <span class="material-symbols-outlined text-primary text-lg">meeting_room</span>
          <h3 class="text-lg font-bold text-on-surface">
            {{ editingRoomId !== null ? t('common.edit') : t('settings.rooms.addRoom') }}
          </h3>
        </div>
        <form class="space-y-4" @submit.prevent="submitRoom">
          <div>
            <label class="label-md mb-1 block">{{ t('settings.rooms.roomName') }}</label>
            <input
              v-model="roomForm.name"
              type="text"
              class="input-field"
              placeholder="e.g. VIP Lounge"
            />
          </div>
          <div>
            <label class="label-md mb-1 block">{{ t('settings.rooms.extraCharge') }}</label>
            <div class="relative">
              <input
                v-model.number="roomForm.extraCharge"
                type="number"
                class="input-field pr-12"
                min="0"
                placeholder="0"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-outline">%</span>
            </div>
          </div>
          <div class="flex items-center gap-3 px-1">
            <input
              v-model="roomForm.noServiceCharge"
              type="checkbox"
              class="w-4 h-4 rounded-full border-outline-variant bg-white text-primary focus:ring-primary/20"
            />
            <span class="text-sm font-medium text-outline">{{ t('settings.rooms.noServiceCharge') }}</span>
          </div>
          <button type="submit" class="btn-primary w-full">
            {{ editingRoomId !== null ? t('common.save') : t('common.add') }}
          </button>
          <button
            v-if="editingRoomId !== null"
            type="button"
            class="btn-secondary w-full"
            @click="resetRoomForm"
          >
            {{ t('common.cancel') }}
          </button>
        </form>
      </div>

      <!-- Add Table Form -->
      <div class="card p-6 pb-10">
        <div class="flex items-center gap-3 mb-6">
          <span class="material-symbols-outlined text-primary text-lg">table_restaurant</span>
          <h3 class="text-lg font-bold text-on-surface">
            {{ editingTableId !== null ? t('common.edit') : t('settings.rooms.addTable') }}
          </h3>
        </div>
        <form class="space-y-4" @submit.prevent="submitTable">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label-md mb-1 block">{{ t('settings.rooms.tableName') }}</label>
              <input
                v-model="tableName"
                type="text"
                class="input-field"
                placeholder="T-01"
              />
            </div>
            <div>
              <label class="label-md mb-1 block">{{ t('settings.rooms.roomName') }}</label>
              <div class="relative">
                <select class="input-field appearance-none pr-10">
                  <option v-for="room in store.rooms" :key="room.id" :value="room.id">{{ room.name }}</option>
                </select>
                <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-lg">expand_more</span>
              </div>
            </div>
          </div>
          <button type="submit" class="btn-primary w-full">
            {{ editingTableId !== null ? t('common.save') : t('common.add') }}
          </button>
          <button
            v-if="editingTableId !== null"
            type="button"
            class="btn-secondary w-full"
            @click="editingTableId = null; tableName = ''"
          >
            {{ t('common.cancel') }}
          </button>
        </form>
      </div>
    </div>

    <!-- Right Column: Lists -->
    <div class="flex-1 space-y-6">
      <!-- Rooms Table -->
      <div class="card overflow-hidden">
        <div class="px-6 py-5 border-b border-border">
          <h3 class="text-lg font-bold text-on-surface">{{ t('settings.tabs.rooms') }}</h3>
        </div>
        <div v-if="store.rooms.length === 0" class="p-8 text-center text-muted text-sm">
          {{ t('common.noData') }}
        </div>
        <table v-else class="w-full">
          <thead>
            <tr class="bg-tab-bg">
              <td class="px-6 py-3 label-md">{{ t('settings.rooms.roomName') }}</td>
              <td class="px-6 py-3 label-md">{{ t('settings.rooms.extraCharge') }}</td>
              <td class="px-6 py-3 label-md">{{ t('common.status') }}</td>
              <td class="px-6 py-3 label-md text-right">{{ t('common.actions') }}</td>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="room in store.rooms"
              :key="room.id"
              class="border-t border-border hover:bg-surface/50 transition-colors"
            >
              <td class="px-6 py-5">
                <span class="font-semibold text-base text-on-surface">{{ room.name }}</span>
              </td>
              <td class="px-6 py-5 text-base text-outline">
                {{ room.extraCharge > 0 ? '+' + formatPrice(room.extraCharge) : '0' }}
              </td>
              <td class="px-6 py-5">
                <span
                  v-if="room.noServiceCharge"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-container text-warning"
                >
                  {{ t('settings.rooms.noServiceCharge') }}
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-container text-green-700"
                >
                  {{ t('common.active') }}
                </span>
              </td>
              <td class="px-6 py-5 text-right">
                <button
                  class="p-2 rounded-xl hover:bg-surface-container-high transition-colors text-primary"
                  @click="editRoom(room.id)"
                >
                  <span class="material-symbols-outlined text-sm">edit</span>
                </button>
                <button
                  class="p-2 rounded-xl hover:bg-error-container transition-colors text-outline hover:text-error ml-1"
                  @click="store.deleteRoom(room.id)"
                >
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tables Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="table in store.tables"
          :key="table.id"
          class="card p-5 group"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center">
              <span class="text-primary font-bold text-base">{{ table.id }}</span>
            </div>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-container text-green-700">
              {{ t('common.active') }}
            </span>
          </div>
          <div class="pt-3">
            <h4 class="font-bold text-sm text-on-surface">{{ table.name }}</h4>
            <div class="flex items-center gap-1 mt-1 text-xs text-outline">
              <span class="material-symbols-outlined text-xs">table_restaurant</span>
              <span>{{ store.rooms[0]?.name || '—' }}</span>
            </div>
          </div>
          <div class="flex justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              class="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-primary"
              @click="editTable(table.id)"
            >
              <span class="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              class="p-1.5 rounded-lg hover:bg-error-container text-outline hover:text-error"
              @click="store.deleteTable(table.id)"
            >
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>
        <div v-if="store.tables.length === 0" class="col-span-full card p-8 text-center text-muted text-sm">
          {{ t('common.noData') }}
        </div>
      </div>
    </div>
  </div>
</template>
