import { objectUpdate } from './helpers'

const DEFAULT_CONFIG = Object.freeze({
  allowPropEval: false,
})

let config

export const getConfig = () => config || DEFAULT_CONFIG

export const initConfig = (data = {}) => {
  if (config) {
    console.warn('Configuration is already initialised')
    return
  }

  let tempConfig = { ...DEFAULT_CONFIG }
  objectUpdate(tempConfig, data)
  config = Object.freeze(tempConfig)
}
