<template>
  <div class="vue-sandbox-propeditor">
    <div class="vue-sandbox-propeditor__textarea-wrapper">
      <textarea
        v-model="userInput"
        :rows="rows"
        class="vue-sandbox-monofont"
        :autofocus="autofocus"
        @keydown="handleKeyDown"
      >
      </textarea>
      <text-badge
        class="vue-sandbox-propeditor__mode"
        @click="() => (evalMode = !evalMode)"
      >
        {{ evalMode ? 'Eval Mode' : 'JSON Mode' }}
      </text-badge>
    </div>
    <div class="vue-sandbox-propeditor__footer">
      <div
        v-show="computedError"
        class="vue-sandbox-propeditor__error"
        v-text="computedError"
      ></div>
      <div class="vue-sandbox-propeditor__actions">
        <button
          class="vue-sandbox-propeditor__action-btn"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="vue-sandbox-propeditor__action-btn"
          :disabled="!hasValue || !!computedError"
          @click="confirm()"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import TextBadge from './TextBadge.vue'
import { getConfig } from '../config.js'
import { stringify } from '../utils.js'

export default {
  components: {
    TextBadge,
  },
  props: {
    value: {
      type: undefined,
      default: undefined,
    },
    rows: {
      type: Number,
      default: 5,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      evalMode: false,
      localValue: undefined,

      userInput: undefined,
      error: null,
    }
  },
  computed: {
    hasValue() {
      return !!this.userInput || typeof this.userInput !== 'undefined'
    },
    computedValue() {
      try {
        if (this.evalMode) {
          return stringify(this.value, true)
        } else {
          return JSON.stringify(this.value, null, 2)
        }
      } catch (e) {
        console.warn(e)
        return ''
      }
    },
    computedError() {
      if (this.error) return this.error
      return !this.ENABLE_PROP_EVALUATION && this.evalMode
        ? 'Eval mode is disabled by default for security reasons'
        : ''
    },
  },
  watch: {
    computedValue: {
      immediate: true,
      handler(newValue) {
        if (newValue === this.userInput) return
        this.userInput = newValue
      },
    },
    userInput() {
      this.error = null
    },
  },
  created() {
    // no need to be reactive
    this.ENABLE_PROP_EVALUATION = getConfig().enablePropEval
    this.evalMode = this.ENABLE_PROP_EVALUATION
  },
  methods: {
    handleKeyDown(e) {
      // tab
      if (e.which === 9) {
        e.preventDefault()
        this.userInput += '  ' // FIXME: this always append at the end, but it should do so at the cursor position
      }
    },
    confirm() {
      if (!this.hasValue) return
      this.error = null

      try {
        this.localValue = this.evalMode
          ? this.parseFromEval()
          : this.parseFromJson()

        this.$emit('input', this.localValue)
      } catch (e) {
        this.error = e.message || 'An error occured'
        console.warn(e)
      }
    },
    parseFromJson() {
      return JSON.parse(this.userInput)
    },
    parseFromEval() {
      if (!this.ENABLE_PROP_EVALUATION) {
        throw new Error('Eval mode is disabled')
      }

      return Function('"use strict";return (' + this.userInput + ')')()
    },
  },
}
</script>

<style>
.vue-sandbox-propeditor__textarea-wrapper {
  position: relative;
}

.vue-sandbox-propeditor__textarea-wrapper > textarea {
  box-sizing: border-box;
  width: 100%;
  resize: vertical;
}

.vue-sandbox-propeditor__mode {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;

  display: inline-block;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 0.2rem;
  padding: 0.3em 0.75em;
  border-radius: 0.3em;
  color: #264b6d;
  background-color: #f2f9ff;

  cursor: pointer;
  opacity: 0.1;
  transition: opacity 2000ms cubic-bezier(1, 0, 0.6, 0.6);
  will-change: opacity;
}

.vue-sandbox-propeditor__mode:hover {
  opacity: 1;
  transition: opacity 250ms cubic-bezier(0, 1, 0, 1);
}

.vue-sandbox-propeditor__footer {
  margin-top: 0.25rem;
  display: flex;
}

.vue-sandbox-propeditor__error {
  color: #f84141;
  font-size: 0.85rem;
  padding-right: 1em;
}

.vue-sandbox-propeditor__actions {
  margin-left: auto;
  white-space: nowrap;
}

.vue-sandbox-propeditor__action-btn {
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  margin-left: 0.25em;
}
</style>
