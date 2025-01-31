export default [
    {
      path:'/homeworks',
      name: 'Homework',
      components:{
        main: () => import('@/homework/views/HomeworkIndex.vue')
      },
    },
];