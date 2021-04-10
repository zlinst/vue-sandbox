<template>
  <div></div>
</template>

<script>
export default {
  props: {
    funcProp: {
      type: Function,
      default: (a, b) => a + b,
    },
    objectProp: {
      type: Object,
      default: () => ({ a: 5, b: 9 }),
    },
    stringProp: {
      type: String,
      default: 'Hello, World',
    },
  },
}
</script>
