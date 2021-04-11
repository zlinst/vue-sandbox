<template>
  <div
    class="vue-sandbox-codeblock"
    :class="{ folded: folded, expanded: !folded }"
  >
    <div class="vue-sandbox-codeblock__content-wrapper">
      <p
        ref="content"
        class="vue-sandbox-codeblock__content vue-sandbox-monofont"
        :style="contentStyle"
        v-text="content"
      ></p>
    </div>
    <div
      v-show="foldable || unfoldable"
      class="vue-sandbox-codeblock__fold-toggle"
      @click="toggle"
    >
      <span v-show="folded">...</span>
      <span v-show="!folded">Hide</span>
    </div>
  </div>
</template>

<script>
const RE_FONT_SIZE = /^([\d.]+)(.*)$/

export default {
  props: {
    content: {
      type: String,
      default: undefined,
    },
    fontSize: {
      type: String,
      default: '0.9rem',
    },
    lineHeight: {
      type: Number,
      default: 1.5,
    },
    // maximum lines to show when folded
    maxLines: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      folded: true,
      overflown: false,
    }
  },
  computed: {
    parsedFontSize() {
      const match = this.fontSize.match(RE_FONT_SIZE)
      return match
        ? {
            value: parseFloat(match[1]),
            unit: match[2],
          }
        : {}
    },
    computedMaxHeight() {
      return (
        this.parsedFontSize.value * this.lineHeight * this.maxLines +
        this.parsedFontSize.unit
      )
    },
    // styles for code
    contentStyle() {
      return {
        'font-size': this.fontSize,
        'line-height': this.lineHeight,
        'max-height': this.folded ? this.computedMaxHeight : 'none',
      }
    },
    unfoldable() {
      return this.folded && this.overflown
    },
    foldable() {
      return !this.folded && this.overflown
    },
  },
  watch: {
    content() {
      this.updateOverflown()
    },
    fontSize() {
      this.updateOverflown()
    },
    maxLines() {
      this.updateOverflown()
    },
  },
  mounted() {
    this.updateOverflown()
    window.addEventListener('resize', this.throttledUpdate)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.throttledUpdate)
  },
  methods: {
    throttledUpdate() {
      // this.lastUpdate does not need to be reactive
      if (this.lastUpdate) {
        this.lastUpdate = Date.now()
        return
      }

      this.lastUpdate = Date.now()
      setTimeout(() => {
        const elapsed = Date.now() - this.lastUpdate
        this.lastUpdate = null
        if (elapsed >= 250) {
          this.updateOverflown()
        } else {
          this.throttledUpdate()
        }
      }, 250)
    },
    updateOverflown() {
      this.$nextTick(() => {
        if (!this.$refs.content) return

        const element = this.$refs.content
        this.overflown = element.scrollHeight > element.clientHeight
      })
    },
    toggle() {
      this.folded = !this.folded
    },
  },
}
</script>

<style>
.vue-sandbox-codeblock {
  border-radius: 0.2rem;
  background-color: #ddd;
}

.vue-sandbox-codeblock__content-wrapper {
  padding: 0.5rem;
}

.vue-sandbox-codeblock__content {
  margin: 0;
  padding: 0;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  overflow: hidden;
}

.vue-sandbox-codeblock__fold-toggle {
  border-bottom-left-radius: 0.2rem;
  border-bottom-right-radius: 0.2rem;
  line-height: 1.2;
  font-size: 0.9rem;
  opacity: 0.75;
  cursor: pointer;
  color: white;
  text-align: center;
}

.vue-sandbox-codeblock.folded > .vue-sandbox-codeblock__fold-toggle {
  background-color: #e8bd32;
}
.vue-sandbox-codeblock.expanded > .vue-sandbox-codeblock__fold-toggle {
  background-color: #7ed6b4;
}
</style>
