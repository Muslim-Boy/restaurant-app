<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoomsStore } from '../../stores/rooms'
import { useProductsStore } from '../../stores/products'
import { useOrdersStore } from '../../stores/orders'
import { useHistoryStore } from '../../stores/history'
import RemoveReasonModal from './RemoveReasonModal.vue'
import DecreasePenaltyModal from './DecreasePenaltyModal.vue'
import type { ProductCategory, RemoveReason, DecreasePenalty } from '../../types'

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

// Snapshot of original quantities for decrease detection
const originalQuantities = ref<Map<number, number>>(new Map())
const removedViaTrash = ref<Set<number>>(new Set())

// Decrease penalty modal
const showDecreasePenaltyModal = ref(false)
const decreasedItemsList = ref<Array<{
  productId: number
  productName: string
  previousQty: number
  currentQty: number
}>>([])

// Mobile tab switching
const mobileTab = ref<'products' | 'basket'>('products')

function captureSnapshot() {
  const snap = new Map<number, number>()
  if (selectedRoomId.value) {
    const order = ordersStore.getOrder(selectedRoomId.value)
    if (order) {
      for (const item of order.items) {
        snap.set(item.productId, item.quantity)
      }
    }
  }
  originalQuantities.value = snap
  removedViaTrash.value = new Set()
}

watch(() => props.show, (val) => {
  if (val) {
    mobileTab.value = 'products'
    captureSnapshot()
  }
})

watch(selectedRoomId, () => {
  if (props.show) captureSnapshot()
})

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

const basketCount = computed(() => orderItems.value.reduce((sum, i) => sum + i.quantity, 0))

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

function onRemoveConfirm(data: { reason: RemoveReason; employeeId: string | null; fine: number; comment: string }) {
  if (!selectedRoomId.value || removingProductId.value === null) return

  if (data.reason === 'employee_error' && data.employeeId && data.fine > 0) {
    historyStore.addFine({
      employeeId: data.employeeId,
      employeeName: data.employeeId,
      orderId: 0,
      reason: data.comment || 'Xodim xatosi',
      amount: data.fine,
      comment: data.comment,
      date: new Date().toISOString().split('T')[0]!,
    })
  }

  removedViaTrash.value.add(removingProductId.value)
  ordersStore.removeItem(selectedRoomId.value, removingProductId.value)
  showRemoveModal.value = false
  removingProductId.value = null
}

function detectDecreases() {
  const result: Array<{
    productId: number
    productName: string
    previousQty: number
    currentQty: number
  }> = []
  for (const [productId, origQty] of originalQuantities.value.entries()) {
    if (removedViaTrash.value.has(productId)) continue
    const currentItem = orderItems.value.find((i) => i.productId === productId)
    const currentQty = currentItem?.quantity ?? 0
    if (currentQty < origQty) {
      const product = getProduct(productId)
      result.push({
        productId,
        productName: product?.name ?? '—',
        previousQty: origQty,
        currentQty,
      })
    }
  }
  return result
}

function saveAndClose() {
  const decreased = detectDecreases()
  if (decreased.length > 0) {
    decreasedItemsList.value = decreased
    showDecreasePenaltyModal.value = true
  } else {
    emit('close')
  }
}

