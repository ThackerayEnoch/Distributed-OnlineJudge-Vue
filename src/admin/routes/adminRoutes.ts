export default [
    {
      path:'/admin',
      name: 'Admin',
      components:{
        app: () => import('@/admin/views/AdminLayout.vue')
      },
      children: [
        {
          path: '/admin',
          redirect: '/admin/dashboard'
        },
        {
          path:'/admin/dashboard',
          name:'Dashboard',
          components: {
            admin: () => import('@/admin/views/DashboardView.vue')
          }
        },
        {
          path:'/admin/problems/list',
          name:'ProblemList',
          components: {
            admin: () => import('@/admin/views/ProblemList.vue')
          }
        },
        {
          path:'/admin/perm',
          name:'Permissions',
          components: {
            admin: () => import('@/admin/views/PermManage.vue')
          },
          children:[
            {
              path:'/admin/perm',
              redirect: '/admin/perm/users'
            },
            {
              path:'/admin/perm/users',
              name:'PermUsers',
              components:{
                perm:()=>import('@/admin/components/perm/UserRoleManage.vue')
              }
            },
            {
              path:'/admin/perm/roles',
              name:'PermRoles',
              components:{
                perm:()=>import('@/admin/components/perm/RoleManage.vue')
              }
            },
            {
              path:'/admin/perm/permissions',
              name:'PermPermissions',
              components:{
                perm:()=>import('@/admin/components/perm/PermItem.vue')
              }
            }
          ]
        }
      ]
    }
];