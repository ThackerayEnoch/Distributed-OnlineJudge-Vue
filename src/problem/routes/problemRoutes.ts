export default [
    {
      path:'/problems',
      name: 'Problem',
      components:{
        main: () => import('@/problem/views/ProblemIndex.vue')
      }
    },
    {
      path :'/problem/:pid',
      name: 'ProblemDetail',
      components:{
        main: () => import('@/problem/views/ProblemDetail.vue')
      },
      props: {
        main: true
      }
    },
    {
      path :'/statuses',
      name: 'Status',
      components:{
        main: () => import('@/problem/views/StatusIndex.vue')
      }
    },
    {
      path :'/status/:submitId',
      name: 'StatusDetail',
      components:{
        main: () => import('@/problem/views/StatusDetail.vue')
      },
      props: {
        main:true
      }
    }
];