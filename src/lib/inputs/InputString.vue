<template>
  <div class="input-string">
    <input
      type="text"
      :value="value"
      @input="(e) => $emit('input', e.target.value)"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: undefined,
    },
  },
}
</script>

<style lang="scss" scoped>
.input-string input {
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  display: block;
  width: 100%;
}
</style>
