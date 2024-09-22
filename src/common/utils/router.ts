import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: () => import('@/common/views/layout/AppLayout.vue'),
      children: [
        {
          path:'/',
          name:'Home',
          components: {
            main: () => import('@/common/views/Index.vue')
          }
        }
      ]
    },
    {
      path:'/auth',
      name: 'Auth',
      component: () => import('@/auth/views/AuthIndex.vue'),
      children: [
        {
          path: '',
          redirect: '/auth/login'
        },
        {
          path:'/auth/login',
          name:'Login',
          components: {
            auth: () => import('@/auth/views/SignIn.vue')
          }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*', // 捕获所有未匹配路径
      name: 'NotFound',
      component: () => import('@/common/components/NotFound.vue'), // 替换为 404 组件路径
    }
  ]
})

export default router
