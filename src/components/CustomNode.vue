<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeCategory } from '@/nodes/catalog'

interface NodeData {
  kind: string
  label: string
  icon: string
  category: NodeCategory
  description: string
  config: Record<string, unknown>
}

defineProps<{ data: NodeData }>()

const CATEGORY_STYLES: Record<NodeCategory, { bg: string; border: string; icon: string }> = {
  trigger: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
  },
  whatsapp: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
  },
  logic: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    icon: 'text-sky-400',
  },
  integration: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    icon: 'text-pink-400',
  },
}
</script>

<template>
  <div
    class="workflow-node min-w-[220px] rounded-xl border bg-charcoal-800 overflow-hidden"
    :class="[CATEGORY_STYLES[data.category].border]">
    <Handle type="target" :position="Position.Left" />
    <div class="flex items-center gap-2.5 px-3 py-2.5 border-b border-white/5">
      <div
        class="w-8 h-8 rounded-lg border flex items-center justify-center"
        :class="[CATEGORY_STYLES[data.category].bg, CATEGORY_STYLES[data.category].border, CATEGORY_STYLES[data.category].icon]">
        <v-icon :name="data.icon" scale="1" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-[13px] font-semibold text-white truncate">{{ data.label }}</div>
        <div
          class="text-[10px] uppercase tracking-widest font-semibold"
          :class="[CATEGORY_STYLES[data.category].icon]">
          {{ data.category }}
        </div>
      </div>
    </div>
    <div class="px-3 py-2 text-[11px] text-white/50 leading-snug">{{ data.description }}</div>
    <Handle type="source" :position="Position.Right" />
  </div>
</template>
