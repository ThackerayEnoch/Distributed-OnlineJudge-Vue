import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: () => import('@/common/views/layout/AppLayout.vue'),
      children: [
        // --------首页---------
        {
          path:'/',
          name:'Home',
          components: {
            main: () => import('@/common/views/Index.vue')
          }
        },
        // --------首页---------
        // --------用户个人信息---------
        {
          path: '/profile/:username',
          name: 'Profile',
          components: {
            main: () => import('@/user/views/ProfileView.vue'), // 父级组件
          },
          props: true, // 将 `:username` 作为 prop 传递给组件
          redirect: (to) => `/profile/${to.params.username}/info`, // 动态重定向
          children: [
            {
              path: 'info', // 子路由 path 不需要再加 `/profile/:username`
              name: 'ProfileInfo',
              components: {
                profile: () => import('@/user/components/ProfileInfo.vue'), // 绑定到父级的 `profile` 视图
              },
              props: true,
            },
            {
              path: 'statistics',
              name: 'ProfileStatistics',
              components: {
                profile: () => import('@/user/components/ProfileStatistics.vue'),
              },
              props: true,
            },
          ],
        }
        // --------用户个人信息---------        
      ]
    },
    // --------登录注册---------
    {
      path:'/auth',
      name: 'Auth',
      component: () => import('@/auth/views/AuthIndex.vue'),
      children: [
        {
          path: '/auth',
          redirect: '/auth/login'
        },
        {
          path:'/auth/login',
          name:'Login',
          components: {
            auth: () => import('@/auth/views/SignIn.vue')
          }
        },
        {
          path:'/auth/register',
          name:'Register',
          components: {
            auth: () => import('@/auth/views/SignUp.vue')
          }
        }
      ]
    },
    // --------登录注册---------
    // --------404---------
    {
      path: '/:pathMatch(.*)*', // 捕获所有未匹配路径
      name: 'NotFound',
      component: () => import('@/common/components/NotFound.vue'), // 替换为 404 组件路径
    }
    // --------404---------
  ]
})

export default router
