import { UpstreamContext } from 'node-tcp-proxy';
import { ClientBot, Player } from '../types';

// Global clients store - accessible from anywhere
export const clients: Record<number, ClientBot> = {};

// Reference to renderer send function (set from main process)
let rendererSendFn: ((event: string, data: any) => void) | null = null;

/**
 * Set the renderer send function
 */
export function setRendererSend(fn: (event: string, data: any) => void) {
  rendererSendFn = fn;
}

/**
 * Get list of all players from clients
 * @returns Array of all players
 */
export function getListPlayer(): Player[] {
  return Object.values(clients).map((client) => client.player);
}

/**
 * Update or create a client in the global clients store
 * @param id - Client ID
 * @param context - Upstream context from the proxy
 */
export function updateClient(id: number, context: UpstreamContext): void {
  if (!clients[id]) {
    // Initialize new client with default values
    const newPlayer: Player = {
      _Id: id,
      _Name: '',
      _Lv: 0,
      _Lv2: 0,
      _Sex: 0,
      _Hair: 0,
      _HairColor: 0,
      _SkinColor: 0,
      _Hp: 0,
      _HpMax: 0,
      _Sp: 0,
      _SpMax: 0,
      _MapId: 0,
      _MapX: 0,
      _MapY: 0,
      _Gold: 0,
      _ExpTotal: 0,
      _Exp: 0,
      _ExpMax: 0,
      _ExpMin: 0,
      _Int: 0,
      _Atk: 0,
      _Def: 0,
      _Hpx: 0,
      _Spx: 0,
      _Agi: 0,
      _Int2: 0,
      _Atk2: 0,
      _Def2: 0,
      _Hpx2: 0,
      _Spx2: 0,
      _Agi2: 0,
      _Int_Plus1: 0,
      _Atk_Plus1: 0,
      _Def_Plus1: 0,
      _Hpx_Plus1: 0,
      _Spx_Plus1: 0,
      _Agi_Plus1: 0,
      _Int_Plus2: 0,
      _Atk_Plus2: 0,
      _Def_Plus2: 0,
      _Hpx_Plus2: 0,
      _Spx_Plus2: 0,
      _Agi_Plus2: 0,
      _Int3: 0,
      _Atk3: 0,
      _Def3: 0,
      _Hpx3: 0,
      _Spx3: 0,
      _Int4: 0,
      _Atk4: 0,
      _Def4: 0,
      _Hpx4: 0,
      _Spx4: 0,
      _Agi4: 0,
      _Texp: 0,
      _God: 0,
      _Ghost: 0,
      _Reborn: 0,
      _ThuocTinh: 0,
      _PlayerOnline: 0,
      _LeaderId: 0,
      _PartyFull: false,
      _Point: 0,
      _MapName: ''
    };

    // Initialize empty inventory arrays with proper sizes (slots start from 1)
    const emptyTuido = Array.from({ length: 25 }, (_, i) => ({
      _Stt: i + 1,
      _Id: 0,
      _Name: '',
      _Sl: 0,
      _Doben: 0
    }));

    const emptyTuideo = Array.from({ length: 25 }, (_, i) => ({
      _Stt: i + 1,
      _Id: 0,
      _Name: '',
      _Sl: 0,
      _Doben: 0
    }));

    const emptyLuulang = Array.from({ length: 10 }, (_, i) => ({
      _Stt: i + 1,
      _Id: 0,
      _Name: '',
      _Sl: 0,
      _Doben: 0
    }));

    clients[id] = {
      socket: {
        context: context,
        remotePort: (context as any).proxySocket?.remotePort || null,
        connectByTool: true,
        m_f: '' // Initialize m_f as empty string
      },
      player: newPlayer,
      pets: [],
      charEquip: [],
      petEquip: [],
      tuido: emptyTuido,
      tuideo: emptyTuideo,
      luulang: emptyLuulang,
      battleInfo: [],
      turn: 0, // Battle turn counter
      charCol: 0, // Character column position in battle
      battle: 0, // Battle state (0 = not in battle, 1 = in battle)
      party: {
        leaderId: 0,
        member1Id: 0,
        member2Id: 0,
        member3Id: 0,
        member4Id: 0,
        currentPartyId: 0,
        currentMember1: 0,
        currentMember2: 0,
        currentMember3: 0,
        currentMember4: 0,
        partyFull: false,
        qsMemberIndex: 0
      },
      battleSkillConfig: {
        changeGemChar: false,
        hoisinhChar: false,
        autoAttack: false,
        skillNormalChar: 0,
        skillSoloChar: 0,
        skillSpecialChar: 0,
        skillCCChar: 0,
        skillBuffChar: 0,
        skillClearChar: 0,
        changeGemPet: false,
        hoisinhPet: false,
        skillNormalPet: 0,
        skillSoloPet: 0,
        skillSpecialPet: 0,
        skillCCPet: 0,
        skillBuffPet: 0,
        skillClearPet: 0
      }
    };

    // Send initial player data to UI
    if (rendererSendFn) {
      rendererSendFn('player:connected', {
        id: id,
        status: 'Connecting',
        player: newPlayer
      });

      // Send updated list derived from clients
      rendererSendFn('player:list-update', {
        listPlayer: getListPlayer()
      });
    }
  } else {
    // Update existing client socket information
    clients[id].socket.context = context;
    clients[id].socket.remotePort = (context as any).proxySocket?.remotePort || null;
    clients[id].socket.connectByTool = true;
    clients[id].socket.m_f = ''; // Reset m_f to empty string on update
  }
}

/**
 * Get a client by ID
 * @param id - Client ID
 * @returns ClientBot or undefined if not found
 */
export function getClient(id: number): ClientBot | undefined {
  return clients[id];
}

/**
 * Remove a client from the store
 * @param id - Client ID
 */
export function removeClient(id: number): void {
  delete clients[id];
}

/**
 * Get all clients
 * @returns Record of all clients
 */
export function getAllClients(): Record<number, ClientBot> {
  return clients;
}
