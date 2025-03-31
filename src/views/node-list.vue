<template>
  Node List

  <el-row style="margin-top: 20px;">
    <el-col :span="4">
      <el-button type="primary" @click="handleClickJoinCluster">Join Cluster</el-button>
    </el-col>
    <el-col :span="16">
      <el-text>Cluster: {{ clusterInfo.name }} ({{ clusterInfo.id }}) UserRole: {{ userClusterRole }}</el-text>
    </el-col>
  </el-row>
  <el-row style="margin-top: 10px;">
    <el-table :data="tableData" stripe :fit="true">
      <el-table-column prop="id" label="Node ID" width="180"></el-table-column>
      <el-table-column prop="nodeName" label="Node Name" width="180"></el-table-column>
      <el-table-column prop="status" label="Status" width="180"></el-table-column>
      <el-table-column label="Last Seen" width="180">
        <template #default="{ row }">
          {{ formatLocalTime(row.lastSeen) }}
        </template>
      </el-table-column>
      <el-table-column label="Update Time" width="180">
        <template #default="{ row }">
          {{ formatLocalTime(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="Action">
        <template #default="{ row }">
          <el-button type="primary" @click="handleClickEditConfig(row.id)">Edit Config</el-button>
          <el-button type="danger" disabled>Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-row>

  <el-dialog v-model="isDialogVisible" title="Join Cluster">
    <el-row>
      <el-button @click="handleCopyToken">Copy</el-button>
    </el-row>

    <pre style="white-space: pre-line;">{{ joinClusterToken }}</pre>
  </el-dialog>

  <el-dialog v-model="isEditDialogVisible" :title="editDialogTitle" :close-on-click-modal="false">
    <el-row>
      <el-button type="primary" @click="submitNodeConfig">Submit</el-button>
    </el-row>
    <el-row style="margin-top: 10px;">
      <VAceEditor v-model:value="editDialogContent" lang="json" theme="chrome" style="height: 50vh; width: 100%"
        :options="{
          wrap: true,
          indentedSoftWrap: true,
        }" />
    </el-row>

  </el-dialog>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import * as api from '@/api';
import { ElMessage } from 'element-plus';
import { formatLocalTime } from '@/utils';
import { VAceEditor } from "vue3-ace-editor";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-chrome";
import extSearchboxUrl from 'ace-builds/src-noconflict/ext-searchbox?url';
import ace from 'ace-builds';
ace.config.setModuleUrl('ace/ext/searchbox', extSearchboxUrl);

const route = useRoute();
const clusterInfo = ref<api.ClusterInfo>({})
const userClusterRole = ref(0);

const tableData = ref<api.NodeInfo[]>([]);

const isDialogVisible = ref(false);
const joinClusterToken = ref('');

const isEditDialogVisible = ref(false);
const editingNodeId = ref(0);
const editDialogTitle = ref('Edit Node Config');
const editDialogContent = ref('');

async function handleClickJoinCluster() {
  const token = await api.createJoinClusterToken(clusterInfo.value.id);
  joinClusterToken.value = token;
  isDialogVisible.value = true;
}

async function handleCopyToken() {
  await navigator.clipboard.writeText(joinClusterToken.value);
  ElMessage({
    message: 'Token copied!',
    type: 'success',
  });
}

async function handleClickEditConfig(nodeId: number) {
  console.log('Edit config for node:', nodeId);

  // load the latest config
  const nodeInfo = await api.fetchNodeInfo(nodeId);

  editDialogTitle.value = `Edit Node Config for <${nodeInfo.nodeName}> (${nodeId})`;
  editingNodeId.value = nodeId;

  if (nodeInfo.config.length > 0) {
    // try to parse it first
    try {
      const config = JSON.parse(nodeInfo.config);
      editDialogContent.value = JSON.stringify(config, null, 2);
    } catch (e) {
      // if failed, just show the raw config
      console.log(`Failed to parse config: ${e}. Using raw config.`);
      editDialogContent.value = nodeInfo.config;
    }
  } else {
    // show a default config
    console.log('No config found. Using default config.');
    editDialogContent.value = JSON.stringify({
      ip: '',
      external: false,
      ddns: false,
      exitNode: false,

      vethCIDR: '',
      allowedTCPPorts: [],
      allowedUDPPorts: [],

      dummy: [{
        name: 'dummy0',
        addressCIDR: '',
        mtu: 1420,
      }],
      ospf: {
        area: 10,
        cost: 1,
        auth: '',
      }
    }, null, 2);
  }

  isEditDialogVisible.value = true;
}

async function submitNodeConfig() {
  if (editingNodeId.value === 0) {
    ElMessage({
      message: 'Invalid node ID',
      type: 'error',
    });
    return;
  }

  // submit the config
  await api.updateNodeConfig(editingNodeId.value, editDialogContent.value);
  ElMessage({
    message: 'Config updated successfully',
    type: 'success',
  });

  isEditDialogVisible.value = false;
}

async function loadClusterInfo() {
  const clusterId = parseInt(route.query.clusterId as string, 10) || 0;
  const res = await api.fetchCluster(clusterId);
  clusterInfo.value = res.cluster;
  userClusterRole.value = res.role;
}

async function loadNodeList() {
  const res = await api.fetchNodeList(clusterInfo.value.id);
  tableData.value = res;
}

onMounted(async () => {
  await loadClusterInfo();
  await loadNodeList();
});

</script>
