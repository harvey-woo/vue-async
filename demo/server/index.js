const fs = require('fs')
const path = require('path')
const express = require('express')
const server = express()
const Bundler = require('parcel-bundler')
const vueSr = require('vue-server-renderer')
const htmlTemplate = 'demo/index.html'
const serialize = require('serialize-javascript');
const clientDist = 'dist'
const serverOutFilePath = path.join(process.cwd(), clientDist, 'server.js')
const clientBundler = new Bundler(htmlTemplate, {
  outDir: clientDist,
  publicUrl: `/${clientDist}`
})
const serverBundler = new Bundler(path.join(__dirname, '../main.js'), {
  outDir: clientDist,
  outFile: 'server.js',
  target: 'node'
})

function extractInitState(vm) {
  const state = {}
  if (vm.$asyncComputedItems) {
    vm.$asyncComputedItems.forEach(item => {
      state[item.key] = vm[item.key]
    })
  }

  if (vm.$children) {
    state.$children = vm.$children.map(extractInitState)
  }
  return state
}

async function main() {
  await clientBundler.bundle()
  await serverBundler.bundle()
  const middleware = clientBundler.middleware()
  const main = require(serverOutFilePath).default
  const renderer = vueSr.createRenderer({
    template: fs.readFileSync(path.join(clientDist, 'index.html'), 'utf-8')
  })

  server.use(async (req, res, next) => {
    if (req.originalUrl.startsWith(`/${clientDist}/`)) {
      middleware(req, res, next)
    } else {
      const context = { res, req }
      const app = main(context)
      try {
        context.router.push(req.url)
        let html = await renderer.renderToString(app)
        const s = serialize(extractInitState(app), { extractRef: true })
        html = html.replace('<!--vue-ssr-init-state-->', `<script>VUE_ASYNC_INIT_STATE = ${s}</script>`)
        res.end(html)
      } catch(e) {
        console.error(e)
      }
    }
  })
  server.listen(1234)
}
main()
