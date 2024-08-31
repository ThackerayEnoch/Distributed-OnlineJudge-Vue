import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: () => import('@/layout/AppLayout.vue'),
      children: [
        {
          path:'/',
          name:'Home',
          components: {
            main: () => import('@/views/homeIndex/Index.vue')
          }
        }
      ]
    },
    {
      path:'/auth/login',
      name: 'Login',
      component: () => import('@/views/auth/SignIn.vue')
    },
    {
      path: '/:pathMatch(.*)*', // 捕获所有未匹配路径
      name: 'NotFound',
      component: () => import('@/components/NotFound.vue'), // 替换为 404 组件路径
    }
  ]
})

export default router
