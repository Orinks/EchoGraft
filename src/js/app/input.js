app.input = (() => {
  const keyMap = new Map([
    ['ArrowUp', 'ArrowUp'],
    ['ArrowDown', 'ArrowDown'],
    ['ArrowLeft', 'ArrowLeft'],
    ['ArrowRight', 'ArrowRight'],
    ['Space', ' '],
    ['Enter', 'Enter'],
    ['Escape', 'Escape'],
    ['Tab', 'Tab'],
    ['BracketLeft', '['],
    ['BracketRight', ']'],
    ['KeyG', 'g'],
    ['KeyI', 'i'],
    ['KeyN', 'n'],
    ['KeyO', 'o'],
    ['KeyP', 'p'],
    ['KeyR', 'r'],
  ])
  const previous = {}
  const queue = []

  window.addEventListener('keydown', (event) => {
    if (keyMap.has(event.code)) {
      event.preventDefault()
      if (!event.repeat) {
        queue.push(keyMap.get(event.code))
        previous[event.code] = true
      }
    }
  })

  engine.loop.on('frame', () => {
    const keyboard = engine.input.keyboard.get()

    for (const [code, key] of keyMap) {
      if (keyboard[code] && !previous[code]) queue.push(key)
      previous[code] = keyboard[code]
    }
  })

  return {
    consume: () => queue.shift(),
  }
})()
