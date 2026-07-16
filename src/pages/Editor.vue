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
import CustomNode from '@/components/CustomNode.vue'
import { NODE_CATALOG, type NodeKind } from '@/nodes/catalog'

const props = defineProps<{ id: string }>()

const { addNodes, onConnect, addEdges, toObject } = useVueFlow()
const nodes = ref<any[]>([])
const edges = ref<any[]>([])
const saving = ref(false)
const savedRecently = ref(false)
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

let saveTimer: ReturnType<typeof setTimeout> | null = null
async function save() {
  saving.value = true
  try {
    const graph = toObject()
    await fetch(`/api/flows/${props.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ graph }),
    })
    savedRecently.value = true
    setTimeout(() => (savedRecently.value = false), 2000)
  } finally {
    saving.value = false
  }
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 800)
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
    type: 'waxum',
    position: { x: e.clientX - 360, y: e.clientY - 100 },
    data: {
      kind,
      label: meta.label,
      icon: meta.icon,
      category: meta.category,
      description: meta.description,
      config: { ...meta.defaults },
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  })
}

onConnect((params) => addEdges([{ ...params, animated: true }]))

onMounted(load)

watch([nodes, edges], () => scheduleSave(), { deep: true })
</script>

<template>
  <div class="h-full flex bg-charcoal-900">
    <NodePalette />

    <div class="flex-1 flex flex-col">
      <header class="flex items-center justify-between h-14 px-4 border-b border-white/5 bg-charcoal-800/50 backdrop-blur">
        <div class="flex items-center gap-3">
          <router-link
            to="/"
            class="inline-flex items-center gap-1 text-white/50 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/5 transition">
            <v-icon name="bi-arrow-left" scale="0.9" />
            <span>Flows</span>
          </router-link>
          <div class="w-px h-5 bg-white/10"></div>
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <v-icon name="bi-diagram3" scale="0.75" />
            </div>
            <div class="text-sm font-semibold">{{ flowName }}</div>
            <div class="text-[11px] text-white/30 font-mono">{{ id.slice(0, 8) }}</div>
          </div>
        </div>
        <div class="flex items-center gap-1 text-xs">
          <template v-if="saving">
            <v-icon name="bi-arrow-clockwise" class="text-emerald-500 animate-spin" scale="0.85" />
            <span class="text-white/50">Saving</span>
          </template>
          <template v-else-if="savedRecently">
            <v-icon name="bi-check2-circle" class="text-emerald-500" scale="0.85" />
            <span class="text-emerald-500">Saved</span>
          </template>
          <template v-else>
            <span class="text-white/30">Auto-save on</span>
          </template>
        </div>
      </header>

      <div
        class="flex-1 relative"
        @drop="drop"
        @dragover.prevent>
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="{ waxum: (CustomNode as any) }"
          :default-viewport="{ x: 0, y: 0, zoom: 1 }"
          fit-view-on-init>
          <Background pattern-color="#152922" :gap="28" />
          <Controls position="bottom-right" />
          <MiniMap pannable zoomable position="bottom-left" node-color="#10b981" mask-color="#0a0f0dcc" />
        </VueFlow>
      </div>
    </div>
  </div>
</template>
