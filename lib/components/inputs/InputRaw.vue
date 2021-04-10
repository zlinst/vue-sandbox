<template>
  <div class="vue-sandbox-unknown-input">
    <code-block :content="serialisedValue" :max-lines="3" />
  </div>
</template>

<script>
import CodeBlock from '../misc/CodeBlock.vue'
import { stringify } from '../../utils/helpers'

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
      return stringify(this.value)
    },
  },
}
</script>
