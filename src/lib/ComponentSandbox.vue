<template>
  <section class="sandbox">
    <div class="sandbox-header">
      <slot name="header">
        <span class="sandbox-header__title">{{ targetName }}</span>
        <span class="sandbox-header__actions">
          <button class="sandbox-header__action-btn" @click="reload">
            Reload
          </button>
          <button class="sandbox-header__action-btn" @click="reset">
            Reset
          </button>
        </span>
      </slot>
    </div>

    <div class="sandbox-component">
      <div class="sandbox-component__wrapper">
        <div
          v-if="!reloading"
          :key="activeId"
          :style="{ visibility: ready ? 'visible' : 'hidden' }"
        >
          <slot v-bind="{ propsData, eventsData }">
            <component
              :is="component"
              v-if="component"
              v-bind="propsData"
              v-on="eventsData"
            />
          </slot>
        </div>
      </div>
      <div v-show="reloading || !ready" class="sandbox__overlay">
        <slot name="overlay" v-bind="{ reloading, ready }">
          <div class="sandbox-component__overlay-blur"></div>
          <div class="sandbox-component__overlay-text">Loading ...</div>
        </slot>
      </div>
    </div>

    <div class="sandbox-props">
      <div
        v-for="prop in availableProps"
        :key="prop.name"
        :temp="(slotName = 'prop:' + prop.name)"
      >
        <div v-if="$scopedSlots[slotName]">
          <slot :name="slotName" v-bind="{ prop }" />
        </div>
        <component-prop v-model="prop.value" v-bind="prop" />
      </div>
    </div>
  </section>
</template>

<script>
import ComponentProp from './ComponentProp.vue'
import { has } from './utils.js'

