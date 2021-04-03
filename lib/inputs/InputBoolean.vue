<template>
  <div class="vue-sandbox-boolean-input">
    <input type="checkbox" :checked="value" @change="update" />
    <span>{{ value ? 'Yes' : 'No' }}</span>
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

<style>
.vue-sandbox-boolean-input > input {
  transform: scale(1.25);
  padding: 0.1em;
  margin-right: 0.5em;
}
</style>
