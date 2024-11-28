export default [
    {
      path:'/auth',
      name: 'Auth',
      components:{
        app: () => import('@/auth/views/AuthIndex.vue')
      },
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
    }
];