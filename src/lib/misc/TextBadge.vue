<template>
  <span class="sandbox-badge" @click="(e) => $emit('click', e)">
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

<style lang="scss" scoped>
.sandbox-badge {
  font-size: inherit;
  padding: 0.15em 0.35em;
  font-size: inherit;
  border-radius: 0.3em;

  color: white;
  background-color: #555;
}
</style>
