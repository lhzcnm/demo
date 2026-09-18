import type { RouteRecordRaw } from 'vue-router'
import { kebabCase } from './common'

type Views = Record<string, () => Promise<Component>>
const contents = import.meta.glob<Component>('../contents/**/*.mdx')

export const contentPaths = Object.keys(contents)
export const routes = getRouteChildren(contents)

function getRouteChildren(views: Views) {
  const children: RouteRecordRaw[] = []

  for (const path in views) {
    const groups = path.match(/(?<name>[-\w]+)\/index.mdx/)?.groups
    const component = withDisplayName(import(`../contents/${groups?.name}/index.mdx`))

    if (typeof groups === 'object') {
      children.push({
        name: groups.name,
        path: kebabCase(groups.name),
        component: () => component,
      })
    }
  }

  return children
}

async function withDisplayName(importPromise: Promise<any>) {
  const mdxExports = await importPromise
  mdxExports.default.displayName = mdxExports.default.name
  return mdxExports
}
