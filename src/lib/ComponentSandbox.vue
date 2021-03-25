<template>
  <section class="sandbox">
    <!-- header -->
    <div class="sandbox-header">
      <span class="sandbox-header__title">{{ title }}</span>
      <span class="sandbox-header__actions">
        <button class="sandbox-header__action-btn" @click="reload">
          Reload
        </button>
        <button class="sandbox-header__action-btn" @click="reset">Reset</button>
      </span>
    </div>

    <div class="sandbox-component">
      <!-- target component -->
      <div
        ref="target"
        class="sandbox-component__target-wrapper"
        :style="targetStyle"
      >
        <div
          v-if="!reloading"
          :key="activeId"
          class="sandbox-component__target"
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

      <!-- props of target component -->
      <div class="sandbox-component__props">
        <div
          v-for="prop in propsList"
          :key="prop.name"
          :temp="(slotName = 'prop:' + prop.name)"
          class="sandbox-component__prop"
        >
          <div v-if="$scopedSlots[slotName]">
            <slot :name="slotName" v-bind="{ prop }" />
          </div>
          <component-prop v-model="prop.valueProxy" v-bind="prop" />
        </div>
      </div>

      <!-- loading overlay -->
      <div v-show="reloading || !ready" class="sandbox-overlay"></div>
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
      default: 600,
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
      // list of prop object to be shown
      propsList: [],
      // the actual props to be binded on the target component
      propsData: undefined,

      // if the component is ready to be shown
      ready: false,

      // tracks the height of the target component div
      targetHeight: undefined,
    }
  },
  computed: {
    reloading() {
      return this.targetId !== this.activeId
    },
    title() {
      if (this.reloading || !this.ready) return 'Loading ...'
      return this.targetName
    },
    /**
     * Vue $options of the target component.
     */
    targetOptions() {
      return this.target ? this.target.__proto__.constructor.extendOptions : {}
    },
    /**
     * Name of the target component (if available).
     */
    targetName() {
      if (!this.target) return '[Not Found]'

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

      return '[Anonymous Component]'
    },
    /**
     * model *definition* of target component.
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
     * The event listeners to be binded on the target component.
     */
    eventsData() {
      const modelProp = this.propsList.find((prop) => prop.isModel)
      return {
        // triggered when:
        //  * loaded for the first time
        //  * manually reloaded
        //  * automatically hot-reload by Vue
        'hook:beforeCreate': () => {
          this.setup()
        },
        // tracking v-model prop (even when there is v-model support, but should have no
        // side-effect)
        [this.targetModel.event || 'input']: (value) => {
          if (modelProp) {
            modelProp.valueProxy = value
          }
        },
      }
    },
    targetStyle() {
      if (this.targetHeight && this.reloading) {
        return {
          'min-height': this.targetHeight,
        }
      }

      return {}
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

      this.buildPropsList()
      this.setupPropsData()

      this.ready = true
    },
    /**
     * Collect all the prop entries.
     *
     * NOTE: we could use computed property for this, but the Vue reactivity is too senstive that
     * changing this.activeId and this.target will cause the computed property to be evaluated
     * multiple times during a single reload.
     */
    buildPropsList() {
      this.propsList = []

      // loop prop from props definitions
      for (let propName in this.targetProps) {
        this.propsList.push({
          name: propName,
          type: undefined,
          isModel: propName === this.targetModel.prop,
          ...this.targetProps[propName],
          // allows override
          ...(this.props[propName] || {}),
        })
      }

      // search for unlisted props, useful if target component uses $attrs
      for (let propName in this.props) {
        if (this.targetProps[propName] || !this.props[propName]) {
          return
        }

        this.propsList.push({
          name: propName,
          type: undefined,
          unlisted: true,
          isModel: propName === this.targetModel.prop,
          ...this.props[propName],
        })
      }

      const activeId = this.activeId

      // add a proxy property for v-model support
      this.propsList.forEach((prop) => {
        Object.defineProperty(prop, 'valueProxy', {
          get: () => {
            return this.propsData[prop.name]
          },
          set: (value) => {
            if (activeId !== this.targetId) {
              // ignores updates from destroyed component
              return
            }
            this.propsData[prop.name] = value
          },
        })
      })
    },
    /**
     * Set the default values of the props.
     */
    setupPropsData() {
      this.propsList.forEach((prop) => {
        if (has(this.propsData, prop.name)) return

        if (has(prop, 'default')) {
          this.$set(this.propsData, prop.name, prop.default)
        } else {
          this.$set(this.propsData, prop.name, undefined)
        }
      })
    },
    /**
     * Clear values of the props.
     */
    resetPropsData() {
      this.propsData = { __sandboxed: true }
    },
    /**
     * Re-mount the component without clearing the props data.
     */
    reload() {
      // record current height
      this.targetHeight = this.getTargetHeight()
      const targetId = ++this.targetId
      // add a small deply to make the process more responsive
      this.$nextTick(() =>
        setTimeout(() => {
          // in case a new reload is issued
          if (targetId === this.targetId) {
            this.activeId = targetId
          }
        }, this.reloadDelay)
      )
    },
    /**
     * Re-mount the component and clear everything.
     */
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
    /**
     * Returns the current height of the component target div.
     */
    getTargetHeight() {
      if (!this.$refs.target) return null
      return window
        .getComputedStyle(this.$refs.target)
        .getPropertyValue('height')
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

.sandbox-component__target-wrapper {
  padding: 2em;
}

// .sandbox-component__target {
// }

.sandbox-component__target__outlined {
  border: 1px dotted #264b6d;
}

.sandbox-component__props {
  background-color: #f4faff;
}

.sandbox-component__prop {
  padding: 0.75em;
  border-top: 1px solid #dae6ef;
}

// overlay effect
.sandbox-overlay {
  position: absolute;
  // inset: 0; // not supported in IE
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9;

  background-color: #555;
  opacity: 0.75;
  // backdrop-filter: blur(2px);
}
</style>
