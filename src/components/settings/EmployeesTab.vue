<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeesStore } from '../../stores/employees'
import BaseCard from '../ui/BaseCard.vue'
import StatusBadge from '../ui/StatusBadge.vue'

const { t } = useI18n()
const store = useEmployeesStore()

const form = ref({ id: '', familyName: '' })
const editingId = ref<string | null>(null)
const idError = ref(false)

function submitForm() {
  if (!form.value.id.trim() || !form.value.familyName.trim()) return

  if (editingId.value !== null) {
    store.updateEmployee(editingId.value, { familyName: form.value.familyName })
    editingId.value = null
  } else {
    const ok = store.addEmployee({
      id: form.value.id.trim(),
      familyName: form.value.familyName.trim(),
      status: 'working',
    })
    if (!ok) {
      idError.value = true
      return
    }
  }
  resetForm()
}

function editEmployee(id: string) {
  const emp = store.employees.find((e) => e.id === id)
  if (!emp) return
  form.value = { id: emp.id, familyName: emp.familyName }
  editingId.value = id
}

function resetForm() {
  form.value = { id: '', familyName: '' }
  editingId.value = null
  idError.value = false
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left: Form -->
    <BaseCard>
      <h3 class="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[20px]">person_add</span>
        {{ editingId !== null ? t('common.edit') : t('settings.employees.addEmployee') }}
      </h3>
      <form class="space-y-3" @submit.prevent="submitForm">
        <div>
          <label class="label-md mb-1 block">{{ t('settings.employees.employeeId') }}</label>
          <input
            v-model="form.id"
            type="text"
            class="input-field"
            :class="{ 'ring-2 ring-error/30': idError }"
            :placeholder="t('settings.employees.employeeId')"
            :disabled="editingId !== null"
            @input="idError = false"
          />
          <p v-if="idError" class="text-xs text-error mt-1">ID allaqachon mavjud</p>
        </div>
        <div>
          <label class="label-md mb-1 block">{{ t('settings.employees.familyName') }}</label>
          <input
            v-model="form.familyName"
            type="text"
            class="input-field"
            :placeholder="t('settings.employees.familyName')"
          />
        </div>
        <div class="flex gap-2 pt-2">
          <button type="submit" class="btn-primary flex-1">
            <span class="material-symbols-outlined text-[18px]">{{ editingId !== null ? 'check' : 'add' }}</span>
            {{ editingId !== null ? t('common.save') : t('common.add') }}
          </button>
          <button
            v-if="editingId !== null"
            type="button"
            class="btn-secondary"
            @click="resetForm"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </form>
    </BaseCard>

    <!-- Right: Table -->
    <div class="lg:col-span-2">
      <BaseCard padding="p-0">
        <div class="px-4 py-3 border-b border-surface-container">
          <h3 class="text-sm font-semibold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">badge</span>
            {{ t('settings.tabs.employees') }}
            <span class="ml-auto text-xs font-normal text-outline">{{ store.employees.length }}</span>
          </h3>
        </div>

        <div v-if="store.employees.length === 0" class="p-6 text-center text-outline text-sm">
          {{ t('common.noData') }}
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-container">
                <th class="px-4 py-3 text-left label-md">ID</th>
                <th class="px-4 py-3 text-left label-md">{{ t('settings.employees.familyName') }}</th>
                <th class="px-4 py-3 text-left label-md">{{ t('common.status') }}</th>
                <th class="px-4 py-3 text-right label-md">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container">
              <tr
                v-for="emp in store.employees"
                :key="emp.id"
                class="hover:bg-surface-container/30 transition-colors"
              >
                <td class="px-4 py-3">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-fixed text-primary text-xs font-bold">
                    {{ emp.id }}
                  </span>
                </td>
                <td class="px-4 py-3 font-medium text-on-surface">{{ emp.familyName }}</td>
                <td class="px-4 py-3">
                  <StatusBadge :variant="emp.status === 'working' ? 'success' : 'neutral'">
                    {{ t(`settings.employees.statuses.${emp.status}`) }}
                  </StatusBadge>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      class="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-outline hover:text-primary"
                      :title="t('settings.employees.changeStatus')"
                      @click="store.toggleStatus(emp.id)"
                    >
                      <span class="material-symbols-outlined text-[18px]">swap_horiz</span>
                    </button>
                    <button
                      class="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-outline hover:text-primary"
                      :title="t('common.edit')"
                      @click="editEmployee(emp.id)"
                    >
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      class="p-1.5 rounded-lg hover:bg-error-container transition-colors text-outline hover:text-error"
                      :title="t('common.delete')"
                      @click="store.deleteEmployee(emp.id)"
                    >
                      <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
