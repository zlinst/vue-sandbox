<template>
  <section class="vue-sandbox">
    <!-- header -->
    <div class="vue-sandbox__header">
      <span class="vue-sandbox__header-title">{{ sandboxTitle }}</span>
      <span class="vue-sandbox__header-actions">
        <button class="vue-sandbox__header-action-btn" @click="reload()">
          Reload
        </button>
        <button class="vue-sandbox__header-action-btn" @click="reload(true)">
          Reset
        </button>
      </span>
    </div>

    <div class="vue-sandbox__main">
      <!-- target component -->
      <div
        ref="target"
        class="vue-sandbox__component-wrapper"
        :style="targetStyle"
      >
        <div
          v-if="!reloading"
          :key="sandboxId"
          class="vue-sandbox__component"
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
      <div class="vue-sandbox__component-props">
        <div
          v-for="prop in propsList"
          :key="prop.key"
          :data-slot-name="(slotName = 'prop:' + prop.name)"
          class="vue-sandbox__component-prop"
        >
          <component-prop v-model="prop.valueProxy" v-bind="prop" :vm="target">
            <slot
              v-if="$scopedSlots[slotName]"
              :name="slotName"
              v-bind="{ prop }"
            />
          </component-prop>
        </div>
      </div>

      <!-- loading overlay -->
      <div v-show="reloading || !ready" class="vue-sandbox__main-overlay"></div>
    </div>
  </section>
</template>

<script>
import ComponentProp from './ComponentProp.vue'
import { objectHas, objectAssign } from './utils.js'
import { getPropDefaultValue } from './props.js'

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
      default: 350,
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
      // change this will force the $props list to re-render, useful when reset
      // NOTE: the re-render won't happen immediately, it will happen when the props list are
      // being re-built
      propsId: 0,

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
     *
     * TODO: need to support nested mixins
     * TODO: confirm the mixin execution order for props
     */
    targetProps() {
      if (!this.target) return {}

      const props = {}
      if (this.targetOptions.mixins) {
        this.targetOptions.mixins.forEach((mixin) => {
          if (!mixin.props) return
          objectAssign(props, mixin.props)
        })
      }

      if (this.targetOptions.props) {
        objectAssign(props, this.targetOptions.props)
      }

      return props
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
      this.reload(true)
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
          // default
          name: propName,
          type: undefined,
          // override
          ...this.targetProps[propName],
          ...(this.props[propName] || {}),
          // static
          key: this.propsId + '+' + propName,
          isModel: propName === this.targetModel.prop,
        })
      }

      // search for unlisted props (defined by user), useful if target component uses $attrs
      for (let propName in this.props) {
        if (this.targetProps[propName] || !this.props[propName]) {
          continue
        }

        this.propsList.push({
          // default
          type: undefined,
          // override
          ...this.props[propName],
          // static
          key: this.propsId + '+' + propName,
          name: propName,
          unlisted: true,
          isModel: propName === this.targetModel.prop,
        })
      }

      const targetId = this.targetId

      this.propsList.forEach((prop) => {
        // add a proxy property for v-model support so we can bind them to input components
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
     */
    setupPropsData() {
      this.propsList.forEach((prop) => {
        // we want to preserve values when reload, so just ignore values that's set previously, but
        // we'll still want to continue check other props as there might be new props added to the
        // target component
        if (objectHas(this.propsData, prop.name)) return

        this.$set(
          this.propsData,
          prop.name,
          objectHas(prop, 'default')
            ? getPropDefaultValue(this.target, prop.type, prop.default)
            : undefined
        )
      })
    },
    /**
     * Clears the $props values.
     */
    resetPropsData() {
      this.propsData = { __sandboxed: true }
    },
    /**
     * Re-load the target component.
     */
    reload(resetProps) {
      // record current height
      this.targetHeight = this.getTargetHeight()
      const sandboxId = ++this.sandboxId

      // add a small deply to make the UI more responsive
      setTimeout(() => {
        // check in case a new reload is issued
        if (sandboxId !== this.sandboxId) return

        if (resetProps) {
          this.propsId++
          this.resetPropsData()
        }
        this.targetId = sandboxId
      }, this.reloadDelay)
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

<!-- shared styles -->
<style>
.vue-sandbox-monofont {
  font-family: monospace;
}
</style>

<!-- local styles -->
<style>
.vue-sandbox {
  border-radius: 0.2rem;
  box-shadow: 0.2rem 0.2rem 0.5rem rgba(0, 0, 0, 0.2);
}

.vue-sandbox__header {
  display: flex;
  align-items: center;
  border-top-left-radius: 0.2rem;
  border-top-right-radius: 0.2rem;
  padding: 0.5em 0.5em;

  color: white;
  background-color: #264b6d;
}

.vue-sandbox__header-title {
  font-size: 1rem;
  font-weight: 500;
}

.vue-sandbox__header-actions {
  margin-left: auto;
}

.vue-sandbox__header-action-btn {
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  margin-left: 0.25em;
  margin-right: 0.25em;
}

.vue-sandbox__main {
  position: relative;
}

.vue-sandbox__component-wrapper {
  padding: 2em;
}

.vue-sandbox__component-props {
  background-color: #f4faff;
}

.vue-sandbox__component-prop {
  padding: 0.75em;
  border-top: 1px solid #dae6ef;
}

/* overlay effect */
.vue-sandbox__main-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9;

  background-color: #555;
  opacity: 0.75;
}
</style>
