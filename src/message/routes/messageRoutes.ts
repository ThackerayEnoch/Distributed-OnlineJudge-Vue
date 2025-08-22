export default [
    {
        path: '/messages',
        name: 'messages',
        components:{
            main:() => import('@/message/views/MessageList.vue'),
        }
    },
    {
        path: '/messages/:id',
        name: 'messageDetail',
        components:{ main: () => import('@/message/views/MessageDetail.vue')},
        props: true
    }
];
