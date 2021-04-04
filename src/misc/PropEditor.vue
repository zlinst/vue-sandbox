<template>
  <div class="vue-sandbox-propeditor">
    <textarea
      v-model="userInput"
      :rows="rows"
      class="vue-sandbox-monofont"
      :autofocus="autofocus"
      @keydown="handleKeyDown"
    ></textarea>
    <div class="vue-sandbox-propeditor__actions">
      <button
        class="vue-sandbox-propeditor__action-btn"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        class="vue-sandbox-propeditor__action-btn"
        :disabled="!hasValue"
        @click="confirm()"
      >
        {{ evalMode ? 'Evaluate' : 'Parse' }}
      </button>
    </div>
  </div>
</template>

<script>
import { checkPropEvalAllowed } from '../utils.js'

const ALLOW_PROP_EVALUATION = checkPropEvalAllowed()

export default {
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
      userInput: undefined,
      evalMode: ALLOW_PROP_EVALUATION,
    }
  },
  computed: {
    hasValue() {
      return !!this.userInput || typeof this.userInput !== 'undefined'
    },
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

      try {
        const value = this.evalMode
          ? this.parseFromEval()
          : this.parseFromJson()

        this.$emit('input', value)
      } catch (e) {
        console.warn(e)
      }
    },
    parseFromJson() {
      return JSON.parse(this.userInput)
    },
    parseFromEval() {
      if (!ALLOW_PROP_EVALUATION) {
        throw new Error('PROP EVALUATION is disabled by default')
      }

      return Function('"use strict";return (' + this.userInput + ')')()
    },
  },
}
</script>

<style>
.vue-sandbox-propeditor textarea {
  box-sizing: border-box;
  width: 100%;
  resize: vertical;
}

.vue-sandbox-propeditor__actions {
  text-align: right;
}

.vue-sandbox-propeditor__action-btn {
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  margin-left: 0.25em;
}
</style>
