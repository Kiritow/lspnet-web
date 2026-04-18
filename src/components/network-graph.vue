<template>
  <div class="network-wrapper">
    <div ref="cyRef" class="network-graph"></div>
    <div v-if="!hasElements" class="empty-state">No Node</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import cytoscape from 'cytoscape'

const cyRef = ref<HTMLDivElement | null>(null)
let cyInstance: cytoscape.Core | null = null

// 允许从组件外部传入元素数据（nodes + edges），若未传入则使用 mock
const props = defineProps<{
  elements?: cytoscape.ElementDefinition[]
  layoutName?: string
}>()

const hasElements = computed(() => (props.elements?.length ?? 0) > 0)

onMounted(() => {
  const initialElements = props.elements;

  cyInstance = cytoscape({
    container: cyRef.value,

    elements: initialElements,

    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'text-wrap': 'wrap',
          'text-max-width': '96px',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': 12,
          'color': '#222',
          'background-color': 'data(color)',
          'width': 'label',
          'height': 'label',
          'padding': '16px',
          'text-margin-y': 0
        }
      },
      {
        selector: 'node[type = "core"]',
        style: {
          'shape': 'round-rectangle',
          'padding': '20px',
          'font-size': 13
        }
      },
      {
        selector: 'node[type = "edge"]',
        style: {
          'shape': 'round-rectangle',
          'padding': '16px',
          'font-size': 12
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': 'data(color)',
          'target-arrow-color': 'data(color)',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': 10,
          'text-rotation': 'autorotate',
          'text-margin-y': -8
        }
      },
      {
        selector: ':selected',
        style: {
          'border-width': 3,
          'border-color': '#f59e0b',
          'line-color': '#f59e0b',
          'target-arrow-color': '#f59e0b'
        }
      }
    ],

    layout: {
      name: props.layoutName ?? 'cose',
    }
  })

  // Example interaction
  cyInstance.on('tap', 'node', (evt) => {
    const node = evt.target
    console.log('Clicked:', node.data())
  })

  // 当外部传入的 elements 发生变化时，刷新图数据
  watch(() => props.elements, (newVal) => {
    if (cyInstance === null) return
    cyInstance.elements().remove()
    if (newVal === undefined) return;
    cyInstance.add(newVal)
    cyInstance.layout({ name: props.layoutName ?? 'cose' }).run()
  }, { deep: true })
})

onBeforeUnmount(() => {
  if (cyInstance) {
    cyInstance.destroy()
    cyInstance = null
  }
})
</script>

<style scoped>
.network-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.network-graph {
  width: 100%;
  height: 500px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
}

.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.08em;
  pointer-events: none;
}
</style>
