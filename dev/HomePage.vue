<template>
  <main>
    <select v-model="selectedComponent" class="component-selector">
      <option v-for="comp in components" :key="comp.name" :value="comp">
        {{ comp.name }}
      </option>
    </select>
    <component-sandbox v-if="targetComponent" :component="targetComponent" />
  </main>
</template>

<script>
import { ComponentSandbox } from '@lib'

const libContext = require.context('@lib', true, /\.vue$/)
const testContext = require.context('./components/test', true, /\.vue$/)

export default {
  name: 'HomePage',
  components: {
    ComponentSandbox,
  },
  data() {
    return {
      selectedComponent: undefined,
    }
  },
  computed: {
    components() {
      return [
        {
          name: '===== Library Components =====',
          path: '',
        },
        ...libContext.keys().map((path) => ({
          name: path.replace(/^.*\/(\w+)\.vue$/, '$1'),
          component: () => libContext(path).default,
        })),
        {
          name: '===== Tests Components =====',
          path: '',
        },
        ...testContext.keys().map((path) => ({
          name: path.replace(/^.*\/(\w+)\.vue$/, '$1'),
          component: () => testContext(path).default,
        })),
      ]
    },
    targetComponent() {
      if (!this.selectedComponent || !this.selectedComponent.component) {
        return undefined
      }
      return this.selectedComponent.component()
    },
  },
}
</script>

<style scoped>
.component-selector {
  margin-bottom: 2rem;
  font-family: inherit;
  font-size: 1rem;
}
</style>
