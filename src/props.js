import InputString from './inputs/InputString.vue'
import InputBoolean from './inputs/InputBoolean.vue'
import InputNumber from './inputs/InputNumber.vue'
import { isArray, isFunction } from './utils.js'

/**
 * Convert Vue prop type (e.g. String, Boolean etc) to string for type checking.
 *
 * See: https://github.com/vuejs/vue/blob/fa1f81e91062e9de6161708209cd7354733aa354/src/core/util/props.js#L190
 */
export const getPropTypeName = (propType) => {
  const match = propType && propType.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ''
}

/**
 * Get prop default value.
 *
 * See: https://github.com/vuejs/vue/blob/fa1f81e91062e9de6161708209cd7354733aa354/src/core/util/props.js#L67
 */
export const getPropDefaultValue = (vm, type, def) => {
  // NOTE: the prop.type might be array as supported by Vue
  // TODO: Vue seems only checks the first type if it's an array?
  type = isArray(type) ? type[0] : type

  // call factory function for non-Function types
  if (isFunction(def) && getPropTypeName(def) !== 'Function') {
    return def.call(vm)
  }

  return def
}

// the order matters as is function will be run in the order as defined
const propTypeDefinitions = [
  {
    name: getPropTypeName(String),
    component: InputString,
  },
  {
    name: getPropTypeName(Boolean),
    component: InputBoolean,
  },
  {
    name: getPropTypeName(Number),
    component: InputNumber,
  },
]

export const registerPropType = () => {
  throw new Error('Not Implemented')
}

/**
 * Get the prop type metadata by prop.type.
 */
export const resolvePropType = (propType) => {
  if (typeof propType === 'undefined') {
    return {
      name: 'Any',
    }
  }

  // support pass type as string
  let propTypeName =
    (typeof propType === 'string' ? propType : getPropTypeName(propType)) || ''

  return (
    propTypeDefinitions.find((def) => {
      return def.name === propTypeName
    }) || {
      name: propTypeName || 'Unknown',
      unresolved: true,
    }
  )
}
