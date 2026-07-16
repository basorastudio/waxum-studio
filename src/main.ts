import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import Home from './pages/Home.vue'
import Editor from './pages/Editor.vue'
import { OhVueIcon } from './icons'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/flow/:id', component: Editor, props: true },
  ],
})

createApp(App)
  .component('v-icon', OhVueIcon)
  .use(createPinia())
  .use(router)
  .mount('#app')
