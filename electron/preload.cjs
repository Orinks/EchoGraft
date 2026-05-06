const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('echograftShell', {
  platform: process.platform,
})
