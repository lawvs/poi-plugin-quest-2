import { existsSync, mkdirSync } from 'fs'
import type { PathLike } from 'fs'

export const prepareDir = (dir: PathLike) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}
