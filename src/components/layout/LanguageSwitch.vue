<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

function toggle() {
  const newLocale = locale.value === 'uz' ? 'ru' : 'uz'
  locale.value = newLocale
  localStorage.setItem('restaurant_locale', newLocale)
}
</script>

<template>
  <button
    class="flex items-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm text-outline hover:bg-surface-container-high hover:text-on-surface transition-all duration-200"
    @click="toggle"
  >
    <span class="material-symbols-outlined text-[20px]">translate</span>
    <span class="tracking-wide">{{ locale === 'uz' ? "O'zbekcha" : 'Русский' }}</span>
    <span
      class="ml-auto text-[10px] font-bold uppercase tracking-widest bg-primary-fixed text-primary px-2 py-0.5 rounded-full"
    >
      {{ locale.toUpperCase() }}
    </span>
  </button>
</template>
