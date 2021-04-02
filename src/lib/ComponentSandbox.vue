<template>
  <section class="sandbox">
    <!-- header -->
    <div class="sandbox-header">
      <span class="sandbox-header__title">{{ sandboxTitle }}</span>
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
import { parsePropType } from './core.js'
import { has, isArray } from './utils.js'

export default {
  name: 'ComponentSandbox',
  components: {
    ComponentProp,
  },
  props: {
    /**
     * Set the target component, optional.
     */
    component: {
      type: undefined,
      default: undefined,
    },
    /**
     * Prop definitions for the target component.
     */
    props: {
      type: Object,
      default: () => ({}),
    },
    /**
     * Add a small delay for reloading component to make it more responsive, measured in
     * milliseconds.
     */
    reloadDelay: {
      type: Number,
      default: 600,
    },
  },
  data() {
    return {
      // Vue instance of the target component
      target: undefined,
      // the prop list to be shown
      propsList: [],
      // the $props values to be binded on the target component
      propsData: undefined,

      // id of current sandbox, increase this will inform the sandbox to reload the target
      // component
      // NOTE: the reason we don't use boolean is that we need to filter events/updates from
      // unloaded/unloading component
      sandboxId: 0,
      // id of target component that was set up
      targetId: 0,
      // if all the props and events of the target component are setup and ready to be shown
      ready: false,

      // tracks the height of the container of the target component
      targetHeight: undefined,
    }
  },
  computed: {
    reloading() {
      return this.sandboxId !== this.targetId
    },
    sandboxTitle() {
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
        //  * automatically hot-reload in dev mode
        'hook:beforeCreate': () => {
          this.setup()
        },
        // tracking v-model prop (even when there is no v-model support, but should have no
        // side-effect)
        [this.targetModel.event || 'input']: (value) => {
          if (modelProp) {
            modelProp.valueProxy = value
          }
        },
      }
    },
    // used for keeping the height of target component container during reloading
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
    sandboxId(newValue) {
      // add a small deply to make the UI more responsive
      setTimeout(() => {
        // in case a new reload is issued
        if (newValue === this.sandboxId) {
          this.targetId = newValue
        }
      }, this.reloadDelay)
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
     * NOTE: we could use computed property for this, but drawback is: it may be computed twice
     * within single reload because we accessed targetId and sandboxId (for filtering unwanted
     * update).
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

      const targetId = this.targetId

      // add a proxy property for v-model support so we can bind them to input components
      this.propsList.forEach((prop) => {
        Object.defineProperty(prop, 'valueProxy', {
          get: () => {
            return this.propsData[prop.name]
          },
          set: (value) => {
            if (targetId !== this.sandboxId) {
              // ignores updates from destroyed component
              return
            }
            this.propsData[prop.name] = value
          },
        })
      })
    },
    /**
     * Setup the default values of $props.
     *
     * See: https://github.com/vuejs/vue/blob/fa1f81e91062e9de6161708209cd7354733aa354/src/core/util/props.js#L67
     */
    setupPropsData() {
      this.propsList.forEach((prop) => {
        // we want to preserve values when reload, so just ignore values that's set previously, but
        // we'll still want to continue check other props as there might be new props added to the
        // target component
        if (has(this.propsData, prop.name)) return

        if (has(prop, 'default')) {
          let defaultValue = prop.default
          // TODO: vue seems only checks the first type if it's an array?
          const primaryType = isArray(prop.type) ? prop.type[0] : prop.type

          // call factory function for non-Function types
          if (
            typeof defaultValue === 'function' &&
            parsePropType(primaryType) !== 'Function'
          ) {
            defaultValue = prop.default.call(this.target)
          }

          this.$set(this.propsData, prop.name, defaultValue)
        } else {
          this.$set(this.propsData, prop.name, undefined)
        }
      })
    },
    /**
     * Clears the $props values.
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
      ++this.sandboxId
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
     * Returns the current height of the container of the target component.
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
