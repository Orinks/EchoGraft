const app = (() => {
  let active = false

  return {
    activate: function () {
      active = true
      document.querySelector('.a-app').classList.add('a-app-active')
      return this
    },
    isActive: () => active,
    isElectron: () => typeof ElectronApi != 'undefined',
    name: () => 'EchoGraft',
    screen: {},
    utility: {},
    version: () => '0.1.0',
  }
})()
