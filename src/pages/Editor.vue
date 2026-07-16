<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { VueFlow, useVueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import NodePalette from '@/components/NodePalette.vue'
import { NODE_CATALOG, type NodeKind } from '@/nodes/catalog'

const props = defineProps<{ id: string }>()

const { addNodes, onConnect, addEdges, toObject, fromObject } = useVueFlow()
const nodes = ref<any[]>([])
const edges = ref<any[]>([])
const saving = ref(false)
const flowName = ref('')

interface LoadedFlow {
  name?: string
  graph?: { nodes?: any[]; edges?: any[] }
}

async function load() {
  const res = await fetch(`/api/flows/${props.id}`)
  if (!res.ok) return
  const data = (await res.json()) as LoadedFlow
  flowName.value = data.name || 'Untitled'
  if (data.graph) {
    nodes.value = data.graph.nodes || []
    edges.value = data.graph.edges || []
  }
}

async function save() {
  saving.value = true
  try {
    const graph = toObject()
    await fetch(`/api/flows/${props.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ graph }),
    })
  } finally {
    saving.value = false
  }
}

function drop(e: DragEvent) {
  e.preventDefault()
  const kind = e.dataTransfer?.getData('waxum/node') as NodeKind | undefined
  if (!kind) return
  const meta = NODE_CATALOG[kind]
  if (!meta) return
  const id = crypto.randomUUID()
  addNodes({
    id,
    type: 'default',
    position: { x: e.clientX - 320, y: e.clientY - 100 },
    data: {
      kind,
      label: meta.label,
      config: { ...meta.defaults },
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  })
}

onConnect((params) => addEdges([{ ...params, animated: true }]))

onMounted(load)

watch([nodes, edges], () => save(), { deep: true })
</script>

<template>
  <div class="h-full flex bg-charcoal-900">
    <NodePalette />

    <div class="flex-1 flex flex-col">
      <header class="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div class="flex items-center gap-3">
          <router-link
            to="/"
            class="text-white/50 hover:text-white text-sm">← Flows</router-link>
          <div class="text-sm font-semibold">{{ flowName }}</div>
          <div class="text-xs text-white/40 font-mono">{{ id }}</div>
        </div>
        <div class="text-xs text-white/40">
          <span v-if="saving">Saving…</span>
          <span v-else>Auto-saved</span>
        </div>
      </header>

      <div
        class="flex-1 relative"
        @drop="drop"
        @dragover.prevent>
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :default-viewport="{ x: 0, y: 0, zoom: 1 }"
          fit-view-on-init>
          <Background pattern-color="#1a2b26" :gap="24" />
          <Controls position="bottom-right" />
          <MiniMap pannable zoomable position="bottom-left" />
        </VueFlow>
      </div>
    </div>
  </div>
</template>
