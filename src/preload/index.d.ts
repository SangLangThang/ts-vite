import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  onPlayerConnected: (callback: (data: any) => void) => void
  onPlayerLogin: (callback: (data: any) => void) => void
  onPlayerListUpdate: (callback: (data: any) => void) => void
  onPlayerBagUpdate: (callback: (data: any) => void) => any
  onPlayerEquipmentUpdate: (callback: (data: any) => void) => any
  onPlayerBattleUpdate: (callback: (data: any) => void) => any
  onPlayerPartyUpdate: (callback: (data: any) => void) => any
  onPlayerPetBattleUpdate: (callback: (data: any) => void) => any
  removePlayerConnectedListener: () => void
  removePlayerLoginListener: () => void
  removePlayerListUpdateListener: () => void
  removePlayerBagUpdateListener: (handler?: any) => void
  removePlayerEquipmentUpdateListener: (handler?: any) => void
  removePlayerBattleUpdateListener: (handler?: any) => void
  removePlayerPartyUpdateListener: (handler?: any) => void
  removePlayerPetBattleUpdateListener: (handler?: any) => void
  requestPlayerBag: (playerId: number) => void
  requestPlayerEquipment: (playerId: number) => void
  requestPlayerBattle: (playerId: number) => void
  requestPlayerParty: (playerId: number) => void
  updatePlayerParty: (playerId: number, party: any) => void
  invitePartyMembers: (playerId: number, partyConfig: any) => void
  saveConfig: (config: any) => Promise<{ success: boolean; filePath?: string; message?: string }>
  loadConfig: () => Promise<{ success: boolean; config?: any; message?: string }>
  debugXorWithAD: (hexString: string) => Promise<string>
  debugDecimalToHex: (decimal: number) => Promise<{ hex: string; rearranged: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
