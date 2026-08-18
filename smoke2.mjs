import { spawn } from 'node:child_process'

const PORT = 5197
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
})

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

for (let i = 0; i < 40; i++) {
  await sleep(500)
  try {
    const main = await fetch(`http://127.0.0.1:${PORT}/`)
    const common = await fetch(`http://127.0.0.1:${PORT}/common_map.json`)
    const full = await fetch(`http://127.0.0.1:${PORT}/word_map_40k.json`)
    const cjson = await common.json()
    const fjson = await full.json()
    console.log('INDEX', main.status)
    console.log('COMMON', common.status, 'keys', Object.keys(cjson).length, 'the', cjson['the'] ? 'ok' : 'MISSING')
    console.log('FULL', full.status, 'keys', Object.keys(fjson).length, 'the', fjson['the'] ? 'ok' : 'MISSING')
    server.kill()
    process.exit(0)
  } catch {
    /* booting */
  }
}
server.kill()
console.log('TIMEOUT')
process.exit(1)