import z from 'zod'
import { justGet, justPost } from './utils'

const clusterSchema = z.object({
  id: z.number(),
  name: z.string(),
  createTime: z.coerce.date(),
  updateTime: z.coerce.date(),
})

export type ClusterInfo = z.infer<typeof clusterSchema>

export async function fetchClusters() {
  const res = await justGet('/api/admin/cluster/list')
  return clusterSchema.array().parse(res.clusters)
}

export async function createCluster(name: string, subnet: string) {
  const res = await justPost('/api/admin/cluster/create', { name, subnet })
  return z.object({ message: z.string() }).parse(res)
}

export async function fetchCluster(id: number) {
  const res = await justGet(`/api/admin/cluster/info`, { id: `${id}` })
  return z.object({ cluster: clusterSchema, role: z.number() }).parse(res)
}

export async function createJoinClusterToken(id: number) {
  const res = await justPost(`/api/admin/cluster/create_join_token`, { id })
  return z.object({ token: z.string() }).parse(res).token
}

const nodeSchema = z.object({
  id: z.number(),
  clusterId: z.number(),
  nodeName: z.string(),
  config: z.string(),
  status: z.number(),
  lastSeen: z.coerce.date(),
  createTime: z.coerce.date(),
  updateTime: z.coerce.date(),
})

export type NodeInfo = z.infer<typeof nodeSchema>

export async function fetchNodeList(clusterId: number) {
  const res = await justGet('/api/admin/node/list', { clusterId: `${clusterId}` })
  return nodeSchema.array().parse(res.nodes)
}

export async function fetchNodeInfo(nodeId: number) {
  const res = await justGet('/api/admin/node/info', { id: `${nodeId}` })
  return z.object({ node: nodeSchema }).parse(res).node
}

export async function updateNodeConfig(nodeId: number, config: string) {
  const res = await justPost('/api/admin/node/update_config', { id: nodeId, config })
  return z.object({ message: z.string() }).parse(res)
}

export async function createLinkTemplate(
  clusterId: number,
  srcNodeId: number,
  dstNodeId: number,
  dstIP?: string,
  dstPort?: number,
  extra?: string,
) {
  const res = await justPost('/api/admin/link/create', {
    clusterId,
    srcNodeId,
    dstNodeId,
    dstIP,
    dstPort,
    extra,
  })
  return z.object({ message: z.string() }).parse(res)
}

const _linkTemplateSchema = z.object({
  id: z.number(),
  srcNodeId: z.number(),
  srcWgKeyId: z.number(),
  srcListenPort: z.number(),
  dstNodeId: z.number(),
  dstWgKeyId: z.number(),
  dstListenPort: z.number(),
  mtu: z.number(),
  subnetId: z.number(),
  connectIP: z.string(),
  wgLinkClientId: z.number(),
  wgLinkServerId: z.number(),
  extra: z.string(),
  enabled: z.number(),
  ready: z.number(),
  lastCheck: z.coerce.date(),
  lastSync: z.coerce.date(),
  createTime: z.coerce.date(),
  updateTime: z.coerce.date(),
})

export type LinkTemplateInfo = z.infer<typeof _linkTemplateSchema>

export async function fetchLinkTemplates(clusterId: number) {
  const res = await justGet('/api/admin/link/list', { clusterId: `${clusterId}` })
  return z.object({ templates: _linkTemplateSchema.array() }).parse(res).templates
}

export async function refreshAllLinks() {
  const res = await justPost('/api/admin/link/refresh')
  return z.object({ message: z.string() }).parse(res)
}

export async function fetchLinkTemplate(templateId: number) {
  const res = await justGet('/api/admin/link/info', { id: `${templateId}` })
  return z.object({ template: _linkTemplateSchema }).parse(res).template
}

export async function updateLinkTemplate(
  templateId: number,
  connectIP?: string,
  connectPort?: number,
  extra?: string,
) {
  const res = await justPost('/api/admin/link/update', {
    id: templateId,
    connectIP,
    dstPort: connectPort,
    extra,
  })
  return z.object({ message: z.string() }).parse(res)
}

export async function loadClusterTopology(clusterId: number) {
  const res = await justGet('/api/admin/cluster/topology', { clusterId: `${clusterId}` })
  return z.object({
    topology: z.string(),
  }).parse(res).topology;
}
