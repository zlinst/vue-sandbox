<template>
  <div>
    <div class="px-2 py-1 foldable-code" :class="{ folded: folded }">
      <p ref="code" class="p-0 m-0 code" :style="codeStyle">{{ code }}</p>
      <div
        v-show="foldable || unfoldable"
        class="text-center fold-toggle mb-n1 mx-n2"
        @click="toggle"
      >
        <span v-show="unfoldable">...</span><span v-show="foldable">V</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    code: {
      type: String,
      default: undefined,
    },
    // maximum lines to show when folded
    maxLines: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      // is code block folded
      folded: true,
      // computed line height in px
      lineHeight: 0,
      // height of the code block
      codeHeight: 0,
    }
  },
  computed: {
    // styles for code
    codeStyle() {
      return {
        // min height to 1 line
        'min-height': this.lineHeight + 'px',
        // max height to specified lines when folded, auto (show all) when unfolded
        'max-height': this.folded
          ? this.lineHeight * this.maxLines + 'px'
          : 'none',
      }
    },
    // if code block would overflown when folded
    overflown() {
      return this.codeHeight > this.lineHeight * this.maxLines
    },
    unfoldable() {
      return this.folded && this.overflown
    },
    foldable() {
      return !this.folded && this.overflown
    },
  },
  watch: {
    code: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          this.codeHeight = this.$refs.code.scrollHeight
        })
      },
    },
  },
  mounted() {
    this.updateLineHeight()
  },
  methods: {
    // line height cannot be reactive since it need to access window API
    updateLineHeight() {
      const lineHeightWithUnit = window
        .getComputedStyle(this.$refs.code)
        .getPropertyValue('line-height')
      const match = lineHeightWithUnit.match(/^([\d.]+)/)
      this.lineHeight = parseFloat(match[1])
    },
    // toggle folding
    toggle() {
      this.folded = !this.folded
    },
  },
}
</script>

<style lang="scss" scoped>
.foldable-code {
  border-radius: 5px;
  background-color: #ddd;
}

.code {
  font-size: 0.9rem;
  line-height: 1.5;
  font-family: monospace;
  overflow-wrap: anywhere;
  word-break: break-all;
  overflow: hidden;
}

.fold-toggle {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  line-height: 1;
  color: white;
  background-color: #7ed6b4;
  opacity: 0.75;
}
.foldable-code.folded .fold-toggle {
  background-color: #e8bd32;
}

.fold-toggle:hover {
  cursor: pointer;
  opacity: 1;
}
</style>
