<template>
  <section class="sandbox-prop">
    <div class="sandbox-prop__header">
      <badge class="sandbox-prop__name-badge sandbox-monofont" v-text="name" />
      <div class="sandbox-prop__type-badges">
        <badge
          v-for="(typeInfo, index) in typeList"
          :key="index"
          class="sandbox-prop__type-badge"
          size="sm"
        >
          {{ typeInfo.name }}
        </badge>
      </div>
    </div>
    <div class="sandbox-prop__input">
      <slot v-bind="{ valueProxy, $attrs }">
        <component
          :is="inputComponent"
          v-if="inputComponent"
          v-model="valueProxy"
        />
      </slot>
    </div>
  </section>
</template>

<script>
import Badge from './misc/Badge.vue'
import { getPropInfo } from './core.js'
import { isArray } from './utils.js'

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
      type: [Function, Array, String],
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
  data() {
    return {
      typeIndex: 0,
    }
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
    typeList() {
      if (isArray(this.type)) {
        return this.type.map((t) => getPropInfo(t))
      }

      return [getPropInfo(this.type)]
    },
    inputComponent() {
      return this.typeList[this.typeIndex]?.component
    },
  },
}
</script>

<style lang="scss" scoped>
.sandbox-prop__header {
  display: flex;
  align-items: center;
}

.sandbox-prop__name-badge {
  background-color: #264b6d;
}

.sandbox-prop__type-badges {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.sandbox-prop__type-badge {
  margin: 0.15em;
  cursor: pointer;
}

.sandbox-prop__input {
  padding-top: 0.5em;
}
</style>
