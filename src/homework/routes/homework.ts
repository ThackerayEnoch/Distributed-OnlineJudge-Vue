export default [
    {
      path:'/homeworks',
      name: 'Homework',
      components:{
        main: () => import('@/homework/views/homeworkIndex.vue')
      }
    },
];