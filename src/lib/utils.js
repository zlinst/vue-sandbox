export const has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export const isArray = (obj) => {
  return Array.isArray(obj)
}
