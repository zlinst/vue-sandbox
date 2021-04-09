<template>
  <select v-model="selectedComponent" class="component-selector">
    <option v-for="(comp, index) in components" :key="index" :value="comp">
      {{ comp.name }}
    </option>
  </select>
</template>

<script>
const libContext = require.context('@lib', true, /\.vue$/)
const testContext = require.context('./test', true, /\.vue$/)

export default {
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
        },
        ...libContext.keys().map((path) => ({
          name: path.replace(/^.*\/(\w+)\.vue$/, '$1'),
          component: () => libContext(path).default,
        })),
        {
          name: '===== Tests Components =====',
        },
        ...testContext.keys().map((path) => ({
          name: path.replace(/^.*\/(\w+)\.vue$/, '$1'),
          component: () => testContext(path).default,
        })),
      ]
    },
  },
  watch: {
    selectedComponent(newValue) {
      this.$emit('select', newValue)
    },
  },
}
</script>

<style scoped>
.component-selector {
  font-family: inherit;
  font-size: 1rem;
}
</style>
