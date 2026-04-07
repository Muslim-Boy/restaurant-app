<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeesStore } from '../../stores/employees'

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
  <div>
    <!-- Section Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-on-surface">{{ t('settings.tabs.employees') }}</h2>
      <p class="text-sm text-outline mt-1">{{ t('settings.employees.addEmployee') }}</p>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
      <!-- Left: Add Employee Form -->
      <div class="w-full lg:w-[346px] lg:shrink-0">
        <div class="card p-6 pb-10 border border-outline-variant/10">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-primary text-lg">person_add</span>
            <h3 class="text-lg font-bold text-on-surface">
              {{ editingId !== null ? t('common.edit') : t('settings.employees.addEmployee') }}
            </h3>
          </div>
          <form class="space-y-4" @submit.prevent="submitForm">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-md mb-1 block">ID</label>
                <input
                  v-model="form.id"
                  type="text"
                  class="input-field"
                  :class="{ 'ring-2 ring-error/30': idError }"
                  placeholder="ST-101"
                  :disabled="editingId !== null"
                  @input="idError = false"
                />
              </div>
              <div>
                <label class="label-md mb-1 block">{{ t('common.status') }}</label>
                <div class="relative">
                  <select class="input-field appearance-none pr-10">
                    <option value="working">{{ t('settings.employees.statuses.working') }}</option>
                    <option value="free">{{ t('settings.employees.statuses.free') }}</option>
                  </select>
                  <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-lg">expand_more</span>
                </div>
              </div>
            </div>
            <div>
              <label class="label-md mb-1 block">{{ t('settings.employees.familyName') }}</label>
              <input
                v-model="form.familyName"
                type="text"
                class="input-field"
                placeholder="Abdukarimov"
              />
            </div>
            <div>
              <label class="label-md mb-1 block">{{ t('settings.employees.familyName') }}</label>
              <input
                type="text"
                class="input-field"
                placeholder="Alisher"
              />
            </div>
            <p v-if="idError" class="text-xs text-error">ID allaqachon mavjud</p>
            <button type="submit" class="btn-primary w-full">
              {{ editingId !== null ? t('common.save') : t('settings.employees.addEmployee') }}
            </button>
            <button
              v-if="editingId !== null"
              type="button"
              class="btn-secondary w-full"
              @click="resetForm"
            >
              {{ t('common.cancel') }}
            </button>
          </form>
        </div>
      </div>

      <!-- Right: Employee Table -->
      <div class="flex-1">
        <div class="card overflow-hidden border border-outline-variant/10">
          <div v-if="store.employees.length === 0" class="p-8 text-center text-muted text-sm">
            {{ t('common.noData') }}
          </div>

          <table v-else class="w-full">
            <thead>
              <tr class="bg-tab-bg">
                <td class="px-6 py-3 label-md">ID</td>
                <td class="px-6 py-3 label-md">{{ t('settings.employees.familyName') }}</td>
                <td class="px-6 py-3 label-md">{{ t('common.status') }}</td>
                <td class="px-6 py-3 label-md text-right">{{ t('common.actions') }}</td>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="emp in store.employees"
                :key="emp.id"
                class="border-t border-border hover:bg-surface/50 transition-colors"
              >
                <td class="px-6 py-5">
                  <span class="font-bold text-base text-primary">{{ emp.id }}</span>
                </td>
                <td class="px-6 py-5">
                  <span class="font-semibold text-base text-on-surface">{{ emp.familyName }}</span>
                </td>
                <td class="px-6 py-5">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="emp.status === 'working'
                      ? 'bg-success-container text-green-700'
                      : 'bg-surface-container-high text-outline'"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="emp.status === 'working' ? 'bg-green-500' : 'bg-outline'"
                    ></span>
                    {{ t(`settings.employees.statuses.${emp.status}`) }}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      class="p-2 rounded-xl hover:bg-surface-container-high transition-colors text-outline"
                      :title="t('settings.employees.changeStatus')"
                      @click="store.toggleStatus(emp.id)"
                    >
                      <span class="material-symbols-outlined text-sm">swap_horiz</span>
                    </button>
                    <button
                      class="p-2 rounded-xl hover:bg-surface-container-high transition-colors text-outline"
                      :title="t('common.edit')"
                      @click="editEmployee(emp.id)"
                    >
                      <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      class="p-2 rounded-xl hover:bg-error-container transition-colors text-outline hover:text-error"
                      :title="t('common.delete')"
                      @click="store.deleteEmployee(emp.id)"
                    >
                      <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
