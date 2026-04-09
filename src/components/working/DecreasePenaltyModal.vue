<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeesStore } from '../../stores/employees'
import BaseModal from '../ui/BaseModal.vue'
import type { RemoveReason, DecreasePenalty } from '../../types'

const props = defineProps<{
  show: boolean
  decreasedItems: Array<{
    productId: number
    productName: string
    previousQty: number
    currentQty: number
  }>
}>()

const emit = defineEmits<{
  close: []
  confirm: [penalties: DecreasePenalty[]]
}>()

const { t } = useI18n()
const employeesStore = useEmployeesStore()
const workingEmployees = computed(() => employeesStore.employees.filter((e) => e.status === 'working'))

interface ItemPenalty {
  reason: RemoveReason
  comment: string
  employeeId: string | null
  fineAmount: number
}

const penalties = ref<Map<number, ItemPenalty>>(new Map())
const attempted = ref(false)

watch(
  () => props.decreasedItems,
  (items) => {
    const map = new Map<number, ItemPenalty>()
    for (const item of items) {
      map.set(item.productId, {
        reason: 'client_rejected',
        comment: '',
        employeeId: null,
        fineAmount: 0,
      })
    }
    penalties.value = map
    attempted.value = false
  },
  { immediate: true },
)

function getPenalty(productId: number): ItemPenalty {
  return penalties.value.get(productId) ?? { reason: 'client_rejected', comment: '', employeeId: null, fineAmount: 0 }
}

function updatePenalty(productId: number, field: keyof ItemPenalty, value: any) {
  const current = getPenalty(productId)
  penalties.value.set(productId, { ...current, [field]: value })
  penalties.value = new Map(penalties.value)
}

const allValid = computed(() => {
  for (const item of props.decreasedItems) {
    const p = getPenalty(item.productId)
    if (!p.comment.trim()) return false
    if (p.reason === 'employee_error' && !p.employeeId) return false
  }
  return true
})

function submit() {
  attempted.value = true
  if (!allValid.value) return

  const result: DecreasePenalty[] = props.decreasedItems.map((item) => {
    const p = getPenalty(item.productId)
    return {
      productId: item.productId,
      productName: item.productName,
      previousQty: item.previousQty,
      newQty: item.currentQty,
      reason: p.reason,
      comment: p.comment.trim(),
      employeeId: p.reason === 'employee_error' ? p.employeeId : null,
      fineAmount: p.reason === 'employee_error' ? p.fineAmount : 0,
    }
  })

  emit('confirm', result)
}

function cancel() {
  emit('close')
}
</script>

