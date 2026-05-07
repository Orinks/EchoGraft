app.screen.help = app.screenManager.invent({
  id: 'help',
  parentSelector: '.a-app--help',
  rootSelector: '.a-help',
  transitions: {
    back: function () {
      this.change('mainMenu')
    },
  },
  onReady: function () {
    this.rootElement.innerHTML = `
      <p class="c-menu--eyebrow">Listening guide</p>
      <h1 class="c-menu--title">Help</h1>
      <p>Arrow keys move. Space scans. Enter plants or picks up the selected seed. Tab cycles seeds. Brackets tune pitch. G grafts. R resets. Escape returns to the main menu.</p>
      <button class="c-menu--item" type="button">Main menu</button>
    `
    this.rootElement.querySelector('button').onclick = () => app.screenManager.dispatch('back')
  },
  onFrame: function () {
    const key = app.input.consume()
    if (key == 'Escape' || key == 'Enter' || key == ' ') app.screenManager.dispatch('back')
  },
})
