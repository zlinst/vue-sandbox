<template>
  <div class="input-boolean">
    <input id="toggle" type="checkbox" :checked="value" @change="update" />
    <span class="text">{{ value ? 'Yes' : 'No' }}</span>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    update(e) {
      this.$emit('input', e.target.checked)
    },
  },
}
</script>

<style lang="scss" scoped>
.input-boolean {
  input {
    transform: scale(1.5);
    padding: 0.1em;
  }

  .text {
    margin-left: 0.5em;
  }
}
</style>
