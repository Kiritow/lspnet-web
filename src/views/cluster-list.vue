<template>
  <el-row>
    Cluster List
  </el-row>
  <el-row style="margin-top: 20px;">
    <el-button type="primary" @click="handleClickCreateCluster">Create Cluster</el-button>
  </el-row>
  <el-row style="margin-top: 20px;">
    <el-table :data="tableData" stripe :fit="true">
      <el-table-column prop="id" label="Cluster ID" width="180"></el-table-column>
      <el-table-column prop="name" label="Cluster Name" width="180"></el-table-column>
      <el-table-column label="Create Time" width="180">
        <template #default="{ row }">
          {{ formatLocalTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="Update Time" width="180">
        <template #default="{ row }">
          {{ formatLocalTime(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="Action">
        <template #default="{ row }">
          <el-button type="primary" @click="handleClickManageNode(row.id)">Manage Nodes</el-button>
          <el-button type="primary" @click="handleClickManageLink(row.id)">Manage Links</el-button>
          <el-button type="danger" disabled>Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-row>

  <el-dialog v-model="isDialogVisible" title="Create Cluster">
    <el-form :model="formValues" ref="ruleFormRef" :rules="formRules" status-icon>
      <el-form-item label="Cluster Name" prop="name">
        <el-input placeholder="Enter Cluster Name" v-model="formValues.name"></el-input>
      </el-form-item>
      <el-form-item label="Cluster Subnet" prop="subnet">
        <el-input placeholder="Enter Cluster Subnet" v-model="formValues.subnet"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmitNewCluster(ruleFormRef)">Create</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { useRouter } from 'vue-router';
import * as api from '@/api';
import { formatLocalTime } from '@/utils';

const router = useRouter();
const tableData = ref<api.ClusterInfo[]>([]);
const isDialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>()

async function handleClickManageNode(clusterId: number) {
  await router.push({
    path: "/nodes",
    query: { clusterId }
  })
}

async function handleClickManageLink(clusterId: number) {
  await router.push({
    path: "/links",
    query: { clusterId }
  })
}

interface FormType {
  name: string;
  subnet: string;
}

const formValues = ref<FormType>({
  name: '',
  subnet: '',
});

const formRules = reactive<FormRules<FormType>>({
  name: [
    { required: true, message: 'Cluster name is required', trigger: 'blur' },
    { min: 3, max: 20, message: 'Length should be 3 to 20', trigger: 'blur' },
  ],
  subnet: [
    { required: true, message: 'Cluster subnet is required', trigger: 'blur' },
    { pattern: /^(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/, message: 'Invalid subnet format', trigger: 'blur' },
  ],
});

function handleClickCreateCluster() {
  isDialogVisible.value = true;
}

async function handleSubmitNewCluster(ruleFormRef: FormInstance | undefined) {
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

  const res = await api.createCluster(formValues.value.name, formValues.value.subnet);
  ElMessage({
    message: res.message,
    type: 'success',
  });

  isDialogVisible.value = false;
}

onMounted(async () => {
  tableData.value = await api.fetchClusters();
})

</script>
