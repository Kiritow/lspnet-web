<template>
  <UserHeader />
  <el-container>
    <SidebarMenu />
    <el-container>
      <el-main>
        <el-main>
          <RouterView />
        </el-main>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter, RouterView } from 'vue-router'
import SidebarMenu from './components/sidebar-menu.vue';
import UserHeader from './components/user-header.vue';

const router = useRouter();

</script>
