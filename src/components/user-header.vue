<template>
  <div class="login">
    Logged in as {{ user.username }}
  </div>
</template>

<script setup lang="ts">
import { loadUserInfo } from '@/users';
import { onMounted, ref } from 'vue';
const user = ref({ username: '' });

onMounted(async () => {
  user.value = await loadUserInfo();
});

</script>

<style scoped>
.login {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
