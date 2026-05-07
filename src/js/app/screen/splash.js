app.screen.splash = app.screenManager.invent({
  id: 'splash',
  parentSelector: '.a-app--splash',
  rootSelector: '.a-splash',
  transitions: {
    interact: function () {
      this.change('mainMenu')
    },
  },
  onReady: function () {
    const root = this.rootElement
    root.addEventListener('click', () => this.interact())
    root.querySelector('.a-splash--instruction').onclick = () => this.interact()
    root.querySelector('.a-splash--version').innerHTML = `v${app.version()}`
  },
  onEnter: function () {
    this.onKeydown = (event) => {
      if (event.code == 'Enter' || event.code == 'Space') {
        event.preventDefault()
        this.interact()
      }
    }
    window.addEventListener('keydown', this.onKeydown)
    this.rootElement.querySelector('.a-splash--instruction').focus()
  },
  onExit: function () {
    window.removeEventListener('keydown', this.onKeydown)
  },
  interact: function () {
    engine.loop.resume()
    content.cues.confirm()
    app.screenManager.dispatch('interact')
    return this
  },
})
