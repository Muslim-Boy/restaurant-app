import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/working',
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../pages/SettingsPage.vue'),
    },
    {
      path: '/working',
      name: 'working',
      component: () => import('../pages/WorkingPage.vue'),
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('../pages/AnalyticsPage.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../pages/HistoryPage.vue'),
    },
  ],
})

export default router
