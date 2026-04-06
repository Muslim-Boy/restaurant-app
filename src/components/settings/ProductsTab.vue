<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductsStore } from '../../stores/products'
import BaseModal from '../ui/BaseModal.vue'
import type { ProductType, ProductCategory } from '../../types'

const { t } = useI18n()
const store = useProductsStore()

// Filter
const activeCategory = ref<ProductCategory | 'all'>('all')

const categories: { key: ProductCategory | 'all'; icon: string }[] = [
  { key: 'all', icon: 'apps' },
  { key: 'asosiy', icon: 'restaurant' },
  { key: 'ichimlik', icon: 'local_cafe' },
  { key: 'shirinlik', icon: 'cake' },
  { key: 'gazak', icon: 'tapas' },
]

const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') return store.products
  return store.products.filter((p) => p.category === activeCategory.value)
})

// Modal
const showModal = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  name: '',
  type: 'portsiya' as ProductType,
  category: 'asosiy' as ProductCategory,
  price: 0,
  image: null as string | null,
})

function openAdd() {
  editingId.value = null
  form.value = { name: '', type: 'portsiya', category: 'asosiy', price: 0, image: null }
  showModal.value = true
}

function openEdit(id: number) {
  const p = store.products.find((p) => p.id === id)
  if (!p) return
  editingId.value = id
  form.value = { name: p.name, type: p.type, category: p.category, price: p.price, image: p.image }
  showModal.value = true
}

function submitForm() {
  if (!form.value.name.trim()) return
  if (editingId.value !== null) {
    store.updateProduct(editingId.value, { ...form.value })
  } else {
    store.addProduct({ ...form.value })
  }
  showModal.value = false
}

// Image upload
function onImageUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value.image = reader.result as string
  }
  reader.readAsDataURL(file)
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value.image = reader.result as string
  }
  reader.readAsDataURL(file)
}

function formatPrice(val: number): string {
  return val.toLocaleString('uz-UZ')
}

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

function triggerFileInput() {
  fileInput.value?.click()
}

