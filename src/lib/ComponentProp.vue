<template>
  <section class="sandbox-prop">
    <div class="sandbox-prop__header">
      <badge class="sandbox-monofont">{{ name }}</badge>
    </div>
    <div class="sandbox-prop__input">
      <slot v-bind="{ valueProxy }">
        <component :is="inputComponent" v-model="valueProxy" />
      </slot>
    </div>
  </section>
</template>

<script>
import Badge from './misc/Badge.vue'
import { getInputComponent } from './core.js'

export default {
  components: {
    Badge,
  },
  props: {
    value: {
      type: undefined,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: [Function, Object, Array],
      default: undefined,
    },
    isModel: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: undefined,
    },
    required: {
      type: Boolean,
      default: false,
    },
    unlisted: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    valueProxy: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      },
    },
    flattenType() {
      if (!this.type) return 'any'
      if (typeof this.type.name === 'string') {
        return this.type.name.toLowerCase()
      }
      return '*'
    },
    inputComponent() {
      return getInputComponent(this.flattenType)
    },
  },
}
</script>

<style lang="scss" scoped>
.sandbox-prop {
  padding: 0.75em;
  border-top: 1px solid #dae6ef;
}

.sandbox-prop__input {
  padding-top: 0.5em;
}
</style>
