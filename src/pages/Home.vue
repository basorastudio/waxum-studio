<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

type Flow = { id: string; name: string; updated_at: number }

const router = useRouter()
const flows = ref<Flow[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await fetch('/api/flows')
    flows.value = res.ok ? await res.json() : []
  } catch {
    flows.value = []
  } finally {
    loading.value = false
  }
}

async function create() {
  const name = prompt('Flow name?')?.trim()
  if (!name) return
  const res = await fetch('/api/flows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) return
  const flow = (await res.json()) as Flow
  router.push(`/flow/${flow.id}`)
}

onMounted(load)
</script>

<template>
  <div class="min-h-full bg-charcoal-900">
    <header class="border-b border-white/5">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="Waxum Studio" class="w-8 h-8" />
          <div>
            <div class="text-lg font-bold tracking-tight leading-none">Waxum Studio</div>
            <div class="text-xs text-white/50 mt-0.5">Visual WhatsApp workflow builder</div>
          </div>
        </div>
        <a
          href="https://waxum.imtaqin.id"
          target="_blank"
          class="text-sm text-white/60 hover:text-emerald-500"
          >waxum.imtaqin.id</a
        >
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-10">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold tracking-tight">Flows</h1>
        <button
          @click="create"
          class="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-charcoal-900 font-semibold text-sm">
          New flow
        </button>
      </div>

      <div v-if="loading" class="text-white/40 text-sm">Loading…</div>

      <div
        v-else-if="!flows.length"
        class="border border-white/5 rounded-2xl p-12 text-center bg-charcoal-800">
        <div class="text-white/60 mb-1">No flows yet.</div>
        <div class="text-white/40 text-sm">Hit "New flow" to build your first workflow.</div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="f in flows"
          :key="f.id"
          :to="`/flow/${f.id}`"
          class="block border border-white/5 rounded-xl p-5 bg-charcoal-800 hover:border-emerald-500/40 transition">
          <div class="font-semibold">{{ f.name }}</div>
          <div class="text-xs text-white/40 mt-1 font-mono">{{ f.id }}</div>
        </router-link>
      </div>
    </main>
  </div>
</template>
