<template>
  <div class="vue-sandbox-number-input">
    <input type="number" :value="value" @input="update" />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: undefined,
    },
  },
  methods: {
    update(e) {
      const num = parseFloat(e.target.value)
      if (isNaN(num)) return
      this.$emit('input', num)
    },
  },
}
</script>

<style>
.vue-sandbox-number-input input {
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  display: block;
  box-sizing: border-box;
  width: 100%;
}
</style>
