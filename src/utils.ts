export const noop = () => {}

export const id = <T>(x: T) => x

export const yes = () => true as const

export const And =
  <T extends (...args: any[]) => boolean>(...fnArray: T[]) =>
  (...args: Parameters<T>) =>
    fnArray.every((fn) => fn(...args))

export const Or =
  <T extends (...args: any[]) => boolean>(...fnArray: T[]) =>
  (...args: Parameters<T>) =>
    fnArray.some((fn) => fn(...args))
