<template>
  <section class="vue-sandbox-prop">
    <div class="vue-sandbox-prop__header">
      <!-- prop name -->
      <text-badge
        class="vue-sandbox-prop__header-name vue-sandbox-monofont"
        v-text="name"
      />
      <!-- prop types -->
      <div class="vue-sandbox-prop__header-types">
        <text-badge
          v-for="(typeInfo, index) in typeList"
          :key="index"
          class="vue-sandbox-prop__header-type"
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

    <!-- prop tags -->
    <div v-if="tagList.length" class="vue-sandbox-prop__tags">
      <text-badge
        v-for="tag in tagList"
        :key="tag.name"
        class="vue-sandbox-prop__tag vue-sandbox-monofont"
        :class="`vue-sandbox-prop__tag__${tag.classMod}`"
        v-text="tag.name"
      />
    </div>

    <!-- input component -->
    <div class="vue-sandbox-prop__input">
      <slot v-bind="{ valueProxy, attrs: $attrs }">
        <component
          :is="inputComponent"
          v-if="inputComponent"
          v-model="valueProxy"
        />
        <div v-else class="vue-sandbox-prop__input-unknown">
          Unknown prop type.
        </div>
      </slot>
    </div>
  </section>
</template>

<script>
import TextBadge from './misc/TextBadge.vue'
import InputString from './inputs/InputString.vue'
import InputBoolean from './inputs/InputBoolean.vue'
import InputNumber from './inputs/InputNumber.vue'
import InputUnknown from './inputs/InputUnknown.vue'
import { isArray, parsePropType } from './shared.js'

export default {
  components: {
    TextBadge,
  },
  props: {
    // prop value
    value: {
      type: undefined,
      default: undefined,
    },
    // prop name
    name: {
      type: String,
      default: '',
    },
    // prop type
    type: {
      type: [Function, Array, String],
      default: undefined,
    },
    // if the prop is the v-model
    isModel: {
      type: Boolean,
      default: false,
    },
    // custom description
    description: {
      type: String,
      default: undefined,
    },
    // if the prop is required
    required: {
      type: Boolean,
      default: false,
    },
    // if the prop is not defined in $props (e.g. supported via $attrs)
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
      const propTypes = isArray(this.type) ? this.type : [this.type]
      return propTypes.map((propType) => {
        const propTypeName = parsePropType(propType)
        switch (propTypeName) {
          case 'String':
            return {
              name: 'String',
              component: InputString,
            }
          case 'Boolean':
            return {
              name: 'Boolean',
              component: InputBoolean,
            }
          case 'Number':
            return {
              name: 'Number',
              component: InputNumber,
            }
        }

        return {
          name: propTypeName || 'Unknown',
          component: InputUnknown,
        }
      })
    },
    inputComponent() {
      return this.typeList[this.typeIndex]
        ? this.typeList[this.typeIndex].component
        : undefined
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

<style lang="scss">
.vue-sandbox-prop__header {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.vue-sandbox-prop__header-name {
  color: white;
  background-color: #264b6d;
}

.vue-sandbox-prop__header-types {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.vue-sandbox-prop__header-type {
  margin: 0.15em;
  color: white;
  background-color: #769cbf;
}

.vue-sandbox-prop__header-type:not(.inactive).highlighted {
  background-color: #4a769e;
}
.vue-sandbox-prop__header-type:not(.inactive) {
  cursor: pointer;
}

.vue-sandbox-prop__tags {
  margin-top: 0.3em;
  margin-bottom: 0.5em;
}

.vue-sandbox-prop__tag {
  font-size: 0.75rem;
  border: 1px solid;
}
.vue-sandbox-prop__tag:not(:first-child) {
  margin-left: 0.5em;
}

.vue-sandbox-prop__tag__vmodel {
  color: #718bff;
}
.vue-sandbox-prop__tag__required {
  color: #ff6666;
}
.vue-sandbox-prop__tag__unlisted {
  color: #575757;
}

.vue-sandbox-prop__input {
  margin-top: 0.5em;
}
</style>
