export default [
    {
      path: '/profile/:username',
      name: 'Profile',
      components: {
        main: () => import('@/user/views/ProfileView.vue'),
      },
      props: true,
      redirect: (to:any) => `/profile/${to.params.username}/info`,
      children: [
        {
          path: 'info',
          name: 'ProfileInfo',
          components: {
            profile: () => import('@/user/components/ProfileInfo.vue'),
          },
          props: true,
        },
        {
          path: 'statistics',
          name: 'ProfileStatistics',
          components: {
            profile: () => import('@/user/components/ProfileStatistics.vue'),
          },
          props: true,
        },
      ],
    }
];