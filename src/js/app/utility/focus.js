app.utility.focus = {
  set: function (element) {
    if (element && typeof element.focus == 'function') {
      element.focus()
    }

    return this
  },
  setWithin: function (element) {
    return this.set(element.querySelector('button, [href], input, select, textarea, [tabindex]') || element)
  },
  trap: function (element) {
    element.addEventListener('keydown', (event) => {
      if (event.key != 'Tab') return

      const focusable = [...element.querySelectorAll('button, [href], input, select, textarea, [tabindex]')]
        .filter((item) => !item.disabled && item.getAttribute('tabindex') != '-1')

      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement == first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement == last) {
        event.preventDefault()
        first.focus()
      }
    })

    return this
  },
}
