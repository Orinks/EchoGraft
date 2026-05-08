import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const failures = []

function requireFile(relativePath) {
  if (!existsSync(path.join(root, relativePath))) {
    failures.push(`Missing ${relativePath}`)
  }
}

function requireScript(name, expected) {
  const actual = packageJson.scripts?.[name] ?? ''
  if (!actual.includes(expected)) {
    failures.push(`Script ${name} must include ${expected}`)
  }
}

requireFile('dist/index.html')
requireFile('dist/vendor/syngen.js')
requireFile(packageJson.main ?? '')
requireFile('electron/preload.cjs')

requireScript('build', 'scripts/build-static.mjs')
requireScript('preview', '--root dist')
requireScript('package:electron', 'electron-builder --dir')
requireScript('package:electron', '--config.win.signAndEditExecutable=false')
requireScript('release:electron', 'npm run build')
requireScript('release:electron', 'npm run package:electron')

const index = existsSync(path.join(root, 'dist/index.html'))
  ? readFileSync(path.join(root, 'dist/index.html'), 'utf8')
  : ''
if (!index.includes('./vendor/syngen.js')) {
  failures.push('dist/index.html must reference packaged Syngen runtime')
}
if (index.includes('/node_modules/')) {
  failures.push('dist/index.html must not depend on node_modules paths')
}
if (index.includes('src="/assets/') || index.includes('href="/assets/')) {
  failures.push('dist/index.html must use relative asset URLs for Electron file loading')
}

const electronMain = existsSync(path.join(root, packageJson.main ?? ''))
  ? readFileSync(path.join(root, packageJson.main), 'utf8')
  : ''
if (!electronMain.includes("'dist', 'index.html'")) {
  failures.push('Electron main process must load dist/index.html')
}

const buildFiles = packageJson.build?.files ?? []
for (const required of ['dist/**/*', 'electron/**/*', 'package.json']) {
  if (!buildFiles.includes(required)) {
    failures.push(`electron-builder files must include ${required}`)
  }
}

if (failures.length) {
  console.error(`Packaging check failed:\n${failures.join('\n')}`)
  process.exit(1)
}

console.log('Packaging check passed: static dist, Syngen runtime, preview, and Electron package config are aligned.')
