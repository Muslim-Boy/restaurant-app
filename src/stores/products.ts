import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'
import type { Product, ProductType, ProductCategory } from '../types'

export const useProductsStore = defineStore('products', () => {
  const products = useStorage<Product[]>('restaurant_products', [])

  function addProduct(product: Omit<Product, 'id'>) {
    const id = products.value.length > 0 ? Math.max(...products.value.map((p) => p.id)) + 1 : 1
    products.value.push({ id, ...product })
  }

  function updateProduct(id: number, data: Partial<Omit<Product, 'id'>>) {
    const idx = products.value.findIndex((p) => p.id === id)
    if (idx === -1) return
    const c = products.value[idx]!
    products.value[idx] = {
      id: c.id,
      name: data.name ?? c.name,
      type: (data.type ?? c.type) as ProductType,
      price: data.price ?? c.price,
      image: data.image !== undefined ? data.image : c.image,
      category: (data.category ?? c.category) as ProductCategory,
    }
  }

  function deleteProduct(id: number) {
    products.value = products.value.filter((p) => p.id !== id)
  }

  return { products, addProduct, updateProduct, deleteProduct }
})
