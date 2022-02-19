import fs from 'fs'
import path from 'path'
import { prepareDir } from './utils'

const ASSETS_PATH = path.resolve('assets')
const OUTPUT_PATH = path.resolve('build')
const OUTPUT_FILE = path.resolve(OUTPUT_PATH, 'assets.ts')
const CONVERT_EXTS = ['jpg', 'png'] as const

const HEADER = `/* eslint-disable prettier/prettier */
/**
 * This file was automatically generated by \`${path.relative(
   // project root
   process.cwd(),
   __filename
 )}\`
 * Do not edit this file directly.
 */` as const

function base64Encode(file: string) {
  const bitmap = fs.readFileSync(file)
  return bitmap.toString('base64')
}

function main() {
  prepareDir(OUTPUT_PATH)
  const imageData = fs
    .readdirSync(ASSETS_PATH)
    // exclusive ignored ext
    .filter((f) => CONVERT_EXTS.some((ext) => f.endsWith('.' + ext)))
    .map((fileName) => {
      const filePath = path.resolve(ASSETS_PATH, fileName)
      const parsedFile = path.parse(fileName)
      return {
        name: parsedFile.name,
        ext: parsedFile.ext.slice(1),
        base64: base64Encode(filePath),
      }
    })

  const data = `${HEADER}

${imageData
  .map(
    ({ name, ext, base64 }) =>
      `export const ${name} = 'data:image/${ext};base64, ${base64}'`
  )
  .join('\n')}
`

  fs.writeFileSync(OUTPUT_FILE, data)

  // eslint-disable-next-line no-console
  console.log('Converted', imageData.length, 'images.')
}

main()
