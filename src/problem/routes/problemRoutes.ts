export default [
    {
      path:'/problem',
      name: 'Problem',
      components:{
        main: () => import('@/problem/views/ProblemIndex.vue')
      }
    }
];