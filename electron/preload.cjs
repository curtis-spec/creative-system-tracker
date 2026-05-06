const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('creativeSystemTracker', {
  platform: process.platform,
})
