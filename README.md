# vue2-sandbox

**vue2-sandbox** provides a customisable and interactive component for previewing Vue component on the fly which can be useful for testing or demostration.

Check the demo [here](https://zlinst.github.io/vue-sandbox/).

## This project is still under active development.

## Installation

```shell
npm install --save @zlinst/vue2-sandbox
```

## Configuration

Use `Vue.use` to register components:

```javascript
import Vue from 'vue'
import VueSandbox from '@zlinst/vue2-sandbox'

Vue.use(VueSandbox)
```

Or do it manually:

```javascript
import Vue from 'vue'
import { ComponentSandbox } from '@zlinst/vue2-sandbox'

Vue.component('component-sandbox', ComponentSandbox)
```

You can also pass options to `Vue.use` for further customisation:

```javascript
Vue.use(VueSandbox, {
  allowPropEval: process.env.NODE_ENV === 'development',
  registerComponents: true,
  componentPrefix: 'v',
})
```

Available options are:

| Option | Description | Default |
|:-:|---|:-:|
| `allowPropEval` | When set to `true`, we can set prop value using JavaScript code instead of JSON, it uses `Function(...)` underneath for value evaluation, this is turned off by default for security concerns. | `false` |
| `registerComponents` | Set to `false` if you want to register components manually. | `true` |
| `componentPrefix` | Append a prefix to component names when `registerComponents` is `true`, for example: set it to `'v'` allows you to use component as: `<v-component-sandbox ... />` | `''` |

### Note for Nuxt.js

> If you use Nuxt plugin to configure this package, you might need to set the plugin mode to client.

## Basic Usage

### Use the `component` prop:

```vue
<template>
  <component-sandbox :component="FooComponent" />
</template>

<script>
import FooComponent from './components/FooComponent.vue'

export default {
  data() {
    return {
      FooComponent,
    }
  },
}
</script>
```

Or

### Use the default slot 

Note the manual bindings for `propsData` and `eventsData` are needed in this case.

```vue
<template>
  <component-sandbox>
    <template v-slot="{ propsData, eventsData }">
      <foo-component v-bind="propsData" v-on="eventsData" />
    </template>
  </component-sandbox>
</template>

<script>
// ... omitted
</script>
```

## Advanced Usage

### Custom Prop Input

We can use custom input component for editing prop value by using named slot `prop:{propName}`.

For example, if `UserProfile` component has a prop named `userId`, and `FormUserId` is a selector component that loads users from remote server and emits id of selected user as `v-model`.

```vue
<template>
  <component-sandbox :component="UserProfile">
    <template v-slot:prop:userId="{ prop }">
      <form-user-id v-model="prop.valueProxy" />
    </template>
  <component-sandbox>
</template>

<script>
import UserProfile from './components/UserProfile.vue'
import FormUserId from './components/FormUserId.vue'

export default {
  components: {
    FormUserId,
  },
  data() {
    return {
      UserProfile,
    }
  }
}
</script>
```

### Unlisted Props

Sometimes we use `$attrs` to pass non-prop attributes to child component, we can use `props` prop to include them in the prop list as well, it's just like how we define `props` in Vue component.

```vue
<template>
  <component-sandbox
    :component="FooComponent"
    :props="{
      bar: {
        type: String,
        default: 'Hello, This is BAR',
      }
    }"
  />
</template>

<script>
// ... omitted
</script>
```
