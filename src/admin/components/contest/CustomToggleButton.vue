<template>
    <button class="w-16 h-8 flex items-center justify-center rounded-md font-semibold text-xs transition-all"
        :class="modelValue ? 'bg-green-500 text-white' : 'bg-red-500 text-white'" @click="toggle">
        {{ modelValue ? trueLabel : falseLabel }}
    </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    modelValue: [Boolean, Number],
    trueLabel: {
        type: String,
        default: '是',
    },
    falseLabel: {
        type: String,
        default: '否',
    },
});
const emit = defineEmits(['update:modelValue', 'change']);

const toggle = () => {
    const newValue = Boolean(props.modelValue);
    emit('update:modelValue', !newValue);
    emit('change', !newValue);
};
</script>