import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const host = '127.0.0.1'
const portIndex = process.argv.indexOf('--port')
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT) || 4177
const rootIndex = process.argv.indexOf('--root')
const root = rootIndex >= 0 ? join(process.cwd(), process.argv[rootIndex + 1] ?? '.') : process.cwd()

const types = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.woff': 'font/woff',
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${host}:${port}`)
  const requested = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  let path = join(root, requested)

  if (!existsSync(path) || statSync(path).isDirectory()) {
    path = join(path, 'index.html')
  }

  if (!existsSync(path)) {
    response.writeHead(404, {'content-type': 'text/plain'})
    response.end('Not found')
    return
  }

  response.writeHead(200, {'content-type': types[extname(path)] ?? 'application/octet-stream'})
  createReadStream(path).pipe(response)
}).listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}/`)
})
