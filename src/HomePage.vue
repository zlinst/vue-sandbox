<template>
  <main>
    <select v-model="selectedComponent" style="margin-bottom: 2em">
      <option value="">-- Pick a component --</option>
      <option v-for="comp in components" :key="comp.name" :value="comp.value">
        {{ comp.name }}
      </option>
    </select>
    <component-sandbox v-if="targetComponent" :component="targetComponent" />
  </main>
</template>

<script>
import { ComponentSandbox } from '@lib'
const libComponents = require.context('@lib', true, /\.vue$/)

export default {
  name: 'HomePage',
  components: {
    ComponentSandbox,
  },
  data() {
    return {
      selectedComponent: '',
    }
  },
  computed: {
    components() {
      return libComponents.keys().map((path) => ({
        name: path.replace(/^.*\/(\w+)\.vue$/, '$1'),
        value: path,
      }))
    },
    targetComponent() {
      if (!this.selectedComponent) return undefined
      return libComponents(this.selectedComponent).default
    },
  },
}
</script>
