import * as components from './components'
import { initConfig } from './utils/configs'

const DEFAULT_OPTIONS = {
  allowPropEval: false,
  registerComponents: true,
  componentPrefix: '',
}

const install = function (Vue, options = {}) {
  if (install.installed) return
  install.installed = true

  options = { ...DEFAULT_OPTIONS, ...options }

  if (options.registerComponents) {
    Object.keys(components).forEach((componentName) => {
      Vue.component(
        options.componentPrefix
          ? `${options.componentPrefix}${componentName}`
          : componentName,
        components[componentName]
      )
    })
  }

  initConfig(options)
}

const plugin = { install }

// use automatically when global Vue instance detected
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}

if (GlobalVue) {
  GlobalVue.use(plugin)
}

export default plugin

export * from './components'
export { initConfig } from './utils/configs'
