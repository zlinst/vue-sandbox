import { objectUpdate } from './utils.js'

const DEFAULT_CONFIG = {
  enablePropEval: false,
}

let config = { ...DEFAULT_CONFIG }

export const getConfig = () => config
export const updateConfig = (opts = {}) => {
  objectUpdate(config, opts)
}
