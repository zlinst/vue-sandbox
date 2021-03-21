<template>
  <span class="sandbox-badge" :class="dynamicClass">
    <slot>{{ text }}</slot>
  </span>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: undefined,
    },
    variant: {
      type: String,
      default: 'primary',
    },
    size: {
      type: String,
      default: 'md',
    },
  },
  computed: {
    dynamicClass() {
      return `sandbox-badge__variant__${this.variant} sandbox-badge__size__${this.size}`
    },
  },
}
</script>

<style lang="scss" scoped>
.sandbox-badge {
  padding: 0.15em 0.35em;
  font-size: inherit;
  border-radius: 0.3em;
}

.sandbox-badge__variant__primary {
  color: white;
  background-color: #555;
}

.sandbox-badge__size__sm {
  font-size: 0.8em;
}
.sandbox-badge__size__md {
  font-size: inherit;
}
.sandbox-badge__size__lg {
  font-size: 1.2em;
}
</style>
