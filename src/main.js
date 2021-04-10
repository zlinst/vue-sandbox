import Vue from 'vue'
import App from '@/App.vue'
import VueSandbox from '@lib'

Vue.config.productionTip = false

Vue.use(VueSandbox, {
  componentPrefix: 'v',
  allowPropEval: process.env.NODE_ENV === 'development',
})

new Vue({
  render: (h) => h(App),
}).$mount('#app')