function categoryLabel(key: string): string {
  if (key === 'all') return t('common.total')
  return t(`settings.products.categories.${key}`)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header + Add Button -->
    <div class="flex justify-between items-center">
      <!-- Category Filter Pills -->
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
          :class="
            activeCategory === cat.key
              ? 'bg-primary text-white shadow-primary-glow'
              : 'bg-surface-container text-outline hover:bg-surface-container-high hover:text-on-surface'
          "
          @click="activeCategory = cat.key"
        >
          <span class="material-symbols-outlined text-[16px]">{{ cat.icon }}</span>
          {{ categoryLabel(cat.key) }}
        </button>
      </div>

      <button class="btn-primary" @click="openAdd">
        <span class="material-symbols-outlined text-[18px]">add</span>
        {{ t('settings.products.addProduct') }}
      </button>
    </div>

    <!-- Products Grid -->
    <div v-if="filteredProducts.length === 0" class="text-center py-12 text-outline text-sm">
      {{ t('common.noData') }}
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="bg-white rounded-xl p-4 shadow-card group hover:shadow-card-hover hover:-translate-y-0.5 transition-all border border-transparent hover:border-primary/10"
      >
        <!-- Image -->
        <div class="aspect-square rounded-lg overflow-hidden mb-3 bg-surface-container-high relative">
          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="material-symbols-outlined text-5xl text-outline/30">restaurant</span>
          </div>
          <span
            class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-full text-primary uppercase"
          >
            {{ t(`settings.products.categories.${product.category}`) }}
          </span>
        </div>

        <!-- Info -->
        <h3 class="font-bold text-sm text-on-surface mb-1 truncate">{{ product.name }}</h3>
        <div class="flex justify-between items-center">
          <span class="text-xs text-outline">{{ t(`settings.products.types.${product.type}`) }}</span>
          <span class="font-bold text-sm text-primary">{{ formatPrice(product.price) }} {{ t('common.currency') }}</span>
        </div>

        <!-- Actions (hover) -->
        <div class="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-surface-container hover:bg-primary-fixed text-outline hover:text-primary text-xs font-medium transition-colors"
            @click="openEdit(product.id)"
          >
            <span class="material-symbols-outlined text-[16px]">edit</span>
            {{ t('common.edit') }}
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-surface-container hover:bg-error-container text-outline hover:text-error text-xs font-medium transition-colors"
            @click="store.deleteProduct(product.id)"
          >
            <span class="material-symbols-outlined text-[16px]">delete</span>
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal
      :show="showModal"
      max-width="max-w-lg"
      @close="showModal = false"
    >
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-on-surface">
            {{ editingId !== null ? t('settings.products.editProduct') : t('settings.products.addProduct') }}
          </h2>
          <p class="text-sm text-outline mt-0.5">{{ t('settings.tabs.products') }}</p>
        </div>
      </template>

      <form class="space-y-5" @submit.prevent="submitForm">
        <!-- Image Upload -->
        <div>
          <label class="label-md mb-2 block">{{ t('settings.products.image') }}</label>
          <div
            class="w-full aspect-video rounded-2xl bg-surface-container-high border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center gap-2 group/upload hover:border-primary/50 cursor-pointer transition-all relative overflow-hidden"
            @click="triggerFileInput"
            @drop="onDrop"
            @dragover.prevent
          >
            <img
              v-if="form.image"
              :src="form.image"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <template v-if="!form.image">
              <span class="material-symbols-outlined text-4xl text-outline group-hover/upload:text-primary transition-colors">add_a_photo</span>
              <p class="text-xs text-outline font-medium">{{ t('settings.products.dropImage') }}</p>
              <p class="text-[10px] text-outline/60">JPG, PNG (Max 5MB)</p>
            </template>
            <div
              v-else
              class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <span class="material-symbols-outlined text-3xl text-white">edit</span>
            </div>
          </div>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onImageUpload" />
        </div>

        <!-- Name -->
        <div>
          <label class="label-md mb-2 block">{{ t('settings.products.productName') }}</label>
          <input
            v-model="form.name"
            type="text"
            class="input-field"
            :placeholder="t('settings.products.productName')"
          />
        </div>

        <!-- Category -->
        <div>
          <label class="label-md mb-2 block">{{ t('settings.products.category') }}</label>
          <div class="relative">
            <select v-model="form.category" class="input-field appearance-none pr-10">
              <option value="asosiy">{{ t('settings.products.categories.asosiy') }}</option>
              <option value="ichimlik">{{ t('settings.products.categories.ichimlik') }}</option>
              <option value="shirinlik">{{ t('settings.products.categories.shirinlik') }}</option>
              <option value="gazak">{{ t('settings.products.categories.gazak') }}</option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-lg">expand_more</span>
          </div>
        </div>

        <!-- Type + Price (2 columns) -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label-md mb-2 block">{{ t('settings.products.type') }}</label>
            <div class="relative">
              <select v-model="form.type" class="input-field appearance-none pr-10">
                <option value="portsiya">{{ t('settings.products.types.portsiya') }}</option>
                <option value="kg">{{ t('settings.products.types.kg') }}</option>
                <option value="litr">{{ t('settings.products.types.litr') }}</option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-lg">expand_more</span>
            </div>
          </div>
          <div>
            <label class="label-md mb-2 block">{{ t('common.price') }}</label>
            <div class="relative">
              <input
                v-model.number="form.price"
                type="number"
                class="input-field pr-14"
                placeholder="0"
                min="0"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">UZS</span>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="flex-1 py-3 rounded-xl font-semibold text-outline bg-surface-container-high hover:bg-surface-container-highest active:scale-[0.98] transition-all"
            @click="showModal = false"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            class="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-br from-primary to-primary-container shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
          >
            {{ editingId !== null ? t('common.save') : t('common.add') }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
