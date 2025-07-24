<template>
  Link List

  <el-row style="margin-top: 20px;">
    <el-button type="primary" @click="handleClickCreateLink">Create Link</el-button>
    <el-button type="primary" @click="handleClickRenderAll">Render All</el-button>
    <el-button type="primary" @click="handleClickDisplayTopology">Topology</el-button>
  </el-row>

  <el-table :data="tableData" stripe :fit="true">
    <el-table-column prop="id" label="Link ID"></el-table-column>
    <el-table-column label="SourceNode">
      <template #default="{ row }">
        {{ nodeInfoMap.get(row.srcNodeId)?.nodeName ?? "<Node>" }} ({{ row.srcNodeId }})
      </template>
    </el-table-column>
    <el-table-column label="DestinationNode">
      <template #default="{ row }">
        {{ nodeInfoMap.get(row.dstNodeId)?.nodeName ?? "<Node>" }} ({{ row.dstNodeId }})
      </template>
    </el-table-column>
    <el-table-column prop="connectIP" label="Connect IP"></el-table-column>
    <el-table-column prop="dstListenPort" label="Connect Port"></el-table-column>
    <el-table-column prop="enabled" label="Enabled"></el-table-column>
    <el-table-column prop="ready" label="Ready"></el-table-column>
    <el-table-column label="Create Time" width="180">
      <template #default="{ row }">
        {{ formatLocalTime(row.createTime) }}
      </template>
    </el-table-column>
    <el-table-column label="Last Sync Time" width="180">
      <template #default="{ row }">
        {{ formatLocalTime(row.lastSync) }}
      </template>
    </el-table-column>
    <el-table-column label="Action">
      <template #default="{ row }">
        <el-button type="primary" @click="handleClickEditConfig(row.id)">Edit Config</el-button>
        <el-button type="danger" disabled>Delete</el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog v-model="isDialogVisible" title="Create Link">
    <el-form :model="formValues" ref="ruleFormRef" :rules="formRules" status-icon>
      <el-form-item label="Source Node ID" prop="fromNodeId">
        <el-select v-model="formValues.fromNodeId" placeholder="Select Source Node" :rules="formRules.fromNodeId">
          <el-option v-for="item in nodeListDropdown" :key="item.id" :label="item.nodeName + ' (' + item.id + ')'"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Destination Node ID" prop="toNodeId">
        <el-select v-model="formValues.toNodeId" placeholder="Select Destination Node" :rules="formRules.toNodeId">
          <el-option v-for="item in nodeListDropdown" :key="item.id" :label="item.nodeName + ' (' + item.id + ')'"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Connect IP (Optional)" prop="connectIp">
        <el-input placeholder="Enter Connect IP" v-model="formValues.connectIp"></el-input>
      </el-form-item>
      <el-form-item label="Connect Port (Optional)" prop="connectPort">
        <el-input-number v-model="formValues.connectPort"></el-input-number>
      </el-form-item>
      <el-row>
        <el-text>Extra Configs</el-text>
        <VAceEditor v-model:value="formValues.extra" lang="json" theme="chrome"
          style="height: 20vh; width: 100%; margin-top: 5px" :options="{
            wrap: true,
            indentedSoftWrap: true,
          }" />
      </el-row>
      <el-form-item style="margin-top: 10px;">
        <el-button type="primary" @click="handleSubmitNewLink(ruleFormRef)">Create</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-dialog v-model="isEditDialogVisible" :title="editDialogTitle">
    <el-form :model="editFormValues" ref="editFormRef" :rules="formRules" status-icon>
      <el-form-item label="Source Node ID" prop="fromNodeId">
        <el-select v-model="editFormValues.fromNodeId" placeholder="Select Source Node" :rules="formRules.fromNodeId"
          disabled>
          <el-option v-for="item in nodeListDropdown" :key="item.id" :label="item.nodeName + ' (' + item.id + ')'"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Destination Node ID" prop="toNodeId">
        <el-select v-model="editFormValues.toNodeId" placeholder="Select Destination Node" :rules="formRules.toNodeId"
          disabled>
          <el-option v-for="item in nodeListDropdown" :key="item.id" :label="item.nodeName + ' (' + item.id + ')'"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Connect IP (Optional)" prop="connectIp">
        <el-input placeholder="Enter Connect IP" v-model="editFormValues.connectIp"></el-input>
      </el-form-item>
      <el-form-item label="Connect Port (Optional)" prop="connectPort">
        <el-input-number v-model="editFormValues.connectPort"></el-input-number>
      </el-form-item>
      <el-row>
        <el-text>Extra Configs</el-text>
        <VAceEditor v-model:value="editFormValues.extra" lang="json" theme="chrome"
          style="height: 20vh; width: 100%; margin-top: 5px" :options="{
            wrap: true,
            indentedSoftWrap: true,
          }" />
      </el-row>
      <el-form-item style="margin-top: 10px;">
        <el-button type="primary" @click="handleSubmitEditLink(editFormRef)">Update</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-dialog v-model="isTopologyVisible" title="Cluster Topology" width="80%">
    <img :src="topologyImageUrl" alt="Cluster Topology" style="width: 100%; height: auto;">
  </el-dialog>