export default {
  name: 'ComponentSandbox',
  components: {
    ComponentProp,
  },
  props: {
    component: {
      type: undefined,
      default: undefined,
    },
    props: {
      type: Object,
      default: () => ({}),
    },
    reloadDelay: {
      type: Number,
      default: 800,
    },
  },
  data() {
    return {
      // used for target component identification, increase this to reload the component
      targetId: 0,
      // used for marking target component in current setup
      activeId: 0,

      // Vue instance of the target component
      target: undefined,
      // the actual props to be binded on the target component
      propsData: undefined,

      // if the component is ready to be shown
      ready: false,
    }
  },
  computed: {
    reloading() {
      return this.targetId !== this.activeId
    },
    /**
     * Vue $options of the target component.
     */
    targetOptions() {
      if (!this.target) return {}
      return this.target.__proto__.constructor.extendOptions
    },
    /**
     * Name of the target component (if available).
     */
    targetName() {
      if (this.reloading || !this.ready) return '[ Loading ... ]'
      if (!this.target) return '[ Component Not Found ]'

      // return the name if defined in $options
      if (this.targetOptions.name) {
        return this.targetOptions.name
      }
      // otherwise check for the private name ("<ComponentName>")
      if (this.target._name) {
        return this.target._name.replace(/^<|>$/g, '')
      }
      // or try extract from filename
      if (this.targetOptions.__file) {
        const match = this.targetOptions.__file.match(/^.*?([^\\/]*)\.vue$/)
        if (match) {
          return match[1]
        }
      }

      return '[ Anonymous Component ]'
    },
    /**
     * v-model *definition* of target component.
     */
    targetModel() {
      if (!this.target) return {}

      return {
        prop: 'value',
        event: 'input',
        ...(this.targetOptions.model || {}),
      }
    },
    /**
     * props *definition* of target component, includes props "inherited" from mixins.
     */
    targetProps() {
      if (!this.target) return {}

      const targetProps = {}
      if (this.targetOptions.mixins) {
        this.targetOptions.mixins.forEach((mixin) => {
          if (!mixin.props) return
          // TODO: confirm the inheritance order
          // TODO: Object.assign does not work in IE, might need babel plugin to transpile?
          Object.assign(targetProps, mixin.props)
        })
      }

      if (this.targetOptions.props) {
        Object.assign(targetProps, this.targetOptions.props)
      }

      return targetProps
    },
    /**
     * List of props to be shown.
     */
    availableProps() {
      if (!this.target) return []

      const availableProps = []
      for (let propName in this.targetProps) {
        availableProps.push({
          name: propName,
          type: undefined,
          isModel: propName === this.targetModel.prop,
          // allows prop definition override
          ...this.targetProps[propName],
          ...(this.props[propName] || {}),
        })
      }

      // include unlisted props from user, useful if target component uses $attrs
      for (let propName in this.props) {
        if (this.targetProps[propName] || !this.props[propName]) {
          return
        }

        availableProps.push({
          name: propName,
          type: undefined,
          unlisted: true,
          isModel: propName === this.targetModel.prop,
          ...this.props[propName],
        })
      }

      // add v-model support
      availableProps.forEach((prop) => {
        Object.defineProperty(prop, 'value', {
          get: () => {
            return this.propsData[prop.name]
          },
          set: (value) => {
            this.propsData[prop.name] = value
          },
        })
      })

      return availableProps
    },
    /**
     * The event listeners to be binded on the target component.
     */
    eventsData() {
      const activeId = this.activeId
      return {
        'hook:beforeCreate': () => {
          this.ready = false
          this.setup()
        },
      }
    },
  },
  watch: {
    component() {
      this.reset()
    },
  },
  created() {
    this.resetPropsData()
  },
  methods: {
    setup() {
      this.ready = false
      this.target = this.findTargetComponent()

      if (!this.target) {
        console.warn(
          '[ComponentSandbox] Cannot find target component, make sure it is setup properly.'
        )
        return
      }

      this.setupPropsData()
      this.ready = true
    },
    setupPropsData() {
      this.availableProps.forEach((prop) => {
        if (has(this.propsData, prop.name)) return

        if (has(prop, 'default')) {
          this.$set(this.propsData, prop.name, prop.default)
        } else {
          this.$set(this.propsData, prop.name, undefined)
        }
      })
    },
    resetPropsData() {
      this.propsData = { __sandboxed: true }
    },
    reload() {
      const targetId = ++this.targetId
      // add a small deply to make the process more responsive
      this.$nextTick(() =>
        setTimeout(() => {
          if (targetId === this.targetId) {
            this.activeId = targetId
          }
        }, this.reloadDelay)
      )
    },
    reset() {
      this.reload()
      this.resetPropsData()
    },
    /**
     * Find the target component by checking the unique $attr in child components.
     */
    findTargetComponent(children) {
      if (!children) children = this.$children
      // terminate immidiately on empty children
      if (!children.length) return undefined

      for (const index in children) {
        const child = children[index]
        if (child.$attrs.__sandboxed) return child
        const target = this.findTargetComponent(child.$children)
        if (target) return target
      }
    },
  },
}
</script>

<style lang="scss">
.sandbox-monofont {
  font-family: monospace;
}
</style>

<style lang="scss" scoped>
.sandbox {
  border-radius: 0.2em;
  box-shadow: 0.2em 0.2em 0.5em rgba(0, 0, 0, 0.2);
}

.sandbox__overlay {
  position: absolute;
  inset: 0;
  z-index: 10;

  & > * {
    position: absolute;
    inset: 0;
  }
}

.sandbox-header {
  display: flex;
  align-items: center;
  border-top-left-radius: 0.2em;
  border-top-right-radius: 0.2em;
  padding: 0.5em 0.5em;
  background-color: #264b6d;
  color: #eee;
}

.sandbox-header__title {
  font-weight: 500;
}

.sandbox-header__actions {
  margin-left: auto;
}

.sandbox-header__action-btn {
  font-size: 0.9em;
  font-family: inherit;
  cursor: pointer;
  margin-left: 0.25em;
  margin-right: 0.25em;
}

.sandbox-component {
  position: relative;
}

.sandbox-component__overlay-blur {
  opacity: 0.75;
  backdrop-filter: blur(5px);
}

.sandbox-component__overlay-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.sandbox-component__wrapper {
  padding: 1em;
}

.sandbox-component__wrapper__outlined {
  border: 1px dotted #264b6d;
}

.sandbox-props {
  background-color: #f4faff;
}
</style>