function onDecreasePenaltyConfirm(penalties: DecreasePenalty[]) {
  for (const p of penalties) {
    if (p.reason === 'employee_error' && p.employeeId && p.fineAmount > 0) {
      historyStore.addFine({
        employeeId: p.employeeId,
        employeeName: p.employeeId,
        orderId: currentOrder.value?.roomId ?? 0,
        reason: p.comment,
        amount: p.fineAmount,
        comment: p.comment,
        date: new Date().toISOString().split('T')[0]!,
      })
    }
  }
  showDecreasePenaltyModal.value = false
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
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
              <h3 class="text-xl font-bold text-on-surface">{{ t('working.newOrder') }}</h3>
              <div class="relative w-full sm:w-auto">
                <select
                  v-model.number="selectedRoomId"
                  class="bg-tab-bg border-none rounded-xl focus:ring-2 focus:ring-primary/20 font-medium px-3 sm:px-4 py-2 sm:py-2.5 min-w-0 sm:min-w-[200px] w-full sm:w-auto appearance-none pr-10 text-sm"
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

          <!-- Mobile Tab Bar -->
          <div class="flex md:hidden gap-2 px-4 py-2.5 border-b border-border shrink-0 bg-surface-container">
            <button
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
              :class="mobileTab === 'products'
                ? 'bg-primary text-white shadow-md'
                : 'bg-transparent text-outline hover:bg-tab-bg'"
              @click="mobileTab = 'products'"
            >
              <span class="material-symbols-outlined text-[18px]">restaurant_menu</span>
              {{ t('working.menuTab') }}
            </button>
            <button
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
              :class="mobileTab === 'basket'
                ? 'bg-primary text-white shadow-md'
                : 'bg-transparent text-outline hover:bg-tab-bg'"
              @click="mobileTab = 'basket'"
            >
              <span class="material-symbols-outlined text-[18px]">shopping_basket</span>
              {{ t('working.basketTab') }}
              <span
                v-if="basketCount > 0"
                class="text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold"
                :class="mobileTab === 'basket'
                  ? 'bg-white text-primary'
                  : 'bg-primary text-white'"
              >
                {{ basketCount }}
              </span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
            <!-- Left: Products -->
            <div
              class="flex-1 p-4 sm:p-6 overflow-y-auto"
              :class="{ 'hidden md:block': mobileTab !== 'products' }"
            >
              <!-- Category Pills -->
              <div class="flex gap-3 mb-6 overflow-x-auto pb-2">
                <button
                  v-for="cat in categories"
                  :key="cat.key"
                  class="whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-xs sm:text-sm transition-all"
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
                  class="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-white rounded-2xl shadow-card border border-border hover:border-primary/20 transition-all group"
                >
                  <!-- Image -->
                  <div class="w-20 h-16 sm:w-32 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden bg-surface-container-high shrink-0">
                    <img
                      v-if="product.image"
                      :src="product.image"
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-xl sm:text-3xl text-outline/30">restaurant</span>
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
                  <div class="text-right px-2 sm:px-4 shrink-0">
                    <p class="text-base sm:text-xl font-black text-primary">{{ formatPrice(product.price) }}</p>
                    <p class="text-[10px] text-muted font-medium">UZS</p>
                  </div>

                  <!-- Add Button -->
                  <button
                    class="shrink-0 bg-primary-fixed text-primary px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl flex items-center gap-1 sm:gap-2 font-bold text-sm hover:bg-primary hover:text-white transition-all active:scale-95"
                    :disabled="!selectedRoomId"
                    :class="{ 'opacity-40 cursor-not-allowed': !selectedRoomId }"
                    @click="addProduct(product.id, product.price)"
                  >
                    <span class="material-symbols-outlined text-[18px]">add</span>
                    <span class="hidden sm:inline">ADD</span>
                    <span v-if="getItemQuantity(product.id) > 0" class="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ml-1">
                      {{ getItemQuantity(product.id) }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Mobile Save Footer (products tab) -->
              <div
                v-if="orderItems.length > 0"
                class="sticky bottom-0 left-0 right-0 md:hidden mt-4 p-3 bg-white/90 backdrop-blur-md border-t border-border rounded-2xl shadow-card"
              >
                <button
                  class="w-full bg-gradient-to-br from-primary to-[#2563EB] py-3 rounded-xl text-white font-bold text-sm shadow-primary-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="!selectedRoomId"
                  @click="saveAndClose"
                >
                  <span class="material-symbols-outlined text-[20px]">send</span>
                  {{ t('working.saveOrder') }} · {{ formatPrice(orderTotal) }} UZS
                </button>
              </div>
            </div>

            <!-- Right: Selected Items -->
            <div
              class="w-full md:w-[360px] lg:w-[400px] flex flex-col bg-tab-bg border-t md:border-t-0 md:border-l border-border shrink-0"
              :class="{ 'hidden md:flex': mobileTab !== 'basket' }"
            >
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
                    <span class="text-2xl sm:text-4xl font-black text-on-surface">{{ formatPrice(orderTotal) }}</span>
                    <span class="text-base font-bold text-outline">UZS</span>
                  </div>
                </div>
                <button
                  class="w-full bg-gradient-to-br from-primary to-[#2563EB] py-3 sm:py-4 rounded-2xl text-white font-bold text-base sm:text-lg shadow-[0_20px_25px_-5px_rgba(0,74,198,0.3),0_8px_10px_-6px_rgba(0,74,198,0.3)] hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
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
    <!-- Decrease Penalty Modal -->
    <DecreasePenaltyModal
      :show="showDecreasePenaltyModal"
      :decreased-items="decreasedItemsList"
      @close="showDecreasePenaltyModal = false"
      @confirm="onDecreasePenaltyConfirm"
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
