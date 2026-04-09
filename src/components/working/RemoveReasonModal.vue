<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeesStore } from '../../stores/employees'
import BaseModal from '../ui/BaseModal.vue'
import type { RemoveReason } from '../../types'

defineProps<{
  show: boolean
  productName: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: { reason: RemoveReason; employeeId: string | null; fine: number; comment: string }]
}>()

const { t } = useI18n()
const employeesStore = useEmployeesStore()

const reason = ref<RemoveReason>('client_rejected')
const selectedEmployeeId = ref<string | null>(null)
const fineAmount = ref(0)
const comment = ref('')
const attempted = ref(false)

function submit() {
  attempted.value = true
  if (!comment.value.trim()) return
  if (reason.value === 'employee_error' && !selectedEmployeeId.value) return

  emit('confirm', {
    reason: reason.value,
    employeeId: reason.value === 'employee_error' ? selectedEmployeeId.value : null,
    fine: reason.value === 'employee_error' ? fineAmount.value : 0,
    comment: comment.value.trim(),
  })
  reset()
}

function cancel() {
  emit('close')
  reset()
}

function reset() {
  reason.value = 'client_rejected'
  selectedEmployeeId.value = null
  fineAmount.value = 0
  comment.value = ''
  attempted.value = false
}

const workingEmployees = ref(employeesStore.employees.filter((e) => e.status === 'working'))
</script>

<template>
  <BaseModal :show="show" max-width="max-w-md" :title="t('working.removeProduct')" @close="cancel">
    <div class="space-y-5">
      <!-- Product name -->
      <div class="flex items-center gap-3 p-3 bg-error-container/30 rounded-xl">
        <span class="material-symbols-outlined text-error">remove_shopping_cart</span>
        <span class="font-semibold text-sm text-on-surface">{{ productName }}</span>
      </div>

      <!-- Reason selection -->
      <div>
        <label class="label-md mb-3 block">{{ t('working.removeReason') }}</label>
        <div class="space-y-2">
          <label
            class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
            :class="reason === 'client_rejected' ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant/30 hover:border-outline-variant'"
          >
            <input v-model="reason" type="radio" value="client_rejected" class="text-primary focus:ring-primary/20" />
            <span class="font-medium text-sm text-on-surface">{{ t('working.reasons.client_rejected') }}</span>
          </label>
          <label
            class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
            :class="reason === 'employee_error' ? 'border-error bg-error-container/20' : 'border-outline-variant/30 hover:border-outline-variant'"
          >
            <input v-model="reason" type="radio" value="employee_error" class="text-error focus:ring-error/20" />
            <span class="font-medium text-sm text-on-surface">{{ t('working.reasons.employee_error') }}</span>
          </label>
        </div>
      </div>

      <!-- Comment (required) -->
      <div>
        <label class="label-md mb-2 block">
          {{ t('working.comment') }} <span class="text-error">*</span>
        </label>
        <textarea
          v-model="comment"
          class="input-field resize-none"
          rows="2"
          :placeholder="t('working.commentPlaceholder')"
          :class="{ 'border-error ring-1 ring-error/20': attempted && !comment.trim() }"
        />
        <p v-if="attempted && !comment.trim()" class="text-xs text-error mt-1">
          {{ t('working.commentRequired') }}
        </p>
      </div>

      <!-- Employee selection + Fine (only for employee_error) -->
      <Transition name="slide-down">
        <div v-if="reason === 'employee_error'" class="space-y-4 pl-4 border-l-2 border-error/30">
          <!-- Employee select -->
          <div>
            <label class="label-md mb-2 block">{{ t('working.selectEmployee') }}</label>
            <div class="relative">
              <select
                v-model="selectedEmployeeId"
                class="input-field appearance-none pr-10"
              >
                <option :value="null" disabled>{{ t('working.selectEmployee') }}</option>
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
                v-model.number="fineAmount"
                type="number"
                class="input-field pr-14"
                min="0"
                placeholder="0"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">UZS</span>
            </div>
          </div>
        </div>
      </Transition>
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
        :disabled="attempted && (!comment.trim() || (reason === 'employee_error' && !selectedEmployeeId))"
        :class="{ 'opacity-40 cursor-not-allowed': attempted && (!comment.trim() || (reason === 'employee_error' && !selectedEmployeeId)) }"
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
