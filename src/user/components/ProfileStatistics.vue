<template>
    <div class="profile-statistics">
        <h2>Profile Statistics</h2>
        <!-- Add your statistics content here -->
    </div>
</template>

<script>
import { reactive } from 'vue';
export default {
    name: 'ProfileStatistics',
    props: ['username'],
    setup(props) {
        const state = reactive({
            usernmae: props.username,
        });
        return {
            state,
        };
    },
};
</script>

<style scoped></style>