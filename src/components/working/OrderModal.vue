<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoomsStore } from '../../stores/rooms'
import { useProductsStore } from '../../stores/products'
import { useOrdersStore } from '../../stores/orders'
import { useHistoryStore } from '../../stores/history'
import RemoveReasonModal from './RemoveReasonModal.vue'
import type { ProductCategory, RemoveReason } from '../../types'

const props = defineProps<{
  show: boolean
  initialRoomId?: number | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const roomsStore = useRoomsStore()
const productsStore = useProductsStore()
const ordersStore = useOrdersStore()
const historyStore = useHistoryStore()

// Room selection
const selectedRoomId = ref<number | null>(props.initialRoomId ?? null)

watch(() => props.initialRoomId, (val) => {
  if (val !== undefined) selectedRoomId.value = val ?? null
})

// Remove reason modal
const showRemoveModal = ref(false)
const removingProductId = ref<number | null>(null)
const removingProductName = ref('')

// Category filter
const activeCategory = ref<ProductCategory | 'all'>('all')
const categories: { key: ProductCategory | 'all'; icon: string }[] = [
  { key: 'all', icon: 'apps' },
  { key: 'asosiy', icon: 'restaurant' },
  { key: 'ichimlik', icon: 'local_cafe' },
  { key: 'shirinlik', icon: 'cake' },
  { key: 'gazak', icon: 'tapas' },
]

const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') return productsStore.products
  return productsStore.products.filter((p) => p.category === activeCategory.value)
})

const currentOrder = computed(() => {
  if (!selectedRoomId.value) return null
  return ordersStore.getOrder(selectedRoomId.value)
})

const orderItems = computed(() => currentOrder.value?.items ?? [])

const orderTotal = computed(() => {
  return orderItems.value.reduce((sum, i) => sum + i.priceAtOrder * i.quantity, 0)
})

function getProduct(productId: number) {
  return productsStore.products.find((p) => p.id === productId)
}

function getItemQuantity(productId: number): number {
  const item = orderItems.value.find((i) => i.productId === productId)
  return item?.quantity ?? 0
}

function addProduct(productId: number, price: number) {
  if (!selectedRoomId.value) return
  if (!currentOrder.value) {
    ordersStore.createOrder(selectedRoomId.value)
  }
  ordersStore.addItem(selectedRoomId.value, productId, price)
}

function updateQuantity(productId: number, qty: number) {
  if (!selectedRoomId.value) return
  ordersStore.updateItemQuantity(selectedRoomId.value, productId, qty)
}

function requestRemoveItem(productId: number) {
  if (!selectedRoomId.value) return
  const product = getProduct(productId)
  removingProductId.value = productId
  removingProductName.value = product?.name ?? ''
  showRemoveModal.value = true
}

function onRemoveConfirm(data: { reason: RemoveReason; employeeId: string | null; fine: number }) {
  if (!selectedRoomId.value || removingProductId.value === null) return

  if (data.reason === 'employee_error' && data.employeeId && data.fine > 0) {
    historyStore.addFine({
      employeeId: data.employeeId,
      employeeName: data.employeeId,
      orderId: 0,
      reason: 'Xodim xatosi',
      amount: data.fine,
      date: new Date().toISOString().split('T')[0]!,
    })
  }

  ordersStore.removeItem(selectedRoomId.value, removingProductId.value)
  showRemoveModal.value = false
  removingProductId.value = null
}

function saveAndClose() {
  emit('close')
}

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}

