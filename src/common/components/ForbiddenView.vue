<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
    router.back();
};
</script>

<template>
    <div class="forbidden-body">
        <div class="container">
            <div class="error-code">403</div>

            <h1>访问被拒绝</h1>
            <p>抱歉，您没有权限访问该页面或资源。<br>如果您认为这是个错误，请联系系统管理员。</p>

            <a @click.prevent="goBack" class="action-btn">返回上一页</a>

            <div class="footer">
                济南大学OJ系统 · 访问已记录
            </div>
        </div>
    </div>
</template>

<style scoped>
.forbidden-body {
    font-family: "Microsoft YaHei", sans-serif;
    background-color: #f4f7f9;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80%;
    margin: auto;
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

/* 403 错误代码样式，使用深红色表示禁止访问 */
.error-code {
    font-size: 80px;
    font-weight: bold;
    color: #c0392b;
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

/* 按钮样式 */
.action-btn {
    display: inline-block;
    text-decoration: none;
    background-color: #34495e;
    color: white;
    padding: 14px 35px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
}

.action-btn:hover {
    background-color: #2c3e50;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 73, 94, 0.3);
}

.footer {
    margin-top: 50px;
    font-size: 12px;
    color: #aaa;
    border-top: 1px solid #eee;
    padding-top: 20px;
}
</style>