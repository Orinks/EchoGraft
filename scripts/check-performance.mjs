import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const distDir = path.resolve('dist')
const budgets = {
  cssBytes: 50_000,
  jsBytes: 700_000,
  totalBytes: 750_000,
}

async function filesUnder(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return filesUnder(fullPath)
    if (!entry.isFile()) return []
    const info = await stat(fullPath)
    return [{ fullPath, size: info.size }]
  }))

  return nested.flat()
}

const files = await filesUnder(distDir)
const jsBytes = files.filter((file) => file.fullPath.endsWith('.js')).reduce((sum, file) => sum + file.size, 0)
const cssBytes = files.filter((file) => file.fullPath.endsWith('.css')).reduce((sum, file) => sum + file.size, 0)
const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
const failures = [
  jsBytes > budgets.jsBytes ? `JavaScript ${jsBytes} exceeds ${budgets.jsBytes}` : '',
  cssBytes > budgets.cssBytes ? `CSS ${cssBytes} exceeds ${budgets.cssBytes}` : '',
  totalBytes > budgets.totalBytes ? `Total ${totalBytes} exceeds ${budgets.totalBytes}` : '',
].filter(Boolean)

if (failures.length) {
  console.error(`Performance budget failed: ${failures.join('; ')}`)
  process.exit(1)
}

console.log(`Performance budget passed: JS ${jsBytes}/${budgets.jsBytes} bytes; CSS ${cssBytes}/${budgets.cssBytes} bytes; total ${totalBytes}/${budgets.totalBytes} bytes.`)
