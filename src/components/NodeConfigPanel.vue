<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ node: any }>()
const emit = defineEmits<{ close: []; update: [key: string, value: unknown] }>()

type FieldKind = 'text' | 'number' | 'textarea' | 'json'

function fieldKind(value: unknown): FieldKind {
  if (typeof value === 'number') return 'number'
  if (typeof value === 'object' && value !== null) return 'json'
  if (typeof value === 'string' && value.length > 60) return 'textarea'
  return 'text'
}

function fieldLabel(key: string): string {
  return key.replace(/_/g, ' ')
}

const fields = computed(() => {
  const config = props.node?.data?.config ?? {}
  return Object.keys(config).map((key) => ({
    key,
    kind: fieldKind(config[key]),
    value: config[key],
  }))
})

function onInput(key: string, kind: FieldKind, raw: string) {
  if (kind === 'number') {
    emit('update', key, raw === '' ? 0 : Number(raw))
    return
  }
  if (kind === 'json') {
    try {
      emit('update', key, JSON.parse(raw))
    } catch {
      // leave the last-valid config value in place until the JSON is valid again
    }
    return
  }
  emit('update', key, raw)
}
</script>

<template>
  <aside class="node-config-panel flex flex-col border-l border-white/10 bg-charcoal-900 w-80 shrink-0">
    <div class="flex items-center justify-between px-4 h-14 border-b border-white/10">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
          <v-icon :name="node.data.icon" scale="0.75" />
        </div>
        <div class="text-sm font-semibold truncate">{{ node.data.label }}</div>
      </div>
      <button
        class="secondary-button w-7 h-7 flex items-center justify-center rounded-md"
        aria-label="Close config panel"
        @click="emit('close')">
        <v-icon name="bi-x-lg" scale="0.7" />
      </button>
    </div>

    <p class="px-4 py-3 text-xs text-white/40">{{ node.data.description }}</p>

    <div class="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
      <p v-if="fields.length === 0" class="text-xs text-white/30">This node has no configurable fields.</p>

      <label v-for="field in fields" :key="field.key" class="flex flex-col gap-1">
        <span class="text-[11px] uppercase tracking-wide text-white/40">{{ fieldLabel(field.key) }}</span>

        <textarea
          v-if="field.kind === 'textarea'"
          class="node-config-input"
          rows="3"
          :value="field.value"
          @input="onInput(field.key, field.kind, ($event.target as HTMLTextAreaElement).value)" />

        <textarea
          v-else-if="field.kind === 'json'"
          class="node-config-input font-mono text-xs"
          rows="4"
          :value="JSON.stringify(field.value, null, 2)"
          @input="onInput(field.key, field.kind, ($event.target as HTMLTextAreaElement).value)" />

        <input
          v-else
          class="node-config-input"
          :type="field.kind === 'number' ? 'number' : 'text'"
          :value="field.value"
          @input="onInput(field.key, field.kind, ($event.target as HTMLInputElement).value)" />
      </label>
    </div>
  </aside>
</template>

<style scoped>
.node-config-input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem 0.625rem;
  font-size: 0.8125rem;
  color: inherit;
}
.node-config-input:focus {
  outline: none;
  border-color: rgba(16, 185, 129, 0.5);
}
</style>
