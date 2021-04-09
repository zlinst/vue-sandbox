import Vue from 'vue'
import App from './App.vue'
import ComponentSandbox from '@lib'

Vue.config.productionTip = false

Vue.use(ComponentSandbox, {
  enablePropEval: process.env.NODE_ENV === 'development',
})

console.log(process.env.NODE_ENV === 'development')

new Vue({
  render: (h) => h(App),
}).$mount('#app')