function categoryLabel(key: string): string {
  if (key === 'all') return t('common.total')
  return t(`settings.products.categories.${key}`)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-[rgba(15,23,42,0.4)] backdrop-blur-sm" @click="emit('close')" />

        <!-- Modal -->
        <div class="relative bg-white w-full max-w-[1200px] h-[90vh] md:h-[80vh] rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center border-b border-border shrink-0">
            <div class="flex items-center gap-6">
              <h3 class="text-xl font-bold text-on-surface">{{ t('working.newOrder') }}</h3>
              <div class="relative">
                <select
                  v-model.number="selectedRoomId"
                  class="bg-tab-bg border-none rounded-xl focus:ring-2 focus:ring-primary/20 font-medium px-4 py-2.5 min-w-[200px] appearance-none pr-10 text-sm"
                >
                  <option :value="null" disabled>{{ t('working.roomSelect') }}</option>
                  <option v-for="room in roomsStore.rooms" :key="room.id" :value="room.id">
                    {{ room.name }}
                  </option>
                </select>
                <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-lg">expand_more</span>
              </div>
            </div>
            <button
              class="w-8 h-8 flex items-center justify-center hover:bg-tab-bg rounded-full transition-colors"
              @click="emit('close')"
            >
              <span class="material-symbols-outlined text-[#737686]">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
            <!-- Left: Products -->
            <div class="flex-1 p-4 sm:p-6 overflow-y-auto">
              <!-- Category Pills -->
              <div class="flex gap-3 mb-6 overflow-x-auto pb-2">
                <button
                  v-for="cat in categories"
                  :key="cat.key"
                  class="whitespace-nowrap flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all"
                  :class="
                    activeCategory === cat.key
                      ? 'bg-primary-fixed text-primary font-semibold'
                      : 'bg-tab-bg text-outline hover:bg-surface-container-high'
                  "
                  @click="activeCategory = cat.key"
                >
                  <span class="material-symbols-outlined text-[16px]">{{ cat.icon }}</span>
                  {{ categoryLabel(cat.key) }}
                </button>
              </div>

              <!-- Product List -->
              <div v-if="filteredProducts.length === 0" class="text-center py-12 text-muted text-sm">
                {{ t('common.noData') }}
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-card border border-border hover:border-primary/20 transition-all group"
                >
                  <!-- Image -->
                  <div class="w-32 h-24 rounded-xl overflow-hidden bg-surface-container-high shrink-0">
                    <img
                      v-if="product.image"
                      :src="product.image"
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-3xl text-outline/30">restaurant</span>
                    </div>
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <h5 class="font-bold text-sm text-on-surface truncate">{{ product.name }}</h5>
                    <p class="text-xs text-muted mt-0.5">
                      {{ t(`settings.products.types.${product.type}`) }} · {{ t(`settings.products.categories.${product.category}`) }}
                    </p>
                  </div>

                  <!-- Price -->
                  <div class="text-right px-4 shrink-0">
                    <p class="text-xl font-black text-primary">{{ formatPrice(product.price) }}</p>
                    <p class="text-[10px] text-muted font-medium">UZS</p>
                  </div>

                  <!-- Add Button -->
                  <button
                    class="shrink-0 bg-primary-fixed text-primary px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-primary hover:text-white transition-all active:scale-95"
                    :disabled="!selectedRoomId"
                    :class="{ 'opacity-40 cursor-not-allowed': !selectedRoomId }"
                    @click="addProduct(product.id, product.price)"
                  >
                    <span class="material-symbols-outlined text-[18px]">add</span>
                    ADD
                    <span v-if="getItemQuantity(product.id) > 0" class="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ml-1">
                      {{ getItemQuantity(product.id) }}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Selected Items -->
            <div class="w-full md:w-[360px] lg:w-[400px] flex flex-col bg-tab-bg border-t md:border-t-0 md:border-l border-border shrink-0">
              <!-- Basket Header -->
              <div class="p-4 sm:p-6 border-b border-border bg-white flex flex-col items-center gap-2 shrink-0">
                <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-2xl filled">shopping_basket</span>
                </div>
                <span class="text-[10px] uppercase font-extrabold tracking-[0.2em] text-primary">
                  {{ t('working.orderItems') }}
                </span>
              </div>

              <!-- Items -->
              <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                <div
                  v-if="orderItems.length === 0"
                  class="flex flex-col items-center justify-center h-full text-muted/40"
                >
                  <span class="material-symbols-outlined text-5xl mb-2">shopping_cart</span>
                  <p class="text-xs">{{ t('common.noData') }}</p>
                </div>

                <div
                  v-for="item in orderItems"
                  :key="item.productId"
                  class="flex items-center gap-3 bg-white p-3 rounded-xl shadow-card border border-transparent hover:border-primary/10 transition-all"
                >
                  <!-- Thumbnail -->
                  <div class="w-14 h-14 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                    <img
                      v-if="getProduct(item.productId)?.image"
                      :src="getProduct(item.productId)!.image!"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-lg text-outline/30">restaurant</span>
                    </div>
                  </div>

                  <!-- Name & Price -->
                  <div class="flex-1 min-w-0">
                    <h6 class="font-bold text-sm text-on-surface truncate">
                      {{ getProduct(item.productId)?.name }}
                    </h6>
                    <p class="text-xs text-primary font-bold">
                      {{ formatPrice(item.priceAtOrder) }} UZS
                    </p>
                  </div>

                  <!-- Quantity + Delete -->
                  <div class="flex flex-col items-center gap-1 shrink-0">
                    <div class="flex items-center bg-surface-container-high rounded-lg px-1 py-0.5">
                      <button
                        class="w-6 h-6 flex items-center justify-center text-on-surface hover:text-primary transition-colors rounded"
                        @click="updateQuantity(item.productId, item.quantity - 1)"
                      >
                        <span class="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <input
                        :value="item.quantity"
                        type="text"
                        class="w-8 border-none bg-transparent text-center font-bold text-sm focus:ring-0 p-0"
                        @change="updateQuantity(item.productId, parseInt(($event.target as HTMLInputElement).value) || 1)"
                      />
                      <button
                        class="w-6 h-6 flex items-center justify-center text-on-surface hover:text-primary transition-colors rounded"
                        @click="updateQuantity(item.productId, item.quantity + 1)"
                      >
                        <span class="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <button
                      class="text-error/40 hover:text-error transition-colors"
                      @click="requestRemoveItem(item.productId)"
                    >
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="p-4 sm:p-8 bg-white border-t border-border space-y-4 shrink-0">
                <div class="flex flex-col gap-0.5">
                  <span class="text-outline font-medium text-sm">{{ t('common.total') }}:</span>
                  <div class="flex items-baseline gap-2">
                    <span class="text-4xl font-black text-on-surface">{{ formatPrice(orderTotal) }}</span>
                    <span class="text-base font-bold text-outline">UZS</span>
                  </div>
                </div>
                <button
                  class="w-full bg-gradient-to-br from-primary to-[#2563EB] py-4 rounded-2xl text-white font-bold text-lg shadow-[0_20px_25px_-5px_rgba(0,74,198,0.3),0_8px_10px_-6px_rgba(0,74,198,0.3)] hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="!selectedRoomId || orderItems.length === 0"
                  @click="saveAndClose"
                >
                  <span class="material-symbols-outlined">send</span>
                  {{ t('working.saveOrder') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <!-- Remove Reason Modal -->
    <RemoveReasonModal
      :show="showRemoveModal"
      :product-name="removingProductName"
      @close="showRemoveModal = false"
      @confirm="onRemoveConfirm"
    />
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: all 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
