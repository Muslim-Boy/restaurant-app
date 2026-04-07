<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const { t } = useI18n()

const props = defineProps<{
  data: { date: string; revenue: number }[]
}>()

const chartData = computed(() => ({
  labels: props.data.map((d) => {
    const date = new Date(d.date)
    return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })
  }),
  datasets: [
    {
      label: t('analytics.dailyRevenue'),
      data: props.data.map((d) => d.revenue),
      backgroundColor: 'rgba(0, 74, 198, 0.7)',
      hoverBackgroundColor: 'rgba(37, 99, 235, 0.9)',
      borderRadius: 6,
      borderSkipped: false as const,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#191c1e',
      titleFont: { family: 'Inter', size: 12 },
      bodyFont: { family: 'Inter', size: 13, weight: 'bold' as const },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx: any) => `${ctx.parsed.y.toLocaleString('uz-UZ')} UZS`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Inter', size: 11 }, color: '#737686' },
    },
    y: {
      grid: { color: 'rgba(195, 198, 215, 0.2)' },
      ticks: {
        font: { family: 'Inter', size: 11 },
        color: '#737686',
        callback: (val: any) => `${(val / 1000).toFixed(0)}k`,
      },
    },
  },
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-5">
    <h3 class="text-sm font-semibold text-on-surface flex items-center gap-2 mb-4">
      <span class="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
      {{ t('analytics.dailyRevenue') }}
    </h3>
    <div v-if="data.length === 0" class="h-[300px] flex items-center justify-center text-muted text-sm">
      {{ t('common.noData') }}
    </div>
    <div v-else class="h-[300px]">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
