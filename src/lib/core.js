/**
 * Convert Vue prop type (e.g. String, Boolean etc) to string for type checking.
 *
 * See: https://github.com/vuejs/vue/blob/fa1f81e91062e9de6161708209cd7354733aa354/src/core/util/props.js#L190
 */
export const parsePropType = (propType) => {
  const match = propType && propType.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ''
}

export const getPropInfo = (propType) => {
  const propTypeName = parsePropType(propType)
  switch (propTypeName) {
    case 'String':
      return {
        name: 'String',
        component: () => import('./inputs/InputString.vue'),
      }
    case 'Boolean':
      return {
        name: 'Boolean',
        component: () => import('./inputs/InputBoolean.vue'),
      }
    case 'Number':
      return {
        name: 'Number',
        component: () => import('./inputs/InputNumber.vue'),
      }
  }

  return {
    name: propTypeName || 'Unknown',
    component: () => import('./inputs/InputUnknown.vue'),
  }
}

export default {
  parsePropType,
  getPropInfo,
}
