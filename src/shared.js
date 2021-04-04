export const objectHas = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export const isArray = (obj) => {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(obj) === '[object Array]'
  }
  return Array.isArray(obj)
}

export const isFunction = (obj) => {
  return typeof obj === 'function'
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

/**
 * Get prop default value.
 *
 * See: https://github.com/vuejs/vue/blob/fa1f81e91062e9de6161708209cd7354733aa354/src/core/util/props.js#L67
 */
export const parsePropDefault = (vm, propType, propDefault) => {
  // TODO: vue seems only checks the first type if it's an array?
  propType = isArray(propType) ? propType[0] : propType

  // call factory function for non-Function types
  if (
    isFunction(propDefault) === 'function' &&
    parsePropType(propType) !== 'Function'
  ) {
    return propDefault.call(vm)
  }

  return propDefault
}

/**
 * Check if prop evaluation is allowed by looking up the environment variables.
 */
export const checkPropEvalAllowed = () => {
  if (!process && !process.env) {
    return false
  }

  return (
    process.env.VUE_APP_SANDBOX_PROP_EVAL === 'allow' ||
    process.env.SANDBOX_PROP_EVAL === 'allow'
  )
}
