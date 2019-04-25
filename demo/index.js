import main from './main'
import getComments from './get-comments'

const app = main({})
let el = document.querySelector('[data-server-rendered]')
if (!el) {
  const placeholder = getComments('vue-ssr-outlet', true)
  el = document.createElement('div')
  if (placeholder) {
    placeholder.parentNode.replaceChild(el, placeholder)
  } else {
    console.warn('You do neither have a ssr root nor a ssr comment in your document')
    document.body.appendChild(el)
  }
}

app.$mount(el)