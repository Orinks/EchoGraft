import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const banned = new Set(['.mp3', '.wav', '.ogg', '.flac', '.aiff', '.aif', '.m4a'])
const ignored = new Set(['node_modules', '.git', 'dist', 'release', '.omx'])
const found = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignored.has(entry)) continue
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) walk(path)
    else if (banned.has(path.slice(path.lastIndexOf('.')).toLowerCase())) found.push(path)
  }
}

walk(process.cwd())

if (found.length) {
  console.error(`External audio assets are forbidden:\n${found.join('\n')}`)
  process.exit(1)
}

console.log('No external audio assets found.')