<template>
  <BaseModal :show="show" max-width="max-w-2xl" :title="t('working.decreasePenalty')" @close="cancel">
    <div class="space-y-4">
      <!-- Info banner -->
      <div class="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <span class="material-symbols-outlined text-amber-600">warning</span>
        <span class="text-sm text-amber-800">{{ t('working.decreaseInfo') }}</span>
      </div>

      <!-- Items list -->
      <div class="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        <div
          v-for="item in decreasedItems"
          :key="item.productId"
          class="p-4 bg-surface-container-low rounded-2xl border border-border space-y-4"
        >
          <!-- Product info -->
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-sm text-on-surface">{{ item.productName }}</h4>
            <div class="flex items-center gap-2 text-sm">
              <span class="font-semibold text-outline">{{ item.previousQty }}</span>
              <span class="material-symbols-outlined text-sm text-outline">arrow_forward</span>
              <span class="font-semibold text-on-surface">{{ item.currentQty }}</span>
              <span class="text-xs font-bold text-error bg-error-container/30 px-2 py-0.5 rounded-full">
                -{{ item.previousQty - item.currentQty }}
              </span>
            </div>
          </div>

          <!-- Reason selection -->
          <div>
            <label class="label-md mb-2 block">{{ t('working.removeReason') }}</label>
            <div class="flex gap-2">
              <label
                class="flex-1 flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm"
                :class="getPenalty(item.productId).reason === 'client_rejected' ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant/30 hover:border-outline-variant'"
              >
                <input
                  :checked="getPenalty(item.productId).reason === 'client_rejected'"
                  type="radio"
                  :name="'reason_' + item.productId"
                  class="text-primary focus:ring-primary/20"
                  @change="updatePenalty(item.productId, 'reason', 'client_rejected')"
                />
                <span class="font-medium text-on-surface">{{ t('working.reasons.client_rejected') }}</span>
              </label>
              <label
                class="flex-1 flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm"
                :class="getPenalty(item.productId).reason === 'employee_error' ? 'border-error bg-error-container/20' : 'border-outline-variant/30 hover:border-outline-variant'"
              >
                <input
                  :checked="getPenalty(item.productId).reason === 'employee_error'"
                  type="radio"
                  :name="'reason_' + item.productId"
                  class="text-error focus:ring-error/20"
                  @change="updatePenalty(item.productId, 'reason', 'employee_error')"
                />
                <span class="font-medium text-on-surface">{{ t('working.reasons.employee_error') }}</span>
              </label>
            </div>
          </div>

          <!-- Comment (required) -->
          <div>
            <label class="label-md mb-2 block">
              {{ t('working.comment') }} <span class="text-error">*</span>
            </label>
            <textarea
              :value="getPenalty(item.productId).comment"
              class="input-field resize-none"
              rows="2"
              :placeholder="t('working.commentPlaceholder')"
              :class="{ 'border-error ring-1 ring-error/20': attempted && !getPenalty(item.productId).comment.trim() }"
              @input="updatePenalty(item.productId, 'comment', ($event.target as HTMLTextAreaElement).value)"
            />
            <p
              v-if="attempted && !getPenalty(item.productId).comment.trim()"
              class="text-xs text-error mt-1"
            >
              {{ t('working.commentRequired') }}
            </p>
          </div>

          <!-- Employee + Fine (only for employee_error) -->
          <Transition name="slide-down">
            <div v-if="getPenalty(item.productId).reason === 'employee_error'" class="space-y-3 pl-4 border-l-2 border-error/30">
              <!-- Employee select -->
              <div>
                <label class="label-md mb-2 block">{{ t('working.selectEmployee') }}</label>
                <div class="relative">
                  <select
                    :value="getPenalty(item.productId).employeeId"
                    class="input-field appearance-none pr-10"
                    @change="updatePenalty(item.productId, 'employeeId', ($event.target as HTMLSelectElement).value || null)"
                  >
                    <option :value="''" disabled selected>{{ t('working.selectEmployee') }}</option>
                    <option
                      v-for="emp in workingEmployees"
                      :key="emp.id"
                      :value="emp.id"
                    >
                      {{ emp.id }} — {{ emp.familyName }}
                    </option>
                  </select>
                  <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-lg">expand_more</span>
                </div>
              </div>

              <!-- Fine amount -->
              <div>
                <label class="label-md mb-2 block">
                  {{ t('working.fineAmount') }}
                  <span class="text-outline font-normal normal-case tracking-normal ml-1">({{ t('working.fineOptional') }})</span>
                </label>
                <div class="relative">
                  <input
                    :value="getPenalty(item.productId).fineAmount"
                    type="number"
                    class="input-field pr-14"
                    min="0"
                    placeholder="0"
                    @input="updatePenalty(item.productId, 'fineAmount', parseInt(($event.target as HTMLInputElement).value) || 0)"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">UZS</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        class="flex-1 py-2.5 rounded-xl font-semibold text-outline bg-surface-container-high hover:bg-surface-container-highest active:scale-[0.98] transition-all"
        @click="cancel"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        class="flex-1 py-2.5 rounded-xl font-semibold text-white bg-error hover:bg-red-700 active:scale-[0.98] transition-all"
        :disabled="attempted && !allValid"
        :class="{ 'opacity-40 cursor-not-allowed': attempted && !allValid }"
        @click="submit"
      >
        {{ t('common.confirm') }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
