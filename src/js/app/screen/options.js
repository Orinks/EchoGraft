app.screen.options = app.screenManager.invent({
  id: 'options',
  parentSelector: '.a-app--options',
  rootSelector: '.a-options',
  transitions: {
    back: function () {
      this.change('mainMenu')
    },
  },
  onReady: function () {
    this.summaryElement = this.rootElement.querySelector('.c-menu--summary')
    this.itemsElement = this.rootElement.querySelector('.c-menu--items')
    this.itemsElement.innerHTML = '<button class="c-menu--item" type="button">Back</button>'
    this.itemsElement.querySelector('button').onclick = () => app.screenManager.dispatch('back')
    this.summaryElement.innerText = 'Audio is synthesized through Syngen at runtime. Volume controls will be expanded as the template migration continues.'
  },
  onFrame: function () {
    const key = app.input.consume()
    if (key == 'Escape' || key == 'Enter' || key == ' ') app.screenManager.dispatch('back')
  },
})
