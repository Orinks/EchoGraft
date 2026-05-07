app.screenManager = (() => {
  const screens = new Map()
  let current
  let state = 'none'

  function change(next, ...args) {
    if (current) current.exit()
    state = next
    current = screens.get(next)
    if (current) current.enter(...args)
  }

  return {
    current: () => current,
    dispatch: function (event, ...args) {
      if (state == 'none' && event == 'activate') change('splash', ...args)
      else if (current && current.transitions[event]) current.transitions[event].call({change}, ...args)
      return this
    },
    invent: function (definition = {}, prototype = app.screen.base) {
      const screen = Object.setPrototypeOf({...definition}, prototype)
      screens.set(screen.id, screen)
      return screen
    },
    ready: function () {
      for (const screen of screens.values()) screen.ready()
      return this
    },
    update: function (event) {
      if (current) current.onFrame(event)
      return this
    },
  }
})()

engine.loop.on('frame', (event) => app.screenManager.update(event))
