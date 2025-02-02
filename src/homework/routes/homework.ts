export default [
    {
      path:'/homeworks',
      name: 'Homework',
      components:{
        main: () => import('@/homework/views/homeworkIndex.vue')
      },
    },

    {
      path: '/homework/:hid',
      name: 'HomeworkDetail',
      components: {
        main: () => import('@/homework/views/homeworkDetail.vue')
      },
      props: {
        main: true
      }
    }
];