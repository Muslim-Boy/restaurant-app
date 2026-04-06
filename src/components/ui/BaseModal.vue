<script setup lang="ts">
defineProps<{
  show: boolean
  maxWidth?: string
  title?: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @mousedown.self="emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

        <!-- Modal Card -->
        <div
          class="relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          :class="maxWidth || 'max-w-lg'"
        >
          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between px-6 pt-6 pb-2"
          >
            <slot name="header">
              <h2 class="text-lg font-bold text-on-surface">{{ title }}</h2>
            </slot>
            <button
              class="p-2 rounded-full hover:bg-surface-container-high transition-colors"
              @click="emit('close')"
            >
              <span class="material-symbols-outlined text-outline">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 pb-6" :class="{ 'pt-6': !title && !$slots.header }">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-3 px-6 pb-6"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
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
