export default [
    {
      // url路径 /:xxx代表路径参数 如/profile/ppy/info 其中ppy为username会传参到组件中
      // RESTful API风格 以资源为中心 一切皆资源
      path:'/demo/:username',
      // 路由名称和组件名称保持一致
      name: 'demo',
      // 主页面(View) 显示在@/common/views/layout/AppLayout.vue的name=main的那个<routerView>中
      components:{
        main: () => import('@/demo/views/DemoViews.vue')
      },
      // url参数传递给组件
      props: true,
      // 动态重定向到子路由 如我访问/demo/ppy 会自动携带url参数重定向到/demo/ppy/info 为了加载子路由
      redirect: (to:any) => `/demo/${to.params.username}/info`,
      // 子路由
      children: [
        {
            path: 'info',
            name: 'info',
            // 让父组件的名为view1的<router-view>加载子组件
            components: {
                view1: () => import('@/demo/components/DemoOne.vue')
            },
            // url参数传递给组件
            props: true
        },
        {
            path: 'form',
            name: 'form',
            components: {
              view1: () => import('@/demo/components/DemoTwo.vue')
            },
            props: true
        }
      ],
    }
];