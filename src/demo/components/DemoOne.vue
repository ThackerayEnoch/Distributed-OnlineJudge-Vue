<template>
    <div class="flex justify-center items-center w-full py-8">
        <!-- 禁止手动设置背景颜色 -->
        <!-- 如果主题切换背景出问题时加上这俩CSS类 bg-white dark:bg-gray-800 -->
        <Card>
            <template #title>
                <div class="flex justify-between items-center">
                    <span>当前登录用户信息</span>
                    <Avatar size="large" shape="circle" class="mr-2"
                        image="https://r2.wcfs.dokidokiujn.ninja/WCFS/User/ProfilePhoto/a.jpg" />
                </div>
            </template>
            <template #content>
                <p class="m-0">
                    <span>用户名：</span>
                    <span>{{ user.originalUsername }}</span>
                </p>
                <p class="m-0">
                    <span>邮箱：</span>
                    <span>{{ user.email }}</span>
                </p>
                <p class="m-0">
                    <span>状态：</span>
                    <span>{{ user.status === 1 ? '正常' : '被封禁' }}</span>
                </p>
                <p class="m-0">
                    <span>注册时间：</span>
                    <span>{{ user.createTime }}</span>
                </p>
                <p class="m-0">
                    <span>个人信息最后更新时间：</span>
                    <span>{{ user.updateTime }}</span>
                </p>

            </template>
            <template #footer>
                <div class="flex gap-4 mt-1">
                    <Button label="取消" @click="CancelSubmit" severity="secondary" outlined class="w-full" />
                    <Button label="确认" @click="ConfirmSubmit" class="w-full" />
                </div>
            </template>
        </Card>
    </div>
    <div>
        <Button label="GetUserInfo" @click="UserInfo" />
    </div>
</template>
<!--lang=ts必须要写-->
<script lang="ts">
// 除了PrimeVue其他要使用必须import
import { ResponseCode } from '@/common/constant/ResponseCode';
import { getUserInfo } from '@/demo/demoAPI';
import type { Demo } from '@/demo/demoAPI';
import { onMounted, reactive } from 'vue';
// 右上角小提示的常见方法的封装
import globalMessage from '@/common/utils/toast';

export default {
    name: 'DemoOne',
    props: ['username'],
    setup(props) {
        // 使用 reactive 定义状态对象 props是url传递的参数
        const state = reactive({
            username: props.username,
        });
        // 使用 reactive 定义用户信息对象 
        // 数据类型使用你在API那里定义的接口类型(demoAPI.ts里写的API请求的结果的那个封装接口)
        const user = reactive<Partial<Demo.UserInfoResData>>({}); // Partial 允许字段为空
        // 异步函数获取用户信息
        const UserInfo = async () => {
            // 同步调用 getUserInfo 函数
            const result = await getUserInfo();
            // 判断返回结果是否成功
            if (result != undefined && result.status === ResponseCode.SUCCESS) {
                // 业务逻辑
                Object.assign(user, result.data);
            }
            // 明确需要自己处理错误请使用try catch捕捉APIError进行手动处理 不然不要在这里写错误处理代码 
        };
        // Button事件函数
        // 常规消息提示必须使用globalMessage的方法进行右上角小提示
        // 必要的时候其他的该用用 如弹窗
        const CancelSubmit = () => {
            // 无标题的成功提示
            // 有那些函数自行查看@/common/utils/toast.ts文件
            globalMessage.successNoTitle('什么肥猴！！！！');
        };
        const ConfirmSubmit = () => {
            globalMessage.info('lang', '巨型饭桶！！！！');
        };
        // 生命周期钩子函数 用于在组件挂载后调用 加载页面的时候通过网络请求准备页面必须的数据 如视频 用户信息等
        // 异步OnMounted防止页面加载时请求API失败抛出的APIError被Vue静默处理导致全局异常处理器无法捕捉 无法提示给用户
        onMounted(async () => {
            // 这里必须同步等待
            await UserInfo();
            // 如果需要调用多个函数调用API准备数据 这样写 (不要拉下await关键字)
            /**
             *  const [userInfo, demoData] = await Promise.all([
                fetchUserInfo(), // 获取用户信息
                fetchDemoData(), // 获取Demo数据
                ]);
             */
            // 禁止这样写 
            /**
             *  await fetchUserInfo();
                await fetchDemoData();
             */
        });
        return {
            state,
            user,
            UserInfo,
            CancelSubmit,
            ConfirmSubmit,
        };
    },
};
</script>

<style scoped>
/* 你的样式代码 */
</style>