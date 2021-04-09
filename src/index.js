import ComponentSandbox from './ComponentSandbox.vue'
import { updateConfig } from './config.js'

const install = function (Vue, options = {}) {
  if (install.installed) return
  install.installed = true

  if (options.name !== false) {
    Vue.component(options.name || 'ComponentSandbox', ComponentSandbox)
  }

  updateConfig(options)
}

export { ComponentSandbox }
export default { install }
