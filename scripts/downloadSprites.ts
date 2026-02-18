/* eslint-disable no-console */
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
// See https://sharp.pixelplumbing.com/
import sharp from 'sharp'
import { fetch } from './proxyFetch'
import { prepareDir } from './utils'

const OUTPUT_PATH = path.resolve('build', 'dutySprites')

const SERVER_URL = 'http://203.104.209.199'
const JSON_PATH = '/kcs2/img/duty/duty_main.json'
const SPRITES_PATH = '/kcs2/img/duty/duty_main.png'
const VERSION = '5.1.2.0'
const SPRITES_URL = `${SERVER_URL}${SPRITES_PATH}?version=${VERSION}`
const META_URL = `${SERVER_URL}${JSON_PATH}?version=${VERSION}`

const getFilename = (url: string) => {
  const pathname = new URL(url).pathname
  const index = pathname.lastIndexOf('/')
  return index !== -1 ? pathname.slice(index + 1) : pathname
}

const download = async (url: string, filename?: string) => {
  if (!filename) {
    filename = getFilename(url)
  }
  const filePath = path.resolve(OUTPUT_PATH, filename)
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)
  fs.writeFileSync(filePath, buffer)
  return { filePath, buffer }
}

const checksumFile = (algorithm: string, path: fs.PathLike) => {
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash(algorithm)
    const stream = fs.createReadStream(path)
    stream.pipe(hash)
    stream.on('error', (err) => reject(err))
    hash.on('finish', () => resolve(hash.digest('hex')))
  })
}

const cropAndSaveImage = (
  img: Uint8Array,
  {
    name,
    format,
    x,
    y,
    w,
    h,
  }: {
    name: string
    format: string
    x: number
    y: number
    w: number
    h: number
  },
) => {
  const filename = `${name}.${format}`
  sharp(img)
    .extract({ left: x, top: y, width: w, height: h })
    .toFile(path.resolve(OUTPUT_PATH, filename))
    .catch((err) => {
      console.error('Failed to process image:', filename, err)
    })
}

type KCS2Meta = {
  frames: {
    [name: string]: {
      frame: {
        x: number
        y: number
        w: number
        h: number
      }
      rotated: boolean
      trimmed: boolean
      spriteSourceSize: {
        x: number
        y: number
        w: number
        h: number
      }
      sourceSize: {
        w: number
        h: number
      }
    }
  }
  meta: any
}

const parseSprites = (sprites: Uint8Array, meta: KCS2Meta) => {
  const { frames } = meta
  for (const [name, { frame }] of Object.entries(frames)) {
    cropAndSaveImage(sprites, { ...frame, name, format: 'png' })
  }
}

const main = async () => {
  prepareDir(OUTPUT_PATH)
  const [
    { buffer: metaBuffer },
    { filePath: spritesPath, buffer: spritesBuffer },
  ] = await Promise.all([download(META_URL), download(SPRITES_URL)])

  const spritesFilename = path.parse(spritesPath).base
  const md5 = await checksumFile('md5', spritesPath)
  fs.writeFileSync(path.resolve(OUTPUT_PATH, `${spritesFilename}.md5`), md5)
  console.log('File download complete')
  console.log(spritesFilename, 'MD5:', md5)

  parseSprites(spritesBuffer, JSON.parse(new TextDecoder().decode(metaBuffer)))
}

main()

process.on('unhandledRejection', (up) => {
  throw up
})
