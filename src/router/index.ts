import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/cluster-list.vue'),
    },
    {
      path: '/nodes',
      component: () => import('../views/node-list.vue'),
    },
    {
      path: '/links',
      component: () => import('../views/link-list.vue'),
    },
  ],
})

export default router
