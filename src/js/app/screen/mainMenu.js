app.screen.mainMenu = app.screenManager.invent({
  id: 'mainMenu',
  parentSelector: '.a-app--mainMenu',
  rootSelector: '.a-mainMenu',
  transitions: {
    continue: function () {
      this.change('game')
    },
    help: function () {
      this.change('help')
    },
    newGame: function () {
      content.game.reset()
      this.change('game')
    },
    options: function () {
      this.change('options')
    },
  },
  state: {
    index: 0,
    items: [
      {action: 'newGame', description: 'Start from the first Verdancy Ark chamber.', label: 'New game'},
      {action: 'continue', description: 'Continue the current EchoGraft run.', label: 'Continue'},
      {action: 'options', description: 'Adjust audio preferences.', label: 'Options'},
      {action: 'help', description: 'Review controls and listening goals.', label: 'Help'},
    ],
  },
  onReady: function () {
    this.summaryElement = this.rootElement.querySelector('.c-menu--summary')
    this.itemsElement = this.rootElement.querySelector('.c-menu--items')
    this.render()
  },
  onEnter: function () {
    content.music.start('menu')
    this.render()
  },
  onFrame: function () {
    const key = app.input.consume()
    if (key == 'ArrowDown') this.move(1)
    else if (key == 'ArrowUp') this.move(-1)
    else if (key == 'Enter' || key == ' ') this.select()
  },
  move: function (direction) {
    this.state.index = (this.state.index + direction + this.state.items.length) % this.state.items.length
    content.cues.menuMove()
    this.render()
  },
  render: function () {
    this.itemsElement.innerHTML = ''
    this.state.items.forEach((item, index) => {
      const button = document.createElement('button')
      button.className = 'c-menu--item'
      button.setAttribute('role', 'menuitem')
      button.setAttribute('aria-current', index == this.state.index ? 'true' : 'false')
      button.type = 'button'
      button.innerText = item.label
      button.onclick = () => {
        this.state.index = index
        this.select()
      }
      this.itemsElement.appendChild(button)
    })
    this.summaryElement.innerText = `${this.state.items[this.state.index].description} Use arrows and Enter.`
  },
  select: function () {
    const item = this.state.items[this.state.index]
    content.cues.confirm()
    app.screenManager.dispatch(item.action)
  },
})
