import InputString from './inputs/InputString.vue'
import InputBoolean from './inputs/InputBoolean.vue'
import InputNumber from './inputs/InputNumber.vue'
import InputRaw from './inputs/InputRaw.vue'
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
  // NOTE: the prop.type might be array as supported by Vue prop definition
  // TODO: vue seems only checks the first type if it's an array?
  type = isArray(type) ? type[0] : type

  // call factory function for non-Function types
  if (isFunction(def) && getPropTypeName(def) !== 'Function') {
    return def.call(vm)
  }

  return def
}

// the order matters as match function will be run in the order as defined
const propTypeDefinitions = [
  {
    name: 'String',
    component: InputString,
    match: (value) => typeof value === 'string',
  },
  {
    name: 'Boolean',
    component: InputBoolean,
    match: (value) => typeof value === 'boolean',
  },
  {
    name: 'Number',
    component: InputNumber,
    match: (value) => typeof value === 'number',
  },
  {
    name: 'Any',
    component: InputRaw,
    match: () => true,
  },
]

export const registerPropTypeDefinition = () => {
  throw new Error('Not Implemented')
}

/**
 * Get the prop type definition by prop.type.
 */
export const resolvePropTypeDefinition = (propType) => {
  let propTypeName

  if (typeof propType === 'undefined') {
    propTypeName = 'Any'
  } else {
    // support pass type as string
    propTypeName =
      (typeof propType === 'string' ? propType : getPropTypeName(propType)) ||
      ''
  }

  return (
    propTypeDefinitions.find((d) => d.name === propTypeName) || {
      name: propTypeName || 'Unknown',
      component: InputRaw,
      match: () => false,
    }
  )
}

export const findMatchedPropTypeDefinition = (propValue) => {
  return propTypeDefinitions.find((d) => d.match(propValue))
}
