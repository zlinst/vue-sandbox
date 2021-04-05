<template>
  <div id="app">
    <home-page />
  </div>
</template>

<script>
import HomePage from './HomePage.vue'

export default {
  name: 'App',
  components: {
    HomePage,
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

.vue-sandbox-monofont {
  font-family: 'JetBrains Mono', monospace;
}
.vue-sandbox-prop__header-type:not(.inactive).selected {
  font-weight: 500;
}
</style>
