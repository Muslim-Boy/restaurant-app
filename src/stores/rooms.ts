import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'
import type { Room, Table } from '../types'

export const useRoomsStore = defineStore('rooms', () => {
  const rooms = useStorage<Room[]>('restaurant_rooms', [])
  const tables = useStorage<Table[]>('restaurant_tables', [])

  function addRoom(room: Omit<Room, 'id'>) {
    const id = rooms.value.length > 0 ? Math.max(...rooms.value.map((r) => r.id)) + 1 : 1
    rooms.value.push({ id, ...room })
  }

  function updateRoom(id: number, data: Partial<Omit<Room, 'id'>>) {
    const idx = rooms.value.findIndex((r) => r.id === id)
    if (idx === -1) return
    const current = rooms.value[idx]!
    rooms.value[idx] = {
      id: current.id,
      name: data.name ?? current.name,
      extraCharge: data.extraCharge ?? current.extraCharge,
      serviceEnabled: data.serviceEnabled ?? current.serviceEnabled,
      servicePercent: data.servicePercent ?? current.servicePercent,
    }
  }

  function deleteRoom(id: number) {
    rooms.value = rooms.value.filter((r) => r.id !== id)
  }

  function addTable(table: Omit<Table, 'id'>) {
    const id = tables.value.length > 0 ? Math.max(...tables.value.map((t) => t.id)) + 1 : 1
    tables.value.push({ id, ...table })
  }

  function updateTable(id: number, data: Partial<Omit<Table, 'id'>>) {
    const idx = tables.value.findIndex((t) => t.id === id)
    if (idx === -1) return
    const current = tables.value[idx]!
    tables.value[idx] = {
      id: current.id,
      name: data.name ?? current.name,
    }
  }

  function deleteTable(id: number) {
    tables.value = tables.value.filter((t) => t.id !== id)
  }

  return {
    rooms,
    tables,
    addRoom,
    updateRoom,
    deleteRoom,
    addTable,
    updateTable,
    deleteTable,
  }
})
