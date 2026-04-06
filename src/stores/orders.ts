import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '../composables/useStorage'
import type { ActiveOrders, OrderItem } from '../types'

export const useOrdersStore = defineStore('orders', () => {
  const orders = useStorage<ActiveOrders>('restaurant_active_orders', {})

  const activeRoomIds = computed(() => {
    return Object.values(orders.value).map((o) => o.roomId)
  })

  function isRoomOccupied(roomId: number): boolean {
    return activeRoomIds.value.includes(roomId)
  }

  function getOrder(roomId: number) {
    const key = `room_${roomId}`
    return orders.value[key] ?? null
  }

  function createOrder(roomId: number) {
    const key = `room_${roomId}`
    if (orders.value[key]) return
    orders.value[key] = {
      roomId,
      startTime: new Date().toISOString(),
      items: [],
    }
  }

  function addItem(roomId: number, productId: number, price: number) {
    const key = `room_${roomId}`
    const order = orders.value[key]
    if (!order) return

    const existing = order.items.find((i) => i.productId === productId)
    if (existing) {
      existing.quantity++
    } else {
      order.items.push({ productId, quantity: 1, priceAtOrder: price })
    }
    // trigger reactivity
    orders.value = { ...orders.value }
  }

  function updateItemQuantity(roomId: number, productId: number, quantity: number) {
    const key = `room_${roomId}`
    const order = orders.value[key]
    if (!order) return

    if (quantity <= 0) {
      order.items = order.items.filter((i) => i.productId !== productId)
    } else {
      const item = order.items.find((i) => i.productId === productId)
      if (item) item.quantity = quantity
    }
    orders.value = { ...orders.value }
  }

  function removeItem(roomId: number, productId: number) {
    const key = `room_${roomId}`
    const order = orders.value[key]
    if (!order) return

    order.items = order.items.filter((i) => i.productId !== productId)
    orders.value = { ...orders.value }
  }

  function clearOrder(roomId: number) {
    const key = `room_${roomId}`
    const newOrders = { ...orders.value }
    delete newOrders[key]
    orders.value = newOrders
  }

  function getOrderTotal(roomId: number): number {
    const order = getOrder(roomId)
    if (!order) return 0
    return order.items.reduce((sum, i) => sum + i.priceAtOrder * i.quantity, 0)
  }

  function getOrderItemCount(roomId: number): number {
    const order = getOrder(roomId)
    if (!order) return 0
    return order.items.reduce((sum, i) => sum + i.quantity, 0)
  }

  return {
    orders,
    activeRoomIds,
    isRoomOccupied,
    getOrder,
    createOrder,
    addItem,
    updateItemQuantity,
    removeItem,
    clearOrder,
    getOrderTotal,
    getOrderItemCount,
  }
})
