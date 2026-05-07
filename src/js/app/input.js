app.input = (() => {
  const queue = []

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Escape', 'Tab', '[', ']'].includes(event.key)) {
      event.preventDefault()
    }
    queue.push(event.key)
  })

  return {
    consume: () => queue.shift(),
  }
})()
