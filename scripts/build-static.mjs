import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { build } from 'vite'

const distDir = path.resolve('dist')
const syngenSource = path.resolve('node_modules/syngen/dist/syngen.js')
const syngenTarget = path.join(distDir, 'vendor', 'syngen.js')
const indexPath = path.join(distDir, 'index.html')

await build({
  base: './',
  build: {
    emptyOutDir: true,
    outDir: distDir,
  },
})

await mkdir(path.dirname(syngenTarget), { recursive: true })
await copyFile(syngenSource, syngenTarget)

const index = await readFile(indexPath, 'utf8')
await writeFile(
  indexPath,
  index.replace('/node_modules/syngen/dist/syngen.js', './vendor/syngen.js'),
)

console.log('Static package built with bundled app assets and packaged Syngen runtime.')