</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import * as api from '@/api';
import { ElMessage, ElNotification, type FormInstance } from 'element-plus';
import { formatLocalTime } from '@/utils';
import { VAceEditor } from 'vue3-ace-editor';
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-chrome";
import extSearchboxUrl from 'ace-builds/src-noconflict/ext-searchbox?url';
import ace from 'ace-builds';
ace.config.setModuleUrl('ace/ext/searchbox', extSearchboxUrl);

const route = useRoute();
const tableData = ref<api.LinkTemplateInfo[]>([]);
const nodeInfoMap = ref<Map<number, api.NodeInfo>>(new Map());
const isDialogVisible = ref(false);
const nodeListDropdown = ref<api.NodeInfo[]>([]);
const ruleFormRef = ref<FormInstance>()

interface FormType {
  fromNodeId: number;
  toNodeId: number;
  connectIp: string;
  connectPort: number;
  extra: string;
}

const formValues = ref<FormType>({
  fromNodeId: 0,
  toNodeId: 0,
  connectIp: '',
  connectPort: 0,
  extra: '{}',
});

const isEditDialogVisible = ref(false);
const editFormRef = ref<FormInstance>()
const editDialogTitle = ref('Edit Link');
const editTemplateId = ref(0);
const editFormValues = ref<FormType>({
  fromNodeId: 0,
  toNodeId: 0,
  connectIp: '',
  connectPort: 0,
  extra: '{}',
});

