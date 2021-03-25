<template>
  <div class="input-string">
    <input type="text" :value="value" @input="update" />
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
  methods: {
    update(e) {
      this.$emit('input', e.target.value)
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
  box-sizing: border-box;
  width: 100%;
}
</style>
