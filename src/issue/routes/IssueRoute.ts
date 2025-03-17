export default [
    {
        path:'/issues',
        name: 'Issues',
        components:{
          main: () => import('@/issue/views/IssueReport.vue')
        },
    },
    {
      path:'/issues/new',
      name: 'NewIssue',
      components:{
        main: () => import('@/issue/views/IssueCreate.vue')
      },
    },
    {
      path:'/issue/:id',
      name: 'Issue',
      components:{
        main: () => import('@/issue/views/IssueDetail.vue')
      },
      prop:true
    }
]