import type { App, Component } from 'vue'
type options = {
  key: string
  component: Component
}[]

export default {
  install: (app: App<Element>, options: Readonly<options>) => {
    options.forEach((item) => {
      app.component(item.key, item.component)
    })
  }
}
