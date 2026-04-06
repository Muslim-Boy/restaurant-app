import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'
import type { HistoryEntry, Fine } from '../types'

export const useHistoryStore = defineStore('history', () => {
  const history = useStorage<HistoryEntry[]>('restaurant_history', [])
  const fines = useStorage<Fine[]>('restaurant_fines', [])

  function addEntry(entry: Omit<HistoryEntry, 'id'>) {
    const id = history.value.length > 0 ? Math.max(...history.value.map((h) => h.id)) + 1 : 1
    history.value.push({ id, ...entry })
    return id
  }

  function addFine(fine: Omit<Fine, 'id'>) {
    const id = fines.value.length > 0 ? Math.max(...fines.value.map((f) => f.id)) + 1 : 1
    fines.value.push({ id, ...fine })
  }

  return { history, fines, addEntry, addFine }
})
