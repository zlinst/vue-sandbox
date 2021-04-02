/**
 * Convert Vue prop type (e.g. String, Boolean etc) to string for type checking.
 */
export const parsePropType = (propType) => {
  if (typeof propType === 'function') {
    return propType.name
  } else if (typeof propType === 'string') {
    return propType
  } else {
    return null
  }
}

export const getPropInfo = (propType) => {
  const propTypeName = parsePropType(propType)
  switch (propTypeName?.toLowerCase()) {
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
    name: propTypeName || 'Unknown',
    component: null,
  }
}

export default {
  parsePropType,
  getPropInfo,
}
