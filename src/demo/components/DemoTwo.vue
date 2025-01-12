<template>
    <div class="flex justify-center items-center w-full py-8">
        <!--为了使用vee-validate参数校验必须使用原始form-->
        <!--onSubmit是最终用于提交的函数-->
        <form @submit.prevent="onSubmit" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div class="mb-3">
                <!--PrimeVue组件-->
                <InputGroup>
                    <InputGroupAddon>
                        <i class="pi pi-id-card"></i>
                    </InputGroupAddon>
                    <InputText placeholder="肥厚名" v-model="username" class="w-full" />
                </InputGroup>
                <!--校验失败-->
                <small v-show="usernameError != ''" class="text-red-500">{{ usernameError }}</small>
            </div>
            <div class="mb-3">
                <InputGroup>
                    <InputGroupAddon>
                        <i class="pi pi-id-card"></i>
                    </InputGroupAddon>
                    <InputText placeholder="手机号" v-model="phone" class="w-full" />
                </InputGroup>
                <!--校验失败-->
                <small v-show="phoneError != ''" class="text-red-500">{{ phoneError }}</small>
            </div>
            <div class="flex flex-wrap gap-4 mb-4">
                <div class="flex items-center gap-2">
                    <RadioButton v-model="gender" inputId="gender1" name="pizza" value="male" />
                    <label for="gender1">男</label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton v-model="gender" inputId="gender2" name="pizza" value="female" />
                    <label for="gender2">女</label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton v-model="gender" inputId="gender4" name="pizza" value="other" />
                    <label for="gender4">不愿透露</label>
                </div>
                <!--校验失败-->
                <small v-show="genderError != ''" class="text-red-500">{{ genderError }}</small>
            </div>
            <Button label="提交" class="w-full p-button-primary" type="submit" />
        </form>
    </div>
</template>

<script lang="ts">
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
export default {
    name: 'DemoTwo',
    setup() {
        // 1.定义表单验证规则
        const schema = yup.object({
            username: yup.string().required('填好你的肥厚名！'),
            phone: yup.string().required('手机号填上！'),
            gender: yup.string().required('选性别！'),
        });
        // 2.使用 useField 绑定各个表单字段
        const { value: username, errorMessage: usernameError } = useField<string>('username');
        const { value: phone, errorMessage: phoneError } = useField<string>('phone');
        const { value: gender, errorMessage: genderError } = useField<String>('gender');
        // 3.定义 useForm 用于表单验证和处理
        const { handleSubmit } = useForm({
            validationSchema: schema,
        });
        // 4.验证并提交表单
        const onSubmit = handleSubmit(async values => {
            console.log(values);
        })
        const fun = () => {
            console.log(username.value, phone.value, gender.value);
        }
        return {
            username,
            phone,
            gender,
            usernameError,
            phoneError,
            genderError,
            onSubmit,
            fun,
        }
    }
}
</script>

<style scoped></style>