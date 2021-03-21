<template>
  <div id="app">
    <test-page />
  </div>
</template>

<script>
import TestPage from '@/components/TestPage.vue'

export default {
  name: 'App',
  components: {
    TestPage,
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Roboto:wght@400;500&display=swap');

#app {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#app .sandbox-monofont {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 400;
  font-size: 14px;
}
</style>