const formRules = ref({
  fromNodeId: [
    { required: true, message: 'Please enter the source node ID', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Node ID must be greater than 0', trigger: 'blur' },
  ],
  toNodeId: [
    { required: true, message: 'Please enter the destination node ID', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Node ID must be greater than 0', trigger: 'blur' },
  ],
  connectIp: [
    { required: false, message: 'Please enter the connect IP', trigger: 'blur' },
    { type: 'string', validator: validateIPorHost, message: 'Invalid IP or Host', trigger: 'blur' },
  ],
});

const isTopologyVisible = ref(false);
const topologyImageUrl = ref('');

function validateIPorHost(rule: unknown, value: unknown, callback: (err?: unknown) => void) {
  if (typeof value !== 'string') {
    console.error(`value is not a string. type: ${typeof value} value: ${value}`);
    callback(new Error('value must be a string'));
    return;
  }

  if (value.length < 1) {
    console.error(`value is empty. type: ${typeof value} value: ${value}`);
    callback(new Error('value must not be empty'));
    return;
  }

  if ([...value].every(c => (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c === '.' || c === '-' || c === ':')) {
    callback();
  } else {
    console.error(`value contains invalid characters. type: ${typeof value} value: ${value}`);
    callback(new Error('Invalid IP or Host. contains invalid characters'));
  }
}

async function handleClickCreateLink() {
  const clusterId = parseInt(route.query.clusterId as string, 10) || 0;
  nodeListDropdown.value = await api.fetchNodeList(clusterId);

  formValues.value = {
    fromNodeId: 0,
    toNodeId: 0,
    connectIp: '',
    connectPort: 0,
    extra: JSON.stringify({
      "ospf": {
        "cost": 10,
        "ping": false,
        "offset": 0,
      }
    }, null, 2),
  };

  isDialogVisible.value = true;
}

async function handleSubmitNewLink(ruleFormRef: FormInstance | undefined) {
  if (!ruleFormRef) {
    return;
  }
  console.log(ruleFormRef);
  const isFormValid = await ruleFormRef.validate();
  if (!isFormValid) {
    ElNotification({
      title: 'Error',
      message: 'Please fill in the form correctly',
      type: 'error',
    });
    return;
  }

  const clusterId = parseInt(route.query.clusterId as string, 10) || 0;

  const res = await api.createLinkTemplate(clusterId, formValues.value.fromNodeId, formValues.value.toNodeId, formValues.value.connectIp, formValues.value.connectPort, formValues.value.extra);
  ElMessage({
    message: res.message,
    type: 'success',
  });

  isDialogVisible.value = false;
  await loadClusterLinks();
}

async function handleClickRenderAll() {
  const res = await api.refreshAllLinks();
  ElMessage({
    message: res.message,
    type: 'success',
  });
}

async function loadClusterLinks() {
  const clusterId = parseInt(route.query.clusterId as string, 10) || 0;
  const res = await api.fetchLinkTemplates(clusterId);

  // load node names
  const allNodeIds = new Set<number>();
  res.forEach(item => {
    allNodeIds.add(item.srcNodeId);
    allNodeIds.add(item.dstNodeId);
  });

  const allNodeInfo = await Promise.all(Array.from(allNodeIds).map(id => api.fetchNodeInfo(id)));
  nodeInfoMap.value = new Map(allNodeInfo.map(node => [node.id, node]));

  tableData.value = res;
}

async function handleClickEditConfig(linkId: number) {
  const data = await api.fetchLinkTemplate(linkId);
  editTemplateId.value = data.id;
  editFormValues.value = {
    fromNodeId: data.srcNodeId,
    toNodeId: data.dstNodeId,
    connectIp: data.connectIP,
    connectPort: data.dstListenPort,
    extra: data.extra,
  }
  editDialogTitle.value = `Edit Link ${linkId}`;

  // try to prettify the extra config
  try {
    const parsedExtra = JSON.parse(data.extra);
    editFormValues.value.extra = JSON.stringify(parsedExtra, null, 2);
  } catch (e) {
    console.error('Failed to parse extra config:', e);
  }

  const clusterId = parseInt(route.query.clusterId as string, 10) || 0;
  nodeListDropdown.value = await api.fetchNodeList(clusterId);

  isEditDialogVisible.value = true;
}

async function handleSubmitEditLink(editFormRef: FormInstance | undefined) {
  if (!editFormRef) {
    return;
  }
  const isFormValid = await editFormRef.validate();
  if (!isFormValid) {
    ElNotification({
      title: 'Error',
      message: 'Please fill in the form correctly',
      type: 'error',
    });
    return;
  }

  const res = await api.updateLinkTemplate(editTemplateId.value, editFormValues.value.connectIp, editFormValues.value.connectPort, editFormValues.value.extra);
  ElMessage({
    message: res.message,
    type: 'success',
  });

  isEditDialogVisible.value = false;
  await loadClusterLinks();
}

async function handleClickDisplayTopology() {
  const clusterId = parseInt(route.query.clusterId as string, 10) || 0;
  const svgBlob = await api.loadClusterTopology(clusterId);
  const objectUrl = URL.createObjectURL(svgBlob);
  topologyImageUrl.value = objectUrl;
  isTopologyVisible.value = true;
}

onMounted(async () => {
  await loadClusterLinks();
});

</script>
