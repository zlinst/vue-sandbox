/**
 * Convert Vue prop type (e.g. String, Boolean etc) to lowercased string name for type checking.
 */
export const parsePropType = (propType) => {
  if (typeof propType === 'function') {
    return propType.name.toLowerCase()
  } else if (typeof propType === 'string') {
    return propType.toLocaleLowerCase()
  } else {
    return null
  }
}

export const getPropInfo = (propType) => {
  switch (parsePropType(propType)) {
    case 'string':
      return {
        name: 'String',
        component: () => import('./inputs/InputString.vue'),
      }
    case 'boolean':
      return {
        name: 'Boolean',
        component: () => import('./inputs/InputBoolean.vue'),
      }
  }

  return {
    name: 'Unknown',
    component: () => import('./inputs/InputUnknown.vue'),
  }
}

export default {
  parsePropType,
  getPropInfo,
}
