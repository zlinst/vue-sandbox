export const getInputComponent = (propType) => {
  if (typeof propType === 'string') {
    switch (propType.toLowerCase()) {
      case 'string':
        return () => import('./inputs/InputString.vue')
    }
  }

  return () => import('./inputs/InputUnknown.vue')
}

export default {
  getInputComponent,
}
