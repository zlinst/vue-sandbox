<template>
  <div class="input-unknown">
    <code-block :content="serialisedValue" />
  </div>
</template>

<script>
import CodeBlock from '../misc/CodeBlock.vue'

export default {
  components: {
    CodeBlock,
  },
  props: {
    value: {
      type: undefined,
      default: undefined,
    },
  },
  computed: {
    serialisedValue() {
      const valueType = typeof this.value

      if (valueType === 'object') {
        return JSON.stringify(this.value, null, 0)
      } else if (valueType === 'string') {
        return `"${this.value}"`
      } else {
        return String(this.value)
      }
    },
  },
}
</script>
