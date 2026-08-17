<script setup lang="ts">
import { computed, ref } from 'vue'
import { NODE_CATALOG, type NodeCategory, type NodeKind } from '@/nodes/catalog'

const CATEGORY_META: Record<NodeCategory, { label: string; accent: string; icon: string }> = {
  trigger: { label: 'Triggers', accent: 'text-amber-400', icon: 'bi-lightning-charge-fill' },
  whatsapp: { label: 'WhatsApp', accent: 'text-emerald-400', icon: 'bi-chat-dots' },
  logic: { label: 'Logic', accent: 'text-sky-400', icon: 'bi-diagram3' },
  integration: { label: 'Integrations', accent: 'text-pink-400', icon: 'bi-cloud-arrow-up-fill' },
}

const query = ref('')

const grouped = computed(() => {
  const g: Record<NodeCategory, [NodeKind, (typeof NODE_CATALOG)[NodeKind]][]> = {
    trigger: [],
    whatsapp: [],
    logic: [],
    integration: [],
  }
  const q = query.value.toLowerCase()
  for (const [kind, meta] of Object.entries(NODE_CATALOG) as [
    NodeKind,
    (typeof NODE_CATALOG)[NodeKind],
  ][]) {
    if (q && !meta.label.toLowerCase().includes(q) && !meta.description.toLowerCase().includes(q))
      continue
    g[meta.category].push([kind, meta])
  }
  return g
})

function onDragStart(e: DragEvent, kind: NodeKind) {
  e.dataTransfer?.setData('waxum/node', kind)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

const CATEGORY_ICON_STYLES: Record<NodeCategory, string> = {
  trigger: 'text-amber-400',
  whatsapp: 'text-emerald-400',
  logic: 'text-sky-400',
  integration: 'text-pink-400',
}
</script>

<template>
  <aside class="node-palette w-72 flex flex-col">
    <div class="px-4 py-3 border-b border-white/5 space-y-3">
      <div>
        <div class="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">Palette</div>
        <div class="text-[11px] text-white/40 mt-0.5">Drag onto the canvas</div>
      </div>
      <div class="relative">
        <v-icon
          name="bi-search"
          class="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30"
          scale="0.8" />
        <input
          v-model="query"
          placeholder="Search nodes"
          aria-label="Search nodes"
          class="studio-input w-full pl-8 pr-2 py-2 text-xs" />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-3 space-y-5">
      <section v-for="(items, cat) in grouped" :key="cat" v-show="items.length">
        <div class="flex items-center gap-1.5 mb-2 pl-1">
          <v-icon
            :name="CATEGORY_META[cat].icon"
            scale="0.7"
            :class="CATEGORY_META[cat].accent" />
          <div class="text-[10px] tracking-widest text-white/50 uppercase font-semibold">
            {{ CATEGORY_META[cat].label }}
          </div>
        </div>
        <div class="space-y-1.5">
          <div
            v-for="[kind, meta] in items"
            :key="kind"
            :draggable="true"
            @dragstart="(e) => onDragStart(e, kind)"
            class="palette-item group cursor-grab active:cursor-grabbing rounded-xl flex items-start gap-2.5 p-2.5">
            <div
              class="w-8 h-8 rounded-md bg-charcoal-800 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-emerald-500/30 transition"
              :class="CATEGORY_ICON_STYLES[cat]">
              <v-icon :name="meta.icon" scale="0.9" />
            </div>
            <div class="min-w-0">
              <div class="text-[13px] font-semibold leading-tight">{{ meta.label }}</div>
              <div class="text-[11px] text-white/40 mt-0.5 leading-snug">{{ meta.description }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </aside>
</template>
