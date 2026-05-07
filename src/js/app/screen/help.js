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
      <p>EchoGraft is about restoring Ark systems, not surviving reflex tests. Each chamber names the system you are bringing online, then asks you to match its resonance heart with position, pitch, and sometimes grafting.</p>
      <p>Arrow keys move with spatial step sounds. Space scans. Enter plants the selected seed. Tab cycles seeds. Brackets tune pitch. G grafts. N restores and advances after a chamber is solved. R resets. Escape returns to the main menu.</p>
      <p>There is no always-on HUD. Press O for the current objective, P for position and Ark progress, and I for selected seed and inventory. Every important audio cue is mirrored in the caption log.</p>
      <button class="c-menu--item" type="button">Main menu</button>
    `
    this.rootElement.querySelector('button').onclick = () => app.screenManager.dispatch('back')
  },
  onFrame: function () {
    const key = app.input.consume()
    if (key == 'Escape' || key == 'Enter' || key == ' ') app.screenManager.dispatch('back')
  },
})
