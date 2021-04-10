<template>
  <main>
    <component-select
      style="margin-bottom: 2rem"
      @select="
        (c) => (selectedComponent = c.component ? c.component() : undefined)
      "
    />
    <div v-if="selectedComponent">
      <v-component-sandbox
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
      </v-component-sandbox>
      <v-component-sandbox v-else :component="selectedComponent" />
    </div>
  </main>
</template>

<script>
import ComponentSelect from './components/ComponentSelect.vue'

export default {
  name: 'HomePage',
  components: {
    ComponentSelect,
  },
  data() {
    return {
      selectedComponent: undefined,
    }
  },
}
</script>
