import { useEffect, useRef, useState, EffectCallback } from 'react'

// See react-use
// licensed under the The Unlicense
// https://github.com/streamich/react-use

const useEffectOnce = (effect: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [])
}

const useUnmount = (fn: () => any): void => {
  const fnRef = useRef(fn)

  // update the ref each render so if it change the newest callback will be invoked
  fnRef.current = fn

  useEffectOnce(() => () => fnRef.current())
}

export const useThrottle = <T>(value: T, ms = 200) => {
  const [state, setState] = useState<T>(value)
  const timeout = useRef<ReturnType<typeof setTimeout>>()
  const nextValue = useRef(null) as any
  const hasNextValue = useRef(0) as any

  useEffect(() => {
    if (!timeout.current) {
      setState(value)
      const timeoutCallback = () => {
        if (hasNextValue.current) {
          hasNextValue.current = false
          setState(nextValue.current)
          timeout.current = setTimeout(timeoutCallback, ms)
        } else {
          timeout.current = undefined
        }
      }
      timeout.current = setTimeout(timeoutCallback, ms)
    } else {
      nextValue.current = value
      hasNextValue.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useUnmount(() => {
    timeout.current && clearTimeout(timeout.current)
  })

  return state
}

export const IS_POI = 'POI_VERSION' in window
