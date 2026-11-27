import { name } from '../../package.json'

export const PACKAGE_NAME = name as 'poi-plugin-quest-info-2'

export const IN_POI = 'POI_VERSION' in globalThis
/**
 * Prevent webpack early error
 * Module not found: Error: Can't resolve 'views/create-store'
 * TODO fix webpack warn
 * Critical dependency: the request of a dependency is an expression
 */

export const importFromPoi = async <T = any>(path: string): Promise<T> => {
  if (!IN_POI) {
    return new Promise(() => {
      // Never resolve
    })
  }
  // poi makes views/* available through the renderer's CommonJS resolver.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(path)
}
