<template>
  <section class="sandbox-prop">
    <div class="sandbox-prop__header">
      <text-badge class="sandbox-prop__name sandbox-monofont" v-text="name" />
      <div class="sandbox-prop__type-badges">
        <text-badge
          v-for="(typeInfo, index) in typeList"
          :key="index"
          class="sandbox-prop__type-badge"
          :class="{
            highlighted: index === typeIndex,
            inactive: customInput,
          }"
          size="sm"
          @click="() => customInput || switchPropType(index)"
          v-text="typeInfo.name"
        />
      </div>
    </div>
    <div v-if="tagList.length" class="sandbox-prop__tags">
      <text-badge
        v-for="tag in tagList"
        :key="tag.name"
        class="sandbox-prop__tag sandbox-monofont"
        :class="`sandbox-prop__tag__${tag.classMod}`"
        v-text="tag.name"
      />
    </div>
    <div class="sandbox-prop__input">
      <slot v-bind="{ valueProxy, attrs: $attrs }">
        <component
          :is="inputComponent"
          v-if="inputComponent"
          v-model="valueProxy"
        />
        <div v-else class="sandbox-prop__input-unknown">Unknown prop type.</div>
      </slot>
    </div>
  </section>
</template>

<script>
import TextBadge from './misc/TextBadge.vue'
import { isArray, getPropInfo } from './shared.js'

export default {
  components: {
    TextBadge,
  },
  props: {
    value: {
      type: undefined,
      default: undefined,
    },
    name: {
      type: String,
      default: '',
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
    tagList() {
      return [
        ...(this.isModel ? [{ name: 'V-Model', classMod: 'vmodel' }] : []),
        ...(this.required ? [{ name: 'Required', classMod: 'required' }] : []),
        ...(this.unlisted ? [{ name: 'Unlisted', classMod: 'unlisted' }] : []),
      ]
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
    customInput() {
      return !!this.$slots.default
    },
  },
  methods: {
    switchPropType(index) {
      this.typeIndex = index
    },
  },
}
</script>

<style lang="scss" scoped>
.sandbox-prop__header {
  display: flex;
  align-items: center;
  font-size: 0.85em;
}

.sandbox-prop__name {
  background-color: #264b6d;
}

.sandbox-prop__type-badges {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.sandbox-prop__type-badge {
  margin: 0.15em;
  background-color: #769cbf;

  &.highlighted {
    background-color: darken(#769cbf, 15%);
  }
  &:not(.inactive) {
    cursor: pointer;
  }
}

.sandbox-prop__tags {
  margin-top: 0.3em;
  margin-bottom: 0.5em;
}

.sandbox-prop__tag {
  font-size: 0.75em;
  background-color: initial;
  border: 1px solid;

  &__vmodel {
    color: #718bff;
  }
  &__required {
    color: #ff6666;
  }
  &__unlisted {
    color: #575757;
  }

  &:not(:first-child) {
    margin-left: 0.5em;
  }
}

.sandbox-prop__input {
  margin-top: 0.5em;
}
</style>
