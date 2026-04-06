import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'
import type { Employee, EmployeeStatus } from '../types'

export const useEmployeesStore = defineStore('employees', () => {
  const employees = useStorage<Employee[]>('restaurant_employees', [])

  function addEmployee(employee: Employee) {
    if (employees.value.some((e) => e.id === employee.id)) return false
    employees.value.push(employee)
    return true
  }

  function updateEmployee(id: string, data: Partial<Omit<Employee, 'id'>>) {
    const idx = employees.value.findIndex((e) => e.id === id)
    if (idx === -1) return
    const c = employees.value[idx]!
    employees.value[idx] = {
      id: c.id,
      familyName: data.familyName ?? c.familyName,
      status: (data.status ?? c.status) as EmployeeStatus,
    }
  }

  function toggleStatus(id: string) {
    const idx = employees.value.findIndex((e) => e.id === id)
    if (idx === -1) return
    const c = employees.value[idx]!
    employees.value[idx] = {
      ...c,
      status: c.status === 'working' ? 'free' : 'working',
    }
  }

  function deleteEmployee(id: string) {
    employees.value = employees.value.filter((e) => e.id !== id)
  }

  return { employees, addEmployee, updateEmployee, toggleStatus, deleteEmployee }
})
