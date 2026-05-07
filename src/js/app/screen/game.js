app.screen.game = app.screenManager.invent({
  id: 'game',
  parentSelector: '.a-app--game',
  rootSelector: '.a-game',
  transitions: {
    back: function () {
      this.change('mainMenu')
    },
  },
  onReady: function () {
    this.rootElement.innerHTML = `
      <p class="c-menu--eyebrow">Verdancy Ark</p>
      <h1 class="a-game--title"></h1>
      <div class="a-game--announcement u-screenReader" aria-live="polite" aria-atomic="true"></div>
      <div class="a-game--actions">
        <button type="button" data-action="scan">Scan pulse</button>
        <button type="button" data-action="plant">Plant seed</button>
        <button type="button" data-action="seed">Cycle seed</button>
        <button type="button" data-action="tuneUp">Tune up</button>
        <button type="button" data-action="graft">Graft</button>
        <button type="button" data-action="advance">Restore and advance</button>
      </div>
      <ol class="a-game--log" aria-label="Caption and event log" aria-live="polite"></ol>
    `
    this.titleElement = this.rootElement.querySelector('.a-game--title')
    this.announcementElement = this.rootElement.querySelector('.a-game--announcement')
    this.logElement = this.rootElement.querySelector('.a-game--log')
    this.rootElement.querySelector('[data-action="scan"]').onclick = () => this.act('scan')
    this.rootElement.querySelector('[data-action="plant"]').onclick = () => this.act('plant')
    this.rootElement.querySelector('[data-action="seed"]').onclick = () => this.act('seed')
    this.rootElement.querySelector('[data-action="tuneUp"]').onclick = () => this.act('tuneUp')
    this.rootElement.querySelector('[data-action="graft"]').onclick = () => this.act('graft')
    this.rootElement.querySelector('[data-action="advance"]').onclick = () => this.act('advance')
  },
  onEnter: function () {
    content.music.start('game', {chamber: content.game.chamber(), score: 0})
    this.render()
  },
  onFrame: function () {
    const key = app.input.consume()
    if (key == 'Escape') return app.screenManager.dispatch('back')
    if (key == 'ArrowUp') this.message(content.game.move(0, 1))
    else if (key == 'ArrowDown') this.message(content.game.move(0, -1))
    else if (key == 'ArrowLeft') this.message(content.game.move(-1, 0))
    else if (key == 'ArrowRight') this.message(content.game.move(1, 0))
    else if (key == ' ') this.message(content.game.scan())
    else if (key == 'Enter') this.message(content.game.plant())
    else if (key == 'Tab') this.message(content.game.selectSeed(1))
    else if (key == ']') this.message(content.game.tune(1))
    else if (key == '[') this.message(content.game.tune(-1))
    else if (key == 'g' || key == 'G') this.message(content.game.graft())
    else if (key == 'i' || key == 'I') this.message(content.game.summarizeInventory())
    else if (key == 'n' || key == 'N') this.message(content.game.advance())
    else if (key == 'o' || key == 'O') this.message(content.game.summarizeObjective())
    else if (key == 'p' || key == 'P') this.message(content.game.summarizePosition())
    else if (key == 'r' || key == 'R') this.message(content.game.reset())
  },
  act: function (action) {
    if (action == 'scan') this.message(content.game.scan())
    else if (action == 'plant') this.message(content.game.plant())
    else if (action == 'seed') this.message(content.game.selectSeed(1))
    else if (action == 'tuneUp') this.message(content.game.tune(1))
    else if (action == 'graft') this.message(content.game.graft())
    else if (action == 'advance') this.message(content.game.advance())
  },
  message: function (message) {
    this.announcementElement.innerText = message
    this.render()
  },
  render: function () {
    const state = content.game.get()
    this.titleElement.innerText = state.chamber.title
    this.logElement.innerHTML = state.eventLog.map((entry) => `<li>${entry}</li>`).join('')
  },
})
