# vue2-sandbox

**vue2-sandbox** provides a customisable and interactive component for previewing Vue component on the fly which can be useful for testing or demostration.

## This project is still under active development.

## Basic Usage

### Use the `component` prop:

```vue
<template>
  <component-sandbox :component="FooComponent" />
</template>

<script>
import FooComponent from './components/FooComponent.vue'

export default {
  components: {
    FooComponent,
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
    UserProfile,
    FormUserId,
  },
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

Or make it fancier:

```vue
<template>
  <component-sandbox
    :component="FooComponent"
    :props="BarComponent.$props"
  />
</template>

<script>
import BarComponent from './component/BarComponent.vue'

// ... omitted
</script>
```

### Eval Mode

The "edit" button next to the prop name allows us to set the prop value using JSON, we can also use eval mode for data that is not supported by JSON, such as `Function`.

This feature is disabled by default, and requires manual activation for security reasons.
