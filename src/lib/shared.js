export const has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export const isArray = (obj) => {
  return Array.isArray(obj)
}

/**
 * Convert Vue prop type (e.g. String, Boolean etc) to string for type checking.
 *
 * See: https://github.com/vuejs/vue/blob/fa1f81e91062e9de6161708209cd7354733aa354/src/core/util/props.js#L190
 */
export const parsePropType = (propType) => {
  // support custom type passed as string
  if (typeof propType === 'string') return propType

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
