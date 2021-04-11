<template>
  <div class="vue-sandbox-string-input">
    <textarea type="text" rows="1" :value="value" @input="update"></textarea>
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

<style>
.vue-sandbox-string-input > textarea {
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  display: block;
  box-sizing: border-box;
  width: 100%;
  resize: vertical;
}
</style>
