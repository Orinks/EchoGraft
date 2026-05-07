app.screen.base = {
  id: undefined,
  parentSelector: undefined,
  rootSelector: undefined,
  transitions: {},
  onReady: function () {},
  onEnter: function () {},
  onExit: function () {},
  onFrame: function () {},
  enter: function (...args) {
    this.parentElement.removeAttribute('aria-hidden')
    this.parentElement.removeAttribute('hidden')
    this.parentElement.classList.add('a-app--screen-active')
    this.parentElement.classList.remove('a-app--screen-inactive')
    this.onEnter(...args)
    this.focusWithin()
    return this
  },
  exit: function (...args) {
    this.parentElement.setAttribute('aria-hidden', 'true')
    this.parentElement.classList.remove('a-app--screen-active')
    this.parentElement.classList.add('a-app--screen-inactive')
    this.parentElement.hidden = true
    this.onExit(...args)
    return this
  },
  ready: function () {
    this.parentElement = document.querySelector(this.parentSelector)
    this.parentElement.setAttribute('aria-hidden', 'true')
    this.parentElement.hidden = true
    this.rootElement = document.querySelector(this.rootSelector)
    app.utility.focus.trap(this.rootElement)
    this.onReady()
    return this
  },
  focusWithin: function () {
    app.utility.focus.set(this.rootElement.getAttribute('tabindex') == '-1'
      ? this.rootElement
      : this.rootElement.querySelector('button') || this.rootElement)
    return this
  },
}
