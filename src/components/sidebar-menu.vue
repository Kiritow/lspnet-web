<template>
  <el-aside width="180px">
    <el-menu :router="true" :collapse="false" mode="vertical">
      <RouterLink v-for="item in sidearMenu" :key="item.index" :to="item.index">
        <el-menu-item v-if="item.display" :index="item.index">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </RouterLink>
    </el-menu>
  </el-aside>
</template>

<script setup lang="ts">
import { sidearMenu } from '@/menu';
</script>
