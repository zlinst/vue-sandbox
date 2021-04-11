<template>
  <main>
    <div>
      <div>Pick a component</div>
      <component-select
        @select="
          (c) => (selectedComponent = c.component ? c.component() : undefined)
        "
      />
    </div>
    <div style="margin-bottom: 2rem">
      <input v-model="splitMode" type="checkbox" />
      <span>Split Mode</span>
    </div>
    <div v-if="selectedComponent">
      <v-component-sandbox
        v-if="selectedComponent.name === 'ComponentSandbox'"
        :component="selectedComponent"
        :split="splitMode"
      >
        <template v-slot:prop:component="{ prop }">
          <component-select
            @select="
              (c) => (prop.valueProxy = c.component ? c.component() : undefined)
            "
          />
        </template>
      </v-component-sandbox>
      <v-component-sandbox
        v-else
        :component="selectedComponent"
        :split="splitMode"
      />
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
      splitMode: true,
    }
  },
}
</script>
