export default [
    {
      path: '/profile/:id',
      name: 'Profile',
      components: {
        main: () => import('@/user/views/ProfileView.vue'),
      },
      props: true,
    }
];