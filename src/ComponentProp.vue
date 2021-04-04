<template>
  <section class="vue-sandbox-prop">
    <div class="vue-sandbox-prop__header">
      <!-- prop name -->
      <text-badge
        class="vue-sandbox-prop__header-name vue-sandbox-monofont"
        v-text="name"
      />
      <!-- prop actions -->
      <span
        class="vue-sandbox-prop__header-action"
        @click="editMode = !editMode"
        v-text="'Edit'"
      >
      </span>
      <span
        class="vue-sandbox-prop__header-action"
        @click="resetValue()"
        v-text="'Reset'"
      ></span>
      <!-- prop types -->
      <div class="vue-sandbox-prop__header-types">
        <text-badge
          v-for="(typeInfo, index) in typeList"
          :key="index"
          class="vue-sandbox-prop__header-type"
          :class="{
            selected: index === typeIndex,
            inactive: customisedInput || !typeInfo.component,
          }"
          size="sm"
          @click="
            () => {
              if (customisedInput || !typeInfo.component) return
              switchPropType(index)
            }
          "
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
    <div v-show="!editMode" class="vue-sandbox-prop__input">
      <slot>
        <component :is="inputComponent" v-model="valueProxy" />
      </slot>
    </div>

    <!-- prop value editor -->
    <prop-editor
      v-if="editMode"
      :value="value"
      class="vue-sandbox-prop__editor"
      autofocus
      @input="(e) => updateValue(e)"
      @cancel="editMode = false"
    />
  </section>
</template>

<script>
import TextBadge from './misc/TextBadge.vue'
import PropEditor from './misc/PropEditor.vue'
import InputRaw from './inputs/InputRaw.vue'
import { isArray } from './utils.js'
import { getPropDefaultValue, resolvePropType } from './props.js'

export default {
  components: {
    TextBadge,
    PropEditor,
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
    default: {
      type: undefined,
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
    required: {
      type: Boolean,
      default: false,
    },
    // if the prop is not defined in $props (e.g. supported via $attrs)
    unlisted: {
      type: Boolean,
      default: false,
    },
    // the Vue instance holds the prop
    vm: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      typeIndex: 0,
      editMode: false,
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
      return (isArray(this.type) ? this.type : [this.type]).map((propType) =>
        resolvePropType(propType)
      )
    },
    inputComponent() {
      const component = this.typeList[this.typeIndex]
        ? this.typeList[this.typeIndex].component
        : undefined

      return component || InputRaw
    },
    customisedInput() {
      return !!this.$slots.default
    },
  },
  created() {
    // set to the first type that has input component defined
    this.typeIndex = this.typeList.findIndex((t) => t.component)
  },
  methods: {
    switchPropType(index) {
      this.editMode = false
      this.typeIndex = index
    },
    updateValue(value) {
      this.editMode = false
      this.valueProxy = value

      // enter raw mode (un-highlight all prop types)
      this.typeIndex = -1
    },
    resetValue() {
      this.valueProxy = getPropDefaultValue(this.vm, this.type, this.default)
    },
  },
}
</script>

<style>
.vue-sandbox-prop__header {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.vue-sandbox-prop__header-name {
  color: white;
  background-color: #264b6d;
}

.vue-sandbox-prop__header-action {
  font-size: 0.75rem;
  margin-left: 0.5em;
  text-decoration: underline dotted;
  cursor: pointer;
}

.vue-sandbox-prop__header-types {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.vue-sandbox-prop__header-type {
  margin: 0.15em;
  color: white;
  background-color: #4a769e;
}

.vue-sandbox-prop__header-type.inactive {
  opacity: 0.65;
  cursor: not-allowed;
}
.vue-sandbox-prop__header-type:not(.inactive) {
  cursor: pointer;
}
.vue-sandbox-prop__header-type:not(.inactive).selected {
  font-weight: bold;
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

.vue-sandbox-prop__editor {
  margin-top: 0.5em;
}
</style>
