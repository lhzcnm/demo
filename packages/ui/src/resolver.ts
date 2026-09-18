import type { ComponentResolver } from 'unplugin-vue-components'

export function UIResolver(): ComponentResolver[] {
  return [
    {
      type: 'component',
      resolve: (name: string) => {
        if (name.startsWith('X')) {
          return { name, from: '@3un/ui' }
        }
      },
    }
  ]
}
