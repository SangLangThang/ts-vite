import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Listen to player events from main process
  onPlayerConnected: (callback: (data: any) => void) => {
    ipcRenderer.on('player:connected', (_event, data) => callback(data))
  },
  onPlayerLogin: (callback: (data: any) => void) => {
    ipcRenderer.on('player:login', (_event, data) => callback(data))
  },
  onPlayerListUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('player:list-update', (_event, data) => callback(data))
  },
  onPlayerBagUpdate: (callback: (data: any) => void) => {
    const handler = (_event: any, data: any) => callback(data)
    ipcRenderer.on('player:bag-update', handler)
    return handler
  },
  onPlayerEquipmentUpdate: (callback: (data: any) => void) => {
    const handler = (_event: any, data: any) => callback(data)
    ipcRenderer.on('player:equipment-update', handler)
    return handler
  },
  onPlayerBattleUpdate: (callback: (data: any) => void) => {
    const handler = (_event: any, data: any) => callback(data)
    ipcRenderer.on('player:battle-update', handler)
    return handler
  },
  onPlayerPartyUpdate: (callback: (data: any) => void) => {
    const handler = (_event: any, data: any) => callback(data)
    ipcRenderer.on('player:party-update', handler)
    return handler
  },
  // Remove listeners
  removePlayerConnectedListener: () => {
    ipcRenderer.removeAllListeners('player:connected')
  },
  removePlayerLoginListener: () => {
    ipcRenderer.removeAllListeners('player:login')
  },
  removePlayerListUpdateListener: () => {
    ipcRenderer.removeAllListeners('player:list-update')
  },
  removePlayerBagUpdateListener: (handler?: any) => {
    if (handler) {
      ipcRenderer.removeListener('player:bag-update', handler)
    } else {
      ipcRenderer.removeAllListeners('player:bag-update')
    }
  },
  removePlayerEquipmentUpdateListener: (handler?: any) => {
    if (handler) {
      ipcRenderer.removeListener('player:equipment-update', handler)
    } else {
      ipcRenderer.removeAllListeners('player:equipment-update')
    }
  },
  removePlayerBattleUpdateListener: (handler?: any) => {
    if (handler) {
      ipcRenderer.removeListener('player:battle-update', handler)
    } else {
      ipcRenderer.removeAllListeners('player:battle-update')
    }
  },
  removePlayerPartyUpdateListener: (handler?: any) => {
    if (handler) {
      ipcRenderer.removeListener('player:party-update', handler)
    } else {
      ipcRenderer.removeAllListeners('player:party-update')
    }
  },
  requestPlayerBag: (playerId: number) => {
    ipcRenderer.send('player:request-bag', playerId)
  },
  requestPlayerEquipment: (playerId: number) => {
    ipcRenderer.send('player:request-equipment', playerId)
  },
  requestPlayerBattle: (playerId: number) => {
    ipcRenderer.send('player:request-battle', playerId)
  },
  requestPlayerParty: (playerId: number) => {
    ipcRenderer.send('player:request-party', playerId)
  },
  updatePlayerParty: (playerId: number, party: any) => {
    ipcRenderer.send('player:update-party', { playerId, party })
  },
  invitePartyMembers: (playerId: number, partyConfig: any) => {
    ipcRenderer.send('party:invite-members', { playerId, partyConfig })
  },
  saveConfig: (config: any) => {
    return ipcRenderer.invoke('config:save', config)
  },
  loadConfig: () => {
    return ipcRenderer.invoke('config:load')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
