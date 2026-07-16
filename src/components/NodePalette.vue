<script setup lang="ts">
import { computed } from 'vue'
import { NODE_CATALOG, type NodeCategory, type NodeKind } from '@/nodes/catalog'

const CATEGORY_LABEL: Record<NodeCategory, string> = {
  trigger: 'Triggers',
  whatsapp: 'WhatsApp',
  logic: 'Logic',
  integration: 'Integrations',
}

const grouped = computed(() => {
  const g: Record<NodeCategory, [NodeKind, (typeof NODE_CATALOG)[NodeKind]][]> = {
    trigger: [],
    whatsapp: [],
    logic: [],
    integration: [],
  }
  for (const [kind, meta] of Object.entries(NODE_CATALOG) as [
    NodeKind,
    (typeof NODE_CATALOG)[NodeKind],
  ][]) {
    g[meta.category].push([kind, meta])
  }
  return g
})

function onDragStart(e: DragEvent, kind: NodeKind) {
  e.dataTransfer?.setData('waxum/node', kind)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <aside class="w-72 border-r border-white/5 bg-charcoal-800 flex flex-col">
    <div class="px-4 py-3 border-b border-white/5">
      <div class="text-xs font-bold tracking-widest text-emerald-500 uppercase">Palette</div>
      <div class="text-xs text-white/40 mt-0.5">Drag onto the canvas</div>
    </div>

    <div class="flex-1 overflow-y-auto p-3 space-y-4">
      <section v-for="(items, cat) in grouped" :key="cat">
        <div class="text-[10px] tracking-widest text-white/40 uppercase font-semibold mb-2 pl-1">
          {{ CATEGORY_LABEL[cat] }}
        </div>
        <div class="space-y-1.5">
          <div
            v-for="[kind, meta] in items"
            :key="kind"
            :draggable="true"
            @dragstart="(e) => onDragStart(e, kind)"
            class="cursor-grab active:cursor-grabbing rounded-lg border border-white/5 bg-charcoal-900 px-3 py-2 hover:border-emerald-500/50 transition">
            <div class="text-sm font-semibold">{{ meta.label }}</div>
            <div class="text-xs text-white/40 mt-0.5 leading-snug">{{ meta.description }}</div>
          </div>
        </div>
      </section>
    </div>
  </aside>
</template>
