<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

type Flow = { id: string; name: string; updated_at: number }

const router = useRouter()
const flows = ref<Flow[]>([])
const loading = ref(true)
const query = ref('')
const showCreate = ref(false)
const newName = ref('')
const creating = ref(false)
const loadError = ref('')

const filtered = computed(() =>
  flows.value.filter((f) => f.name.toLowerCase().includes(query.value.toLowerCase())),
)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await fetch('/api/flows')
    if (!res.ok) throw new Error('Unable to load workflows')
    flows.value = await res.json()
  } catch {
    flows.value = []
    loadError.value = 'Studio could not reach its SQLite workspace.'
  } finally {
    loading.value = false
  }
}

async function create() {
  if (!newName.value.trim()) return
  creating.value = true
  try {
    const res = await fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.value.trim() }),
    })
    if (!res.ok) return
    const flow = (await res.json()) as Flow
    router.push(`/flow/${flow.id}`)
  } finally {
    creating.value = false
    showCreate.value = false
    newName.value = ''
  }
}

async function remove(id: string, evt: Event) {
  evt.preventDefault()
  evt.stopPropagation()
  if (!confirm('Delete this flow?')) return
  await fetch(`/api/flows/${id}`, { method: 'DELETE' })
  await load()
}

function fmtDate(ts: number) {
  const d = new Date(ts)
  const now = Date.now()
  const diff = now - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(load)
</script>

<template>
  <div class="studio-shell min-h-full bg-charcoal-900">
    <header class="studio-header sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="Waxum Studio" class="w-9 h-9" />
          <div>
            <div class="text-[15px] font-semibold tracking-tight leading-none">Waxum Studio</div>
            <div class="text-[10px] text-white/40 mt-1 tracking-[0.14em] uppercase">
              Automation workspace
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="status-pill" title="Local and Cloudflare persistence use SQLite">
            <span class="status-dot"></span>
            SQLite ready
          </div>
          <a
            href="https://github.com/imtaqin/waxum-studio"
            target="_blank"
            class="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition">
            <v-icon name="bi-github" scale="1.1" />
          </a>
          <a
            href="https://waxum.imtaqin.id"
            target="_blank"
            class="text-xs text-white/50 hover:text-emerald-500 transition px-3 py-1.5 rounded-lg hover:bg-white/5">
            waxum.imtaqin.id
          </a>
        </div>
      </div>
    </header>

    <main class="relative max-w-6xl mx-auto px-6 py-12">
      <div class="mb-10 max-w-2xl">
        <div class="eyebrow">Workflow operations</div>
        <h1 class="hero-title mt-3">Build automations that<br class="hidden sm:block" /> stay beautifully simple.</h1>
        <p class="text-white/50 text-[15px] leading-7 mt-4 max-w-xl">
          Design reliable WhatsApp journeys on a focused canvas, with every change saved automatically.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h2 class="text-base font-semibold tracking-tight">Your workflows</h2>
          <p class="text-white/40 text-xs mt-1">{{ flows.length }} {{ flows.length === 1 ? 'workflow' : 'workflows' }} in this workspace</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <v-icon
              name="bi-search"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              scale="0.9" />
            <input
              v-model="query"
              placeholder="Search flows"
              aria-label="Search workflows"
              class="studio-input pl-9 pr-3 py-2 text-sm w-56" />
          </div>
          <button
            @click="showCreate = true"
            class="primary-button inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm">
            <v-icon name="bi-plus-lg" scale="0.9" />
            <span>New flow</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-live="polite">
        <div
          v-for="i in 6"
          :key="i"
          class="surface-card rounded-xl p-5 animate-pulse">
          <div class="h-4 bg-white/5 rounded w-2/3 mb-3"></div>
          <div class="h-3 bg-white/5 rounded w-1/2"></div>
        </div>
      </div>

      <div v-else-if="loadError" class="empty-surface rounded-2xl p-12 text-center">
        <div class="inline-flex w-12 h-12 rounded-2xl bg-red-400/10 items-center justify-center mb-4 text-red-300">
          <v-icon name="bi-exclamation-triangle" scale="1.35" />
        </div>
        <div class="text-base font-semibold mb-1">Workspace unavailable</div>
        <div class="text-white/45 text-sm mb-5">{{ loadError }}</div>
        <button @click="load" class="secondary-button px-4 py-2 rounded-lg text-sm">Try again</button>
      </div>

      <div
        v-else-if="!flows.length"
        class="empty-surface rounded-2xl p-16 text-center">
        <div class="inline-flex w-14 h-14 rounded-2xl bg-emerald-500/10 items-center justify-center mb-4">
          <v-icon name="bi-lightning-charge-fill" scale="1.8" class="text-emerald-500" />
        </div>
        <div class="text-lg font-semibold mb-1">No flows yet</div>
        <div class="text-white/50 text-sm mb-6 max-w-xs mx-auto">
          Kick off your first WhatsApp automation. Drag nodes, connect them, and let it run.
        </div>
        <button
          @click="showCreate = true"
          class="primary-button inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm">
          <v-icon name="bi-plus-lg" scale="0.9" />
          <span>Create your first flow</span>
        </button>
      </div>

      <div v-else-if="filtered.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="f in filtered"
          :key="f.id"
          :to="`/flow/${f.id}`"
          class="surface-card group relative block rounded-xl p-5">
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <v-icon name="bi-diagram3" scale="1.1" />
            </div>
            <button
              @click="(e) => remove(f.id, e)"
              :aria-label="`Delete ${f.name}`"
              class="card-action opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-white/5">
              <v-icon name="bi-trash" scale="0.9" />
            </button>
          </div>
          <div class="mt-4 font-semibold text-[15px] leading-tight">{{ f.name }}</div>
          <div class="mt-1 text-xs text-white/40 font-mono truncate">{{ f.id }}</div>
          <div class="mt-4 flex items-center gap-1 text-[11px] text-white/40 uppercase tracking-wider">
            <v-icon name="bi-clock" scale="0.7" />
            <span>{{ fmtDate(f.updated_at) }}</span>
          </div>
        </router-link>
      </div>
      <div v-else class="empty-surface rounded-2xl p-12 text-center">
        <div class="text-base font-semibold">No matching workflows</div>
        <div class="text-white/45 text-sm mt-1">Try a different name or clear your search.</div>
        <button @click="query = ''" class="secondary-button px-4 py-2 rounded-lg text-sm mt-5">Clear search</button>
      </div>
    </main>

    <!-- create modal -->
    <div
      v-if="showCreate"
      class="modal-scrim fixed inset-0 z-50 flex items-center justify-center px-4"
      @click.self="showCreate = false">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-flow-title"
        class="modal-panel rounded-2xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <v-icon name="bi-file-earmark-plus" scale="1" />
            </div>
            <div id="new-flow-title" class="font-semibold">New workflow</div>
          </div>
          <button
            @click="showCreate = false"
            class="text-white/40 hover:text-white p-1 rounded">
            <v-icon name="bi-x-lg" scale="0.9" />
          </button>
        </div>
        <label class="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Name</label>
        <input
          v-model="newName"
          @keyup.enter="create"
          placeholder="Untitled flow"
          class="studio-input w-full px-3 py-2.5 text-sm"
          autofocus />
        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="showCreate = false"
            class="secondary-button px-4 py-2 rounded-lg text-sm">
            Cancel
          </button>
          <button
            @click="create"
            :disabled="creating || !newName.trim()"
            class="primary-button px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm">
            {{ creating ? 'Creating…' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
