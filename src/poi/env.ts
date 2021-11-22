export const IN_POI = 'POI_VERSION' in globalThis
/**
 * Prevent webpack early error
 * Module not found: Error: Can't resolve 'views/create-store'
 * TODO fix webpack warn
 * Critical dependency: the request of a dependency is an expression
 */

export const importFromPoi = <T = any>(path: string): Promise<T> => {
  if (!IN_POI) {
    return new Promise(() => {
      // Never resolve
    })
  }
  return import(path)
}
