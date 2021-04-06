<template>
  <main>
    <component-select
      style="margin-bottom: 2rem"
      @select="
        (c) => (selectedComponent = c.component ? c.component() : undefined)
      "
    />
    <div v-if="selectedComponent">
      <component-sandbox
        v-if="selectedComponent.name === 'ComponentSandbox'"
        :component="selectedComponent"
      >
        <template v-slot:prop:component="{ prop }">
          <component-select
            @select="
              (c) => (prop.valueProxy = c.component ? c.component() : undefined)
            "
          />
        </template>
      </component-sandbox>
      <component-sandbox v-else :component="selectedComponent" />
    </div>
  </main>
</template>

<script>
import ComponentSelect from './components/ComponentSelect.vue'
import { ComponentSandbox } from '@lib'

export default {
  name: 'HomePage',
  components: {
    ComponentSelect,
    ComponentSandbox,
  },
  data() {
    return {
      selectedComponent: undefined,
    }
  },
}
</script>
