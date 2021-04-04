export const objectHas = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export const isArray = (obj) => {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(obj) === '[object Array]'
  }
  return Array.isArray(obj)
}

export const stringify = (obj, pretty) => {
  switch (typeof obj) {
    case 'object':
      return JSON.stringify(obj, null, pretty ? 2 : 0)
    case 'string':
      return `"${obj}"`
    default:
      return String(obj)
  }
}

export const isFunction = (obj) => {
  return typeof obj === 'function'
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
