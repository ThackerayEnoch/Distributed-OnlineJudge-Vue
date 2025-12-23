export default [
    {
      path:'/homeworks',
      name: 'Homework',
      components:{
        main: () => import('@/homework/views/homeworkIndex.vue')
      },
    },

    {
      path: '/homework/:homeworkId',
      name: 'HomeworkDetail',
      components: {
        main: () => import('@/homework/views/homeworkDetail.vue')
      },
      children:[
        {
          path: '/homework/:homeworkId',
          redirect: '/homework/:homeworkId/intro'
        },
        {
          path: '/homework/:homeworkId/intro',
          name: 'HomeworkIntro',
          components: {
            homeworkTab: () => import('@/homework/components/IntroComponent.vue')
          },
          props: {
            homeworkTab: true
          }
        },
        {
          path:'/homework/:homeworkId/problems',
          name: 'HomeworkProblem',
          components: {
            homeworkTab: () => import('@/homework/components/ProblemsComponent.vue')
          },
          props: {
            homeworkTab: true
          }
        },
        {
          path:'/homework/:homeworkId/ranking',
          name: 'HomeworkRanking',
          components: {
            homeworkTab: () => import('@/homework/components/RankingComponent.vue')
          },
          props: {
            homeworkTab: true
          }
        },
        {
          path : '/homework/:homeworkId/submit',
          name: 'HomeworkSubmit',
          components: {
            homeworkTab: () => import('@/problem/views/StatusIndex.vue')
          },
          props: {
            homeworkTab: true
          }
        },
        {
          path:'/homework/:homeworkId/notifications',
          name: 'HomeworkNotifications',
          components: {
            homeworkTab: () => import('@/homework/components/NotificationComponent.vue')
          },
          props: {
            homeworkTab: true
          }
        },
        {
          path:'/homework/:homeworkId/clarifications',
          name: 'HomeworkClarifications',
          components: {
            homeworkTab: () => import('@/homework/components/ClarificationsComponent.vue')
          },
          props: {
            homeworkTab: true
          }
        },
        {
          path:'/homework/:homeworkId/admin-clarifications',
          name: 'HomeworkAdminClarifications',
          components: {
            homeworkTab: () => import('@/homework/components/AdminClarificationsComponents.vue')
          },
          props: {
            homeworkTab: true
          }
        }
      ],
      props: {
        main: true,
      }
    }
];