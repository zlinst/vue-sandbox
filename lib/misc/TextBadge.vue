<template>
  <span class="vue-sandbox-badge" @click="(e) => $emit('click', e)">
    <slot>{{ text }}</slot>
  </span>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: undefined,
    },
  },
}
</script>

<style>
.vue-sandbox-badge {
  padding: 0.15em 0.35em;
  border-radius: 0.3em;
  white-space: nowrap;
}
</style>
