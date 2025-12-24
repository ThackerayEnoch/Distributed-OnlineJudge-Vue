<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    router.push('/home');
};
</script>

<template>
    <div class="not-found-body">
        <div class="container">
            <div class="error-code">404</div>

            <h1>页面找不到了</h1>
            <p>抱歉，您访问的页面不存在或已被移除。<br>请检查输入的网址是否正确。</p>

            <a @click.prevent="goHome" class="action-btn">返回网站首页</a>

            <div class="footer">
                济南大学OJ系统 · 找不到目标
            </div>
        </div>
    </div>
</template>

<style scoped>
.not-found-body {
    font-family: "Microsoft YaHei", sans-serif;
    background-color: #f4f7f9;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    width: 100%;
}

.container {
    text-align: center;
    background: white;
    padding: 60px 50px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    max-width: 500px;
    width: 90%;
}

/* 404 错误代码样式：使用中性的深灰色或冷静的蓝色 */
.error-code {
    font-size: 80px;
    font-weight: bold;
    color: #34495e;
    margin: 0 0 20px 0;
    line-height: 1;
}

h1 {
    color: #333;
    font-size: 26px;
    margin: 0 0 15px 0;
}

p {
    line-height: 1.8;
    color: #666;
    font-size: 16px;
    margin-bottom: 35px;
}

/* 返回首页按钮样式 */
.action-btn {
    display: inline-block;
    text-decoration: none;
    background-color: #1a73e8;
    color: white;
    padding: 14px 35px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    outline: none;
}

.action-btn:hover {
    background-color: #1557b0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
}

.action-btn:active {
    transform: translateY(0);
}

.footer {
    margin-top: 50px;
    font-size: 12px;
    color: #aaa;
    border-top: 1px solid #eee;
    padding-top: 20px;
}
</style>