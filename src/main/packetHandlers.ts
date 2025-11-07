/* eslint-disable @typescript-eslint/no-unused-vars */
import { sendPacketWithDelay } from '.';
import API from '../helpers/API';
import { DATA_BATTLE_PET, DATA_ITEM } from '../helpers/constant2';
import { clients, getListPlayer } from '../store/clients';
import { ClientBot } from '../types';
import { rendererSend } from './renderer';

export const remotePorts: [number, number | null][] = [];

// Skill ID categories for status tracking
export const LIST_HARD_CC = [
  13018, 10033, 10004, 11014, 14008, 14021, 20014, 20025, 20026, 20027, 13002
];
export const LIST_SOFT_CC = [10019];
export const LIST_REMOVE_CC = [11019, 11025, 11031, 20015];
export const LIST_DEF = [10031, 10010, 13021, 14013];
export const LIST_BUFF = [12025];

// Status types
export enum BattleStatus {
  NONE = 'none',
  HARD_CC = 'hard_cc',
  SOFT_CC = 'soft_cc',
  DEFENSE = 'defense',
  BUFF = 'buff',
  DEBUFF = 'debuff'
}

// Helper function to get skill status type
function getSkillStatusType(skillId: number): BattleStatus {
  if (LIST_HARD_CC.includes(skillId)) return BattleStatus.HARD_CC;
  if (LIST_SOFT_CC.includes(skillId)) return BattleStatus.SOFT_CC;
  if (LIST_DEF.includes(skillId)) return BattleStatus.DEFENSE;
  if (LIST_BUFF.includes(skillId)) return BattleStatus.BUFF;
  return BattleStatus.NONE;
}

// Helper function to check if skill removes CC
function isRemoveCCSkill(skillId: number): boolean {
  return LIST_REMOVE_CC.includes(skillId);
}

export function onReceivePacket(packet: Buffer, remotePort: number) {
  const find = remotePorts.find((e) => e[1] == remotePort);
  if (!find) return;
  const account = clients[find[0]];

  try {
    // Apply XOR decryption to the packet
    let text = API.byteToHexstring(API.EncDec_byte(packet));
    if (account.socket.m_f.length > 0) {
      text = account.socket.m_f + text;
      account.socket.m_f = '';
    }

    text = text.replace(/f444/g, '#f444'); // Use the same header as in C#
    const array = text.split('#');

    for (let i = 0; i < array.length; i++) {
      let text2 = array[i];
      try {
        if (account.socket.m_f.length > 0) {
          text2 = account.socket.m_f + text2;
          account.socket.m_f = '';
        }

        if (!text2.startsWith('f444')) {
          continue;
        }

        if (text2.length >= 8) {
          const num = API.hexToInt32(text2.substring(4, 8));
          if (text2.length >= 8 + num * 2) {
            checkReceivePacket(API.hexStringToByte(text2), remotePort);
          } else if (text2.length < 8 + num * 2) {
            account.socket.m_f = text2;
          }
        } else {
          account.socket.m_f = text2;
        }
      } catch (_ex) {
        // Ignore packet parsing errors
      }
    }
  } catch (_ex) {
    // Ignore general errors
  }
}

export function checkReceivePacket(A_0: any, remotePort: any) {
  switch (A_0[4]) {
    case 1:
      //A_0[5] = 3 : check have char or not
      break;
    case 2:
      checkNoti(A_0, remotePort);
      break;
    case 3:
      checkLogin(A_0, remotePort);
      break;
    case 5:
      checkFinishDialog(A_0, remotePort);
      break;
    case 6:
      check6(A_0, remotePort);
      break;
    case 11:
      checkBattle(A_0, remotePort);
      break;
    case 12:
      checkWarpFinish(A_0, remotePort);
      break;
    case 13:
      checkParty(A_0, remotePort);
      break;
    case 15:
      checkDataPetInList(A_0, remotePort);
      break;
    case 19:
      checkDataPetBattle(A_0, remotePort);
      break;
    case 20:
      checkDialog(A_0, remotePort);
      break;
    case 23:
      checkDataBag(A_0, remotePort);
      break;
    case 50:
      checkInfoInBattle(A_0, remotePort);
      break;
    case 52:
      checkTurn(A_0, remotePort);
      break;
    case 53:
      checkRemoveCC(A_0, remotePort);
      break;
  }
}

// Placeholder functions for packet handlers - will be implemented later
function checkNoti(_A_0: any, _remotePort: any) {
  // TODO: Implement checkNoti
}

function checkLogin(A_0: number[], remotePort: number) {
  try {
    const find = remotePorts.find((e) => e[1] == remotePort);
    if (!find) return;
    const account = clients[find[0]];
    if (!account) return;

    const num = parseInt(API.byteToHexstring([A_0[8], A_0[7], A_0[6], A_0[5]]), 16);
    const map = parseInt(API.byteToHexstring([A_0[13], A_0[12]]), 16);
    const name = API.getNameFromHex(A_0);

    if (account.player._Id == num && account.socket.connectByTool) {
      // Update player data in clients
      account.player._MapId = map;
      account.player._Name = name;
      account.player._PlayerOnline = 1;

      // Send update to UI immediately
      rendererSend('player:login', {
        id: num,
        name: name,
        mapId: map,
        status: 'Online',
        player: account.player
      });

      // Also send the entire updated list derived from clients
      rendererSend('player:list-update', {
        listPlayer: getListPlayer()
      });
    }
  } catch {
    // Ignore errors
  }
}

function checkFinishDialog(_A_0: any, _remotePort: any) {
  // TODO: Implement checkFinishDialog
}

function check6(_A_0: any, _remotePort: any) {
  // TODO: Implement check6
}

function clearDataBattleInPosition(client: ClientBot, index: number) {
  client.battleInfo[index] = null;
}

function getLocation2(i: string) {
  switch (i) {
    case '0000':
      return 1;
    case '0001':
      return 2;
    case '0002':
      return 3;
    case '0003':
      return 4;
    case '0004':
      return 5;

    case '0100':
      return 6;
    case '0101':
      return 7;
    case '0102':
      return 8;
    case '0103':
      return 9;
    case '0104':
      return 10;

    case '0200':
      return 11;
    case '0201':
      return 12;
    case '0202':
      return 13;
    case '0203':
      return 14;
    case '0204':
      return 15;

    case '0300':
      return 16;
    case '0301':
      return 17;
    case '0302':
      return 18;
    case '0303':
      return 19;
    case '0304':
      return 20;

    default:
      return null;
  }
}

function checkBattle(A_0: number[], remotePort: number) {
  const find = remotePorts.find((e) => e[1] == remotePort);
  if (!find) return;
  const account = clients[find[0]];

  try {
    const b = A_0[5];

    switch (b) {
      case 1:
        // End battle at specific location
        {
          const locationString = `${A_0[6].toString(16).padStart(2, '0')}${A_0[7].toString(16).padStart(2, '0')}`;
          const location = getLocation2(locationString);
          if (location) {
            clearDataBattleInPosition(account, location - 1);

            // Send battle update to renderer
            rendererSend('player:battle-update', {
              id: find[0],
              battleInfo: account.battleInfo,
              turn: account.turn,
              battle: account.battle
            });
          }
        }
        break;

      case 0:
        // Clear all battle data when battle ends for this player
        {
          const num18 = API.byteToInt16([A_0[9], A_0[8], A_0[7], A_0[6]]);
          if (num18 === account.player._Id || num18 === account.player._LeaderId) {
            // Clear all 20 battle positions
            let num19 = 1;
            do {
              clearDataBattleInPosition(account, num19 - 1);
              num19++;
            } while (num19 <= 20);

            // Reset battle state
            account.turn = 0;
            account.battle = 0;

            // Send battle update to renderer
            rendererSend('player:battle-update', {
              id: find[0],
              battleInfo: account.battleInfo,
              turn: account.turn,
              battle: account.battle
            });

            // If battle was active, perform end battle cleanup
            // C# calls a() method here which likely handles battle end logic
          }
        }
        break;

      case 5:
        // Update battle entity info (HP/SP changes during battle)
        {
          const hexString = API.byteToHexstring(A_0);
          const num10 = API.hexToInt32(hexString.substring(16, 24)); // Entity ID
          const num11 = API.hexToInt32(hexString.substring(28, 36)); // Character ID
          const a_2 = hexString.substring(36, 40); // Location hex
          const num12 = API.hexToInt32(hexString.substring(48, 52)); // Current HP
          const num13 = API.hexToInt32(hexString.substring(40, 44)); // Max HP
          const num14 = API.hexToInt32(hexString.substring(52, 56)); // Current SP
          const num15 = API.hexToInt32(hexString.substring(44, 48)); // Max SP
          const num16 = A_0[28]; // Level
          const num17 = A_0[29]; // Element (ThuocTinh)
          const b2 = A_0[7]; // Type

          let text4 = '';
          // Type 2 or 9 = player, otherwise NPC/monster
          if (b2 === 2 || b2 === 9) {
            text4 = `Player_${num10}`;
            if (num10 == account.player._Id) {
              text4 = account.player._Name;
            } else if (clients[num10].player) {
              text4 = clients[num10].player._Name;
            }
          } else {
            // Get NPC/monster name from ID (would need implementation)
            const findNPC = DATA_BATTLE_PET.find((e) => e[0] === num10);

            text4 = findNPC ? findNPC[1] : `NPC_${num10}`;
          }

          const location = getLocation2(a_2);

          if (location) {
            const battleIndex = location - 1;
            if (battleIndex >= 0) {
              // Preserve existing statuses if updating
              const existingStatuses = account.battleInfo[battleIndex]?._Statuses || [];

              account.battleInfo[battleIndex] = {
                _Id: num10,
                _Name: text4,
                _Lv: num16,
                _Hp: num12,
                _HpMax: num13,
                _Sp: num14,
                _SpMax: num15,
                _ThuocTinh: num17,
                _Type: A_0[7],
                _IdChar: num11,
                _Statuses: existingStatuses
              };

              // Send battle update to renderer
              rendererSend('player:battle-update', {
                id: find[0],
                battleInfo: account.battleInfo,
                turn: account.turn,
                battle: account.battle
              });
            }
          }

          // If this is the player's pet, update pet info
          // Need to check if num10 matches a pet ID and update accordingly
        }
        break;

      case 250:
        // Battle start - initialize all battle entities
        {
          const hexString = API.byteToHexstring(A_0);
          let text = hexString.substring(16);

          // Parse all battle entities (48 hex chars = 24 bytes per entity)
          while (text.length > 0) {
            const text2 = text.substring(0, 48);
            const array = API.hexStringToByte(text2);

            const num = API.hexToInt32(text2.substring(2, 4)); // Type
            const num2 = API.hexToInt32(text2.substring(4, 12)); // Entity ID
            const num3 = API.hexToInt32(text2.substring(26, 34)); // Character ID
            const a_ = text2.substring(24, 28); // Location hex

            let text3 = '';
            // Type 2 or 9 = player
            if (num === 2 || num === 9) {
              if (num2 == account.player._Id) {
                text3 = account.player._Name;
              } else if (clients[num2].player) {
                text3 = clients[num2].player._Name;
              }
            } else {
              const findNPC = DATA_BATTLE_PET.find((e) => e[0] === num2);

              text3 = findNPC ? findNPC[1] : `NPC_${num2}`;
            }

            const num4 = API.hexToInt32(text2.substring(36, 40)); // Current HP
            const num5 = API.hexToInt32(text2.substring(28, 32)); // Max HP
            const num6 = API.hexToInt32(text2.substring(40, 44)); // Current SP
            const num7 = API.hexToInt32(text2.substring(32, 36)); // Max SP
            const num8 = array[22]; // Level
            const num9 = A_0[23]; // Element

            const location = getLocation2(a_);
            if (location) {
              const battleIndex = location - 1;
              if (battleIndex >= 0) {
                account.battleInfo[battleIndex] = {
                  _Id: num2,
                  _Name: text3,
                  _Lv: num8,
                  _Hp: num4,
                  _HpMax: num5,
                  _Sp: num6,
                  _SpMax: num7,
                  _ThuocTinh: num9,
                  _Type: num,
                  _IdChar: num3,
                  _Statuses: [] // Initialize empty statuses array at battle start
                };
              }
            }

            // If this is the current player, mark battle as started
            if (num2 === account.player._Id) {
              account.charCol = array[13];
              account.battle = 1;
              account.turn = 0;
            }

            text = text.replace(text2, '');
          }

          // Send battle update to renderer after processing all entities
          rendererSend('player:battle-update', {
            id: find[0],
            battleInfo: account.battleInfo,
            turn: account.turn,
            battle: account.battle
          });
        }
        break;

      case 11:
        // Mini date/time update during battle
        {
          // Convert 8 bytes starting at position 6 to double (timestamp)
          // const miniDate = ... would need proper 64-bit float conversion
          // This appears to be battle timer related
        }
        break;
    }
  } catch {
    // Ignore battle packet errors
  }
}

function checkWarpFinish(_A_0: any, _remotePort: any) {
  // TODO: Implement checkWarpFinish
}

function checkParty(A_0: number[], remotePort: number) {
  try {
    const find = remotePorts.find((e) => e[1] === remotePort);
    if (!find) return;
    const account = clients[find[0]];

    const caseType = A_0[5];

    switch (caseType) {
      case 1: {
        // Party invite received (member wants to join your party)
        const memberId = API.hexToInt32(API.byteToHexstring(A_0).substring(12, 20));

        // Check if this member is in your configured member list (you are the leader)
        if (
          memberId === account.party.member1Id ||
          memberId === account.party.member2Id ||
          memberId === account.party.member3Id ||
          memberId === account.party.member4Id
        ) {
          const packet = API.leaderAcceptedPartyFrom(memberId);
          sendPacketWithDelay(account.socket.context, packet, 0);
        }
        break;
      }

      case 4: {
        // Member left party
        const memberId = API.hexToInt32(API.byteToHexstring(A_0).substring(12, 20));

        // Clear the member from current party
        if (memberId === account.party.currentMember1) {
          account.party.currentMember1 = 0;
        } else if (memberId === account.party.currentMember2) {
          account.party.currentMember2 = 0;
        } else if (memberId === account.party.currentMember3) {
          account.party.currentMember3 = 0;
        } else if (memberId === account.party.currentMember4) {
          account.party.currentMember4 = 0;
        } else if (memberId === account.party.leaderId) {
          account.party.currentPartyId = 0;
        } else if (memberId === account.player._Id) {
          account.party.currentPartyId = 0;
        }

        // Check if party is still full
        account.party.partyFull = checkPartyFull(account);

        // Send update to renderer
        rendererSend('player:party-update', {
          id: find[0],
          party: account.party
        });
        break;
      }

      case 5: {
        // Member joined party
        const leaderId = API.hexToInt32(API.byteToHexstring(A_0).substring(12, 20));
        const memberId = API.hexToInt32(API.byteToHexstring(A_0).substring(20, 28));

        if (account.player._Id === leaderId) {
          // Add member to appropriate slot
          if (memberId === account.party.member1Id) {
            account.party.currentMember1 = memberId;
          } else if (memberId === account.party.member2Id) {
            account.party.currentMember2 = memberId;
          } else if (memberId === account.party.member3Id) {
            account.party.currentMember3 = memberId;
          } else if (memberId === account.party.member4Id) {
            account.party.currentMember4 = memberId;
          }

          account.party.partyFull = checkPartyFull(account);
        } else if (account.player._Id === memberId) {
          // You joined a party
          if (account.party.currentPartyId === 0) {
            account.party.currentPartyId = leaderId;
          }
        }

        // Send update to renderer
        rendererSend('player:party-update', {
          id: find[0],
          party: account.party
        });
        break;
      }

      case 9: {
        // Party invite sent confirmation
        const targetId = API.hexToInt32(API.byteToHexstring(A_0).substring(12, 20));

        // Check if this is the configured leader accepting your invite
        if (targetId === account.party.leaderId) {
          // TODO: Send accept party packet
        }
        break;
      }

      default:
        //console.log(`[checkParty] Unknown case: ${caseType}`);
        break;
    }
  } catch (error) {}
}

// Helper function to check if party is full
function checkPartyFull(account: ClientBot): boolean {
  const party = account.party;
  const member1Ok =
    party.member1Id === party.currentMember1 &&
    (party.member1Id !== 0 || party.currentMember1 !== 0);
  const member2Ok = party.member2Id !== 0 || party.currentMember2 !== 0;
  const member3Ok = party.member3Id !== 0 || party.currentMember3 !== 0;
  const member4Ok = party.member4Id !== 0 || party.currentMember4 !== 0;

  return member1Ok && member2Ok && member3Ok && member4Ok;
}

function checkDataPetInList(A_0: number[], remotePort: number) {
  const find = remotePorts.find((e) => e[1] == remotePort);
  if (!find) return;
  const account = clients[find[0]];
  if (!account) return;

  try {
    switch (A_0[5]) {
      case 8: {
        // Parse pet list (from C# _ClientBot.cs line 6075-6181)
        account.pets = [];
        let text = API.byteToHexstring(A_0).substring(12);

        while (text.length != 0) {
          const text2 = text.substring(0, 196 + (API.hexStringToByte(text)[29] + 1) * 2);
          const array = API.hexStringToByte(text2);

          // const slot = array[0]; // Pet slot (1-4) - not used
          const id = API.hexToInt32(text2.substring(2, 6)); // Pet ID
          const lv = array[7]; // Pet level
          const thuocTinh = 0; // Element (will be determined from NPC data)

          // Parse HP/SP
          const hp = API.hexToInt32(text2.substring(16, 20));
          const hpMax = API.hexToInt32(text2.substring(16, 20)); // Same as HP initially
          const sp = API.hexToInt32(text2.substring(20, 24));
          const spMax = API.hexToInt32(text2.substring(20, 24)); // Same as SP initially
          const fai = array[25]; // FAI stat

          // Parse experience
          const expTotal = API.hexToInt32(text2.substring(6, 14));

          // Parse stats
          const int_ = API.hexToInt32(text2.substring(24, 28));
          const atk = API.hexToInt32(text2.substring(28, 32));
          const def = API.hexToInt32(text2.substring(32, 36));
          const agi = API.hexToInt32(text2.substring(36, 40));
          const hpx = API.hexToInt32(text2.substring(40, 44));
          const spx = API.hexToInt32(text2.substring(44, 48));

          // Parse equipment IDs from the end of the packet
          const mu = API.hexToInt32(text2.substring(text2.length - 132, text2.length - 128));
          const ao = API.hexToInt32(text2.substring(text2.length - 112, text2.length - 108));
          const vukhi = API.hexToInt32(text2.substring(text2.length - 92, text2.length - 88));
          const tay = API.hexToInt32(text2.substring(text2.length - 72, text2.length - 68));
          const chan = API.hexToInt32(text2.substring(text2.length - 52, text2.length - 48));
          const dacthu = API.hexToInt32(text2.substring(text2.length - 32, text2.length - 28));

          const reborn = array[28]; // Reborn level

          // Parse pet name
          let petName = '';
          const nameLength = array[29];
          for (let i = 30; i <= 29 + nameLength; i++) {
            petName += String.fromCharCode(array[i]);
          }

          const pet = {
            _Id: id,
            _Name: petName,
            _Lv: lv,
            _ThuocTinh: thuocTinh,
            _Hp: hp,
            _HpMax: hpMax,
            _Sp: sp,
            _SpMax: spMax,
            _Fai: fai,
            _ExpTotal: expTotal,
            _Exp: 0,
            _ExpMax: 0,
            _ExpMin: 0,
            _Texp: 0,
            _Reborn: reborn,
            _Int: int_,
            _Atk: atk,
            _Def: def,
            _Hpx: hpx,
            _Spx: spx,
            _Agi: agi,
            _Int2: 0,
            _Atk2: 0,
            _Def2: 0,
            _Hpx2: 0,
            _Spx2: 0,
            _Agi2: 0,
            _Int3: 0,
            _Atk3: 0,
            _Def3: 0,
            _Hpx3: 0,
            _Spx3: 0,
            _Agi3: 0,
            _Mu: mu,
            _Ao: ao,
            _vukhi: vukhi,
            _tay: tay,
            _chan: chan,
            _dacthu: dacthu,
            _Mu_Doben: 0, // Durability not in packet
            _Ao_Doben: 0,
            _vukhi_Doben: 0,
            _tay_Doben: 0,
            _chan_Doben: 0,
            _dacthu_Doben: 0,
            _Proto: 0
          };

          account.pets.push(pet);
          text = text.replace(text2, '');
        }

        // Send pets update to renderer
        rendererSend('player:equipment-update', {
          id: find[0],
          charEquip: account.charEquip,
          pets: account.pets
        });

        //console.log(`Loaded ${account.pets.length} pets for player ${find[0]}`);
        break;
      }
    }
  } catch (error) {}
}

function checkDataPetBattle(A_0: number[], remotePort: number) {
  const find = remotePorts.find((e) => e[1] == remotePort);
  if (!find) return;
  const account = clients[find[0]];
  if (!account) return;

  try {
    const b = A_0[5];

    if (b === 2) {
      // Pet battle ended
      account.petBattle = 0;

      // Send update to renderer
      rendererSend('player:petBattle-update', {
        id: find[0],
        petBattle: 0
      });
      return;
    }

    // Parse the pet ID from the packet
    const petId = API.hexToInt32(API.byteToHexstring([A_0[6], A_0[7]]));

    // Find which pet slot (1-4) matches this ID
    const petIndex = account.pets.findIndex((pet) => pet._Id === petId);

    if (petIndex !== -1) {
      // Store 1-based index (1-4) for pet battle
      account.petBattle = petIndex + 1;

      // Send update to renderer
      rendererSend('player:petBattle-update', {
        id: find[0],
        petBattle: account.petBattle
      });
    }
  } catch (error) {
    // Ignore errors
  }
}

function checkDialog(_A_0: any, _remotePort: any) {
  // TODO: Implement checkDialog
}

function checkDataBag(A_0: number[], remotePort: number) {
  const find = remotePorts.find((e) => e[1] == remotePort);
  if (!find) return;
  const account = clients[find[0]];
  if (!account) return;

  switch (A_0[5]) {
    case 2: {
      // Remove item from map
      try {
        const text = API.byteToHexstring(A_0).substring(12);
        const num16 = API.hexToInt32(text.substring(0, 4));
        // Data_ItemOnMaps[num16 - 1] = default(_Data._ItemOnMap);
        // TODO: Implement item on map tracking if needed
      } catch (error) {}
      break;
    }

    case 3: {
      // Add item to map
      try {
        const text6 = API.byteToHexstring(A_0).substring(12);
        const id4 = API.hexToInt32(text6.substring(0, 4));
        const mapX = API.hexToInt32(text6.substring(4, 4));
        const mapY = API.hexToInt32(text6.substring(8, 4));
        // TODO: Implement item on map tracking if needed
      } catch (error) {}
      break;
    }

    case 4: {
      // Unknown bag operation (empty in C# code)
      try {
        const text4 = API.byteToHexstring(A_0).substring(12);
        // Empty processing in original code
      } catch (error) {}
      break;
    }

    case 5: {
      // Initial bag data
      let num53 = 6;
      const tempTuido = [...account.tuido];

      do {
        const array3 = API.byteArrayToByteArray(A_0, num53, 12);
        num53 += 12;
        const slot = array3[0]; // Server sends 1-based slot numbers
        const id = parseInt(API.byteToHexstring([array3[2], array3[1]]), 16);
        const sl = array3[3];
        const doben = array3[4];

        // Use slot - 1 for array index since arrays are 0-based but server uses 1-based
        if (slot >= 1 && slot <= 25) {
          tempTuido[slot - 1] = {
            _Stt: slot,
            _Id: id,
            _Name: '', // Will be populated from item data if needed
            _Sl: sl,
            _Doben: doben
          };
        }
      } while (num53 < A_0.length);

      account.tuido = tempTuido;

      rendererSend('player:bag-update', {
        id: find[0],
        tuido: account.tuido,
        tuideo: account.tuideo,
        luulang: account.luulang
      });
      //console.log('account.tuido', account.tuido);
      break;
    }

    case 6: {
      // Add items to bag
      try {
        const id = API.sliceStringHexToInt32(A_0, 12, 16);
        const sl = API.sliceStringHexToInt32(A_0, 16, 18);

        const listItemSameId: number[] = [];
        account.tuido.forEach((e, index) => e._Id == id && listItemSameId.push(index));

        let remainingSL = sl;

        for (let i = 0; i < listItemSameId.length; i++) {
          const slotIndex = listItemSameId[i];
          const currentSL = account.tuido[slotIndex]._Sl;

          const canAccept = 50 - currentSL;

          if (canAccept > 0) {
            const addAmount = Math.min(canAccept, remainingSL);
            const newSL = currentSL + addAmount;

            account.tuido[slotIndex]._Sl = newSL;
            remainingSL -= addAmount;

            if (remainingSL <= 0) break;
          }
        }

        while (remainingSL > 0) {
          const emptySlotIndex = account.tuido.findIndex((item) => item._Id === 0);

          if (emptySlotIndex === -1) break;

          const slotAmount = Math.min(remainingSL, 50);
          account.tuido[emptySlotIndex] = {
            _Stt: emptySlotIndex,
            _Id: id,
            _Name: '',
            _Sl: slotAmount,
            _Doben: 0
          };

          remainingSL -= slotAmount;
        }

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch {}
      break;
    }

    case 8: {
      // Add single item to specific slot
      try {
        const id = API.sliceStringHexToInt32(A_0, 14, 18);
        const slot = A_0[6]; // 1-based from server
        const sl = A_0[9];
        const arrayIndex = slot - 1; // Convert to 0-based array index

        if (arrayIndex >= 0 && arrayIndex < account.tuido.length) {
          if (account.tuido[arrayIndex]._Id == 0) {
            account.tuido[arrayIndex] = {
              _Stt: slot,
              _Id: id,
              _Name: '',
              _Sl: sl,
              _Doben: 0
            };
          } else if (account.tuido[arrayIndex]._Id == id) {
            const currentSL = account.tuido[arrayIndex]._Sl + sl;
            if (currentSL >= 50) {
              account.tuido[arrayIndex]._Sl = 50;
              const outSL = currentSL - 50;
              const nullItemIndex = account.tuido.findIndex((item) => item._Id === 0);
              if (nullItemIndex !== -1) {
                account.tuido[nullItemIndex] = {
                  _Stt: nullItemIndex + 1, // Convert back to 1-based for _Stt
                  _Id: id,
                  _Name: '',
                  _Sl: outSL,
                  _Doben: 0
                };
              }
            } else {
              account.tuido[arrayIndex]._Sl = currentSL;
            }
          }
        }

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch {}
      break;
    }

    case 9: {
      // Remove items from bag
      try {
        const slot = A_0[6]; // 1-based from server
        const sl = A_0[7];
        const arrayIndex = slot - 1; // Convert to 0-based array index

        if (arrayIndex >= 0 && arrayIndex < account.tuido.length) {
          const currentBag = account.tuido[arrayIndex];

          currentBag._Sl -= sl;
          const currentSL = currentBag._Sl;

          if (currentSL <= 0) {
            account.tuido[arrayIndex] = {
              _Stt: slot,
              _Id: 0,
              _Name: '',
              _Sl: 0,
              _Doben: 0
            };
          } else {
            account.tuido[arrayIndex]._Sl = currentSL;
          }
        }

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch {}
      break;
    }

    case 10: {
      // Move items between slots
      try {
        const stt14 = A_0[6]; // source slot (1-based from server)
        const num52 = A_0[7]; // quantity to move
        const stt15 = A_0[8]; // destination slot (1-based from server)

        const srcIndex = stt14 - 1; // Convert to 0-based array index
        const destIndex = stt15 - 1; // Convert to 0-based array index

        if (
          srcIndex >= 0 &&
          srcIndex < account.tuido.length &&
          destIndex >= 0 &&
          destIndex < account.tuido.length
        ) {
          const src = account.tuido[srcIndex];
          const dest = account.tuido[destIndex];

          if (dest._Sl === 0 && dest._Id === 0) {
            account.tuido[destIndex] = {
              _Stt: stt15,
              _Id: src._Id,
              _Name: src._Name,
              _Sl: num52,
              _Doben: src._Doben
            };
          } else {
            account.tuido[destIndex]._Sl = dest._Sl + num52;
          }

          if (src._Sl - num52 === 0) {
            account.tuido[srcIndex] = {
              _Stt: stt14,
              _Id: 0,
              _Name: '',
              _Sl: 0,
              _Doben: 0
            };
          } else {
            account.tuido[srcIndex]._Sl = src._Sl - num52;
          }
        }

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch {}
      break;
    }

    case 7: {
      // Remove items from bag (alternative method with item ID)
      try {
        const num38 = parseInt(API.byteToHexstring([A_0[7], A_0[6]]), 16);
        const num39 = A_0[8]; // quantity

        if (num39 > 0) {
          // Find and remove items matching the ID
          account.tuido.forEach((item, index) => {
            if (item._Id === num38) {
              if (item._Sl === num39) {
                account.tuido[index] = {
                  _Stt: item._Stt,
                  _Id: 0,
                  _Name: '',
                  _Sl: 0,
                  _Doben: 0
                };
              } else if (item._Sl > num39) {
                account.tuido[index]._Sl -= num39;
              } else if (item._Sl < num39) {
                if (item._Sl > 1) {
                  account.tuido[index]._Sl -= 1;
                } else {
                  account.tuido[index] = {
                    _Stt: item._Stt,
                    _Id: 0,
                    _Name: '',
                    _Sl: 0,
                    _Doben: 0
                  };
                }
              }
            }
          });
        }

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch (error) {}
      break;
    }

    case 16: {
      // Unequip character equipment to bag
      try {
        const num33 = A_0[6]; // equipment slot (1-based)
        const stt11 = A_0[7]; // bag slot (1-based)
        const equipIndex = num33 - 1;
        const bagIndex = stt11 - 1;

        if (equipIndex >= 0 && equipIndex < 6 && bagIndex >= 0 && bagIndex < account.tuido.length) {
          // Move equipment to bag
          const equipItem = account.charEquip[equipIndex];
          if (equipItem) {
            account.tuido[bagIndex] = {
              _Stt: stt11,
              _Id: equipItem._Id,
              _Name: equipItem._Name,
              _Sl: 1,
              _Doben: equipItem._Doben
            };

            // Clear equipment slot
            account.charEquip[equipIndex] = {
              _Id: 0,
              _Name: '',
              _Doben: 0,
              loai: 0,
              type: 0
            };
          }
        }

        rendererSend('player:equipment-update', {
          id: find[0],
          charEquip: account.charEquip,
          pets: account.pets
        });

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch (error) {}
      break;
    }

    case 17: {
      // Equip item from bag to character
      try {
        const stt9 = A_0[6]; // bag slot (1-based)
        const bagIndex = stt9 - 1;

        if (bagIndex >= 0 && bagIndex < account.tuido.length) {
          const num31 = account.tuido[bagIndex]._Id;

          if (num31 > 0) {
            const findItem = DATA_ITEM.find((e) => e[0] === num31);
            if (findItem) {
              const stt10 = findItem[3] - 1; // loai - 1 for equipment slot
              if (stt10 >= 0 && stt10 < 6) {
                const num32 = account.charEquip[stt10]?._Id || 0;
                const oldDoben = account.charEquip[stt10]?._Doben || 0;
                // Equip new item
                account.charEquip[stt10] = {
                  _Id: num31,
                  _Name: findItem[1],
                  _Doben: account.tuido[bagIndex]._Doben,
                  loai: findItem[3],
                  type: findItem[2]
                };

                // Handle old equipment
                if (num32 === 0) {
                  // Clear bag slot
                  account.tuido[bagIndex] = {
                    _Stt: stt9,
                    _Id: 0,
                    _Name: '',
                    _Sl: 0,
                    _Doben: 0
                  };
                } else {
                  // Swap with old equipment
                  const oldItem = DATA_ITEM.find((e) => e[0] === num32);
                  account.tuido[bagIndex] = {
                    _Stt: stt9,
                    _Id: num32,
                    _Name: oldItem ? oldItem[1] : '',
                    _Sl: 1,
                    _Doben: oldDoben
                  };
                }
              }
            }
          }
        }

        rendererSend('player:equipment-update', {
          id: find[0],
          charEquip: account.charEquip,
          pets: account.pets
        });

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch (error) {}
      break;
    }

    case 22: {
      // Unequip pet equipment to bag
      try {
        const num28 = A_0[6]; // pet index (0-based)
        const num29 = A_0[7]; // equipment slot (1-6)
        const stt8 = A_0[8]; // bag slot (1-based)
        const bagIndex = stt8 - 1;

        if (
          num28 >= 0 &&
          num28 - 1 < account.pets.length &&
          bagIndex >= 0 &&
          bagIndex < account.tuido.length
        ) {
          const pet = account.pets[num28 - 1];
          let itemId = 0;

          // Get item from pet equipment slot
          switch (num29) {
            case 1:
              itemId = pet._Mu;
              pet._Mu = 0;
              pet._Mu_Doben = 0;
              break;
            case 2:
              itemId = pet._Ao;
              pet._Ao = 0;
              pet._Ao_Doben = 0;
              break;
            case 3:
              itemId = pet._vukhi;
              pet._vukhi = 0;
              pet._vukhi_Doben = 0;
              break;
            case 4:
              itemId = pet._tay;
              pet._tay = 0;
              pet._tay_Doben = 0;
              break;
            case 5:
              itemId = pet._chan;
              pet._chan = 0;
              pet._chan_Doben = 0;
              break;
            case 6:
              itemId = pet._dacthu;
              pet._dacthu = 0;
              pet._dacthu_Doben = 0;
              break;
          }

          if (itemId > 0) {
            const findItem = DATA_ITEM.find((e) => e[0] === itemId);
            account.tuido[bagIndex] = {
              _Stt: stt8,
              _Id: itemId,
              _Name: findItem ? findItem[1] : '',
              _Sl: 1,
              _Doben: 0
            };
          }

          account.pets[num28 - 1] = pet;
        }

        rendererSend('player:equipment-update', {
          id: find[0],
          charEquip: account.charEquip,
          pets: account.pets
        });

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch (error) {}
      break;
    }

    case 23: {
      // Equip item from bag to pet
      try {
        const stt6 = A_0[6]; // pet index (0-based)
        const stt7 = A_0[7]; // bag slot (1-based)
        const bagIndex = stt7 - 1;

        if (
          stt6 >= 0 &&
          stt6 - 1 < account.pets.length &&
          bagIndex >= 0 &&
          bagIndex < account.tuido.length
        ) {
          const num25 = account.tuido[bagIndex]._Id;

          if (num25 > 0) {
            const findItem = DATA_ITEM.find((e) => e[0] === num25);
            if (findItem) {
              const num26 = findItem[3] - 1; // loai - 1
              const pet = account.pets[stt6 - 1];
              let oldItemId = 0;

              // Equip to pet based on slot
              switch (num26) {
                case 0:
                  oldItemId = pet._Mu;
                  pet._Mu = num25;
                  break;
                case 1:
                  oldItemId = pet._Ao;
                  pet._Ao = num25;
                  break;
                case 2:
                  oldItemId = pet._vukhi;
                  pet._vukhi = num25;
                  break;
                case 3:
                  oldItemId = pet._tay;
                  pet._tay = num25;
                  break;
                case 4:
                  oldItemId = pet._chan;
                  pet._chan = num25;
                  break;
                case 5:
                  oldItemId = pet._dacthu;
                  pet._dacthu = num25;
                  break;
              }

              // Handle bag slot
              if (oldItemId === 0) {
                account.tuido[bagIndex] = {
                  _Stt: stt7,
                  _Id: 0,
                  _Name: '',
                  _Sl: 0,
                  _Doben: 0
                };
              } else {
                const oldItem = DATA_ITEM.find((e) => e[0] === oldItemId);
                account.tuido[bagIndex] = {
                  _Stt: stt7,
                  _Id: oldItemId,
                  _Name: oldItem ? oldItem[1] : '',
                  _Sl: 1,
                  _Doben: 0
                };
              }

              account.pets[stt6 - 1] = pet;
            }
          }
        }

        rendererSend('player:equipment-update', {
          id: find[0],
          charEquip: account.charEquip,
          pets: account.pets
        });

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch (error) {}
      break;
    }

    case 24: {
      // Update pet equipment (direct update with ID and durability)
      try {
        const num20 = A_0[6]; // pet index (0-based)
        const num21 = API.hexToInt32(API.byteToHexstring(A_0).substring(14, 18));
        const num22 = A_0[9]; // durability

        if (num20 >= 0 && num20 < account.pets.length) {
          const findItem = DATA_ITEM.find((e) => e[0] === num21);
          if (findItem) {
            const num23 = findItem[3] - 1; // loai - 1
            const pet = account.pets[num20];

            // Update pet equipment based on slot
            switch (num23) {
              case 0:
                pet._Mu = num21;
                pet._Mu_Doben = num22;
                break;
              case 1:
                pet._Ao = num21;
                pet._Ao_Doben = num22;
                break;
              case 2:
                pet._vukhi = num21;
                pet._vukhi_Doben = num22;
                break;
              case 3:
                pet._tay = num21;
                pet._tay_Doben = num22;
                break;
              case 4:
                pet._chan = num21;
                pet._chan_Doben = num22;
                break;
              case 5:
                pet._dacthu = num21;
                pet._dacthu_Doben = num22;
                break;
            }

            account.pets[num20] = pet;
          }
        }

        rendererSend('player:equipment-update', {
          id: find[0],
          charEquip: account.charEquip,
          pets: account.pets
        });
      } catch (error) {}
      break;
    }

    case 27: {
      // Update character equipment durability
      try {
        const stt5 = A_0[6] - 1; // equipment slot (0-based after -1)
        const num19 = A_0[7]; // new durability

        if (stt5 >= 0 && stt5 < 6 && account.charEquip[stt5]) {
          account.charEquip[stt5]._Doben = num19;
        }

        rendererSend('player:equipment-update', {
          id: find[0],
          charEquip: account.charEquip,
          pets: account.pets
        });
      } catch (error) {}
      break;
    }

    case 28: {
      // Update pet equipment durability
      try {
        const num17 = A_0[6]; // pet index (0-based)
        const stt4 = A_0[7] - 1; // equipment slot (0-based after -1)
        const num18 = A_0[8]; // new durability

        if (num17 >= 0 && num17 < account.pets.length) {
          const pet = account.pets[num17];

          // Update durability based on slot
          switch (stt4) {
            case 0:
              pet._Mu_Doben = num18;
              break;
            case 1:
              pet._Ao_Doben = num18;
              break;
            case 2:
              pet._vukhi_Doben = num18;
              break;
            case 3:
              pet._tay_Doben = num18;
              break;
            case 4:
              pet._chan_Doben = num18;
              break;
            case 5:
              pet._dacthu_Doben = num18;
              break;
          }

          account.pets[num17] = pet;
        }

        rendererSend('player:equipment-update', {
          id: find[0],
          charEquip: account.charEquip,
          pets: account.pets
        });
      } catch (error) {}
      break;
    }

    case 31: {
      // Shopping list flag
      try {
        // Convert 4 bytes to int32
        const num15 = (A_0[6] << 24) | (A_0[7] << 16) | (A_0[8] << 8) | A_0[9];
        // TODO: Implement shopping list tracking if needed
        //console.log('Shopping list flag:', num15);
      } catch (error) {}
      break;
    }

    case 47: {
      // Update Tuideo (Wardrobe) - Add items
      try {
        let num9 = 6;
        do {
          const array2 = API.byteArrayToByteArray(A_0, num9, 12);
          num9 += 12;
          const slot = array2[0]; // 1-based slot number
          const id = parseInt(API.byteToHexstring([array2[2], array2[1]]), 16);
          const sl = array2[3];
          const doben = array2[4];
          const arrayIndex = slot - 1;

          if (arrayIndex >= 0 && arrayIndex < account.tuideo.length) {
            const currentId = account.tuideo[arrayIndex]._Id;

            if (currentId === id) {
              // Same item, add to existing stack
              const newSL = account.tuideo[arrayIndex]._Sl + sl;
              if (newSL >= 50) {
                account.tuideo[arrayIndex]._Sl = sl;
                account.tuideo[arrayIndex]._Doben = doben;
              } else {
                account.tuideo[arrayIndex]._Sl = newSL;
                account.tuideo[arrayIndex]._Doben = doben;
              }
            } else {
              // Different item, replace
              account.tuideo[arrayIndex] = {
                _Stt: slot,
                _Id: id,
                _Name: '',
                _Sl: sl,
                _Doben: doben
              };
            }
          }
        } while (num9 < A_0.length);

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch {}
      break;
    }

    case 49: {
      // Remove items from Tuideo (Wardrobe)
      try {
        const slot = A_0[6]; // 1-based from server
        const sl = A_0[7];
        const arrayIndex = slot - 1;

        if (arrayIndex >= 0 && arrayIndex < account.tuideo.length) {
          const remainingSL = account.tuideo[arrayIndex]._Sl - sl;

          if (remainingSL <= 0) {
            account.tuideo[arrayIndex] = {
              _Stt: slot,
              _Id: 0,
              _Name: '',
              _Sl: 0,
              _Doben: 0
            };
          } else {
            account.tuideo[arrayIndex]._Sl = remainingSL;
          }
        }

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch {}
      break;
    }

    case 102: {
      // Update Luulang (Wanderer) - Add items
      try {
        let num2 = 6;
        do {
          const array = API.byteArrayToByteArray(A_0, num2, 12);
          num2 += 12;
          const slot = array[0]; // 1-based slot number
          const id = parseInt(API.byteToHexstring([array[2], array[1]]), 16);
          const sl = array[3];
          const doben = array[4];
          const arrayIndex = slot - 1;

          if (arrayIndex >= 0 && arrayIndex < account.luulang.length) {
            const currentId = account.luulang[arrayIndex]._Id;

            if (currentId === id) {
              // Same item, add to existing stack
              const newSL = account.luulang[arrayIndex]._Sl + sl;
              if (newSL >= 50) {
                account.luulang[arrayIndex]._Sl = sl;
                account.luulang[arrayIndex]._Doben = doben;
              } else {
                account.luulang[arrayIndex]._Sl = newSL;
                account.luulang[arrayIndex]._Doben = doben;
              }
            } else {
              // Different item, replace
              account.luulang[arrayIndex] = {
                _Stt: slot,
                _Id: id,
                _Name: '',
                _Sl: sl,
                _Doben: doben
              };
            }
          }
        } while (num2 < A_0.length);

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch {}
      break;
    }

    case 104: {
      // Remove items from Luulang (Wanderer)
      try {
        const slot = A_0[6]; // 1-based from server
        const sl = A_0[7];
        const arrayIndex = slot - 1;

        if (arrayIndex >= 0 && arrayIndex < account.luulang.length) {
          const remainingSL = account.luulang[arrayIndex]._Sl - sl;

          if (remainingSL <= 0) {
            account.luulang[arrayIndex] = {
              _Stt: slot,
              _Id: 0,
              _Name: '',
              _Sl: 0,
              _Doben: 0
            };
          } else {
            account.luulang[arrayIndex]._Sl = remainingSL;
          }
        }

        rendererSend('player:bag-update', {
          id: find[0],
          tuido: account.tuido,
          tuideo: account.tuideo,
          luulang: account.luulang
        });
      } catch {}
      break;
    }

    case 11: {
      // Character equipment when login (from Auto-TsOnline implementation)
      try {
        let text2 = API.byteToHexstring(A_0).substring(12);
        const equipList: any[] = [];

        while (text2.length != 0) {
          const text3 = text2.substring(0, 20);
          const id = API.hexToInt32(text3.substring(0, 4));
          const doben = API.hexToInt32(text3.substring(5, 7));

          // string text3 = text2.Substring(0, 20);
          // 	int num50 = API.HexToInt32(text3.Substring(0, 4));
          // 	int num51 = API.HexToInt32(text3.Substring(5, 2));
          // 	int stt13 = Items.Data_Items[num50]._Loai - 1;
          //console.log('findItem', id);
          if (id > 0) {
            // Find item in DATA_ITEM to get loai (equipment category)
            const findItem = DATA_ITEM.find((e) => e[0] === id);
            //console.log('findItem', findItem);
            if (findItem) {
              const item = {
                _Id: id,
                _Name: findItem[1],
                _Doben: doben,
                loai: findItem[3],
                type: findItem[2]
              };
              const loai = item.loai;

              // Special handling for type 14 (Đặc Thù/special equipment)
              if (item.type === 14) {
                // Find existing Đặc Thù equipment
                const equipIndex = equipList.findIndex((e) => e.type === 14);
                if (equipIndex !== -1) {
                  equipList[equipIndex] = { ...item };
                } else {
                  equipList.push({ ...item });
                }
              } else {
                // Normal equipment: find by matching loai
                const equipIndex = equipList.findIndex((e) => e.loai === loai);
                if (equipIndex !== -1) {
                  equipList[equipIndex] = { ...item };
                } else {
                  equipList.push({ ...item });
                }
              }
            }
          }

          text2 = text2.replace(text3, '');
        }

        //console.log('Loaded character equipment:', equipList);

        // Update account's character equipment
        account.charEquip = equipList;

        // Send equipment update to renderer
        rendererSend('player:equipment-update', {
          id: find[0],
          charEquip: account.charEquip,
          pets: account.pets
        });
      } catch (error) {}
      break;
    }
  }
}

function checkInfoInBattle(A_0: number[], remotePort: number) {
  const find = remotePorts.find((e) => e[1] == remotePort);
  if (!find) return;
  const account = clients[find[0]];

  try {
    const b = A_0[5];
    if (b !== 1) {
      return;
    }

    let num = 0; // Combo counter
    let text = API.byteToHexstring(A_0).substring(12);
    let text2 = ''; // Battle log message
    let num2 = 0; // Entity type

    // Parse battle actions
    while (text.length > 0) {
      num++; // Increment combo counter

      // Get the length of this action block
      const blockLength = 4 + API.hexToInt32(text.substring(0, 4)) * 2;
      const text3 = text.substring(0, blockLength);

      // Get attacker location
      const a_ = text3.substring(4, 8);
      const attackerLocation = getLocation2(a_);

      if (!attackerLocation) {
        text = text.replace(text3, '');
        continue;
      }

      const attackerIndex = attackerLocation - 1;
      const attacker = account.battleInfo[attackerIndex];
      const text4 = attacker?._Name || 'Unknown';
      num2 = attacker?._Type || 0;

      // Get skill ID and deduct SP
      const skillId = API.hexToInt32(text3.substring(8, 12));

      // Deduct skill SP cost from attacker
      if (attacker) {
        const skillSP = getSkillSP(skillId);
        attacker._Sp = Math.max(0, attacker._Sp - skillSP);
        account.battleInfo[attackerIndex] = attacker;
      }

      // Parse targets
      let text5 = text3.substring(16);
      while (text5.length > 0) {
        const num3 = API.hexToInt32(text5.substring(8, 10)); // Number of effects
        const text6 = text5.substring(0, 10 + num3 * 8);

        // Get target location
        const a_2 = text5.substring(0, 4);
        const targetLocation = getLocation2(a_2);

        if (!targetLocation) {
          text5 = text5.replace(text6, '');
          continue;
        }

        const targetIndex = targetLocation - 1;
        const target = account.battleInfo[targetIndex];

        // Hit result (0 = miss, 1 = hit)
        const hitResult = API.hexToInt32(text5.substring(4, 6));
        let text7 = '';
        switch (hitResult) {
          case 0:
            text7 = 'Miss';
            break;
          case 1:
            text7 = 'Hit';
            break;
        }

        const text8 = target?._Name || 'Unknown';
        const num4 = API.hexToInt32(text6.substring(10, 12)); // Effect type
        const num5 = API.hexToInt32(text6.substring(12, 16)); // Effect value
        const effectCategory = API.hexToInt32(text6.substring(16, 18)); // 0 = buff/heal, 1 = damage/debuff

        if (target) {
          // Initialize statuses array if not exists
          if (!target._Statuses) {
            target._Statuses = [];
          }

          // Check if skill removes CC
          if (isRemoveCCSkill(skillId) && hitResult === 1) {
            // Remove all hard CC statuses
            target._Statuses = target._Statuses.filter((s) => !LIST_HARD_CC.includes(s));
          }

          // Check if skill applies a status effect (only on hit)
          if (hitResult === 1) {
            const statusType = getSkillStatusType(skillId);
            if (statusType !== BattleStatus.NONE) {
              // Add status if not already present
              if (!target._Statuses.includes(skillId)) {
                target._Statuses.push(skillId);
              }
            }
          }

          switch (effectCategory) {
            case 0: // Buff or Heal
              switch (num4) {
                case 25: // HP recovery
                  if (target._Hp < 0) {
                    target._Hp = num5;
                  } else {
                    target._Hp = Math.min(target._HpMax, target._Hp + num5);
                  }
                  text2 += `${text4} --> ${getSkillName(skillId)} -[${text7}]-> ${text8} (+${num5} HP)\n`;
                  break;
                case 26: // SP recovery
                  if (target._Sp < 0) {
                    target._Sp = num5;
                  } else {
                    target._Sp = Math.min(target._SpMax, target._Sp + num5);
                  }
                  text2 += `${text4} --> ${getSkillName(skillId)} -[${text7}]-> ${text8} (+${num5} SP)\n`;
                  break;
                default:
                  text2 += `${text4} --> ${getSkillName(skillId)} -[${text7}]-> ${text8}\n`;
                  break;
              }
              break;
            case 1: // Damage or Debuff
              switch (num4) {
                case 25: // HP damage
                  target._Hp = Math.max(0, target._Hp - num5);
                  text2 += `${text4} ${getSkillName(skillId)} -[${text7}]-> ${text8} (-${num5} HP)\n`;
                  break;
                case 26: // SP damage
                  target._Sp = Math.max(0, target._Sp - num5);
                  text2 += `${text4} --> ${getSkillName(skillId)} -[${text7}]-> ${text8} (-${num5} SP)\n`;
                  break;
                default:
                  text2 += `${text4} --> ${getSkillName(skillId)} -[${text7}]-> ${text8}\n`;
                  break;
              }
              break;
          }

          // Update target in battle info
          account.battleInfo[targetIndex] = target;
        }

        text5 = text5.replace(text6, '');
      }

      text = text.replace(text3, '');
    }

    // Log battle messages
    if (text2.length > 0) {
      if (num2 === 2 || num2 === 4 || num2 === 9) {
      } else {
      }
    }

    if (num > 1) {
    }

    // Send battle update to renderer
    rendererSend('player:battle-update', {
      id: find[0],
      battleInfo: account.battleInfo,
      turn: account.turn,
      battle: account.battle
    });
  } catch (error) {}
}

// Helper function to get skill SP cost
function getSkillSP(_skillId: number): number {
  // TODO: Implement skill SP lookup table
  // For now, return a default value
  return 0;
}

// Helper function to get skill name
function getSkillName(skillId: number): string {
  // TODO: Implement skill name lookup table
  // For now, return skill ID
  return `Skill_${skillId}`;
}

function checkTurn(_A_0: any, _remotePort: any) {
  // TODO: Implement checkTurn
}

function checkRemoveCC(A_0: number[], remotePort: number | null) {
  try {
    const find = remotePorts.find((e) => e[1] === remotePort);
    if (!find) {
      return;
    }

    const account = clients[find[0]];
    if (!account) {
      return;
    }

    const caseType = A_0[5];

    switch (caseType) {
      case 1: {
        // Remove status effects based on status type
        const slotReceive = API.convertDataToSlot(
          A_0[6].toString(16).padStart(2, '0') + A_0[7].toString(16).padStart(2, '0')
        );
        const statusType = A_0[8];

        // Ensure slotReceive is a number and convert to 0-based index
        // convertDataToSlot returns 1-20, we need 0-19 for array access
        let slotIndex =
          typeof slotReceive === 'number' ? slotReceive : parseInt(String(slotReceive), 10);

        // Convert from 1-based to 0-based index
        if (!isNaN(slotIndex) && slotIndex > 0) {
          slotIndex = slotIndex - 1;
        }

        console.log('case 1', account.player._Id, statusType, slotIndex, slotReceive);

        if (!isNaN(slotIndex) && slotIndex >= 0 && slotIndex < 20) {
          const entity = account.battleInfo[slotIndex];

          console.log(
            `[checkRemoveCC] Slot ${slotIndex} - Entity exists:`,
            entity !== null && entity !== undefined
          );

          if (entity) {
            // Initialize _Statuses if it doesn't exist
            if (!entity._Statuses) {
              entity._Statuses = [];
            }

            console.log(
              `[checkRemoveCC] Before clear - Slot ${slotIndex} (${entity._Name}) statuses:`,
              JSON.stringify(entity._Statuses)
            );

            switch (statusType) {
              case 1: // LIVE - Clear Hard CC statuses
                console.log(`[checkRemoveCC] Slot ${slotIndex} - LIVE status, clearing HARD_CC`);
                // Clear only Hard CC statuses
                entity._Statuses = entity._Statuses.filter(
                  (skillId: number) => !LIST_HARD_CC.includes(skillId)
                );
                break;

              case 2: // DEF - Clear all defense skills
                console.log(`[checkRemoveCC] Slot ${slotIndex} - Clearing DEF statuses`);
                console.log(`[checkRemoveCC] LIST_DEF:`, LIST_DEF);
                entity._Statuses = entity._Statuses.filter(
                  (skillId: number) => !LIST_DEF.includes(skillId)
                );
                break;

              case 5: // BUFF - Clear all buff skills
                console.log(`[checkRemoveCC] Slot ${slotIndex} - Clearing BUFF statuses`);
                console.log(`[checkRemoveCC] LIST_BUFF:`, LIST_BUFF);
                entity._Statuses = entity._Statuses.filter(
                  (skillId: number) => !LIST_BUFF.includes(skillId)
                );
                break;

              default:
                console.log(
                  `[checkRemoveCC] Slot ${slotIndex} - Unknown status type: ${statusType}`
                );
                break;
            }

            console.log(
              `[checkRemoveCC] After clear - Slot ${slotIndex} (${entity._Name}) statuses:`,
              JSON.stringify(entity._Statuses)
            );

            // Update the entity back to the battleInfo array
            account.battleInfo[slotIndex] = entity;

            // Send update to renderer
            rendererSend('player:battle-update', {
              id: find[0],
              battleInfo: account.battleInfo,
              turn: account.turn,
              battle: account.battle
            });
          } else {
            console.log(
              `[checkRemoveCC] WARNING: No entity at slot ${slotIndex} to clear status from!`
            );
          }
        }
        break;
      }

      case 3: {
        // Clear battle entity at location
        const locationString = `${A_0[6].toString(16).padStart(2, '0')}${A_0[7].toString(16).padStart(2, '0')}`;
        const location = getLocation2(locationString);

        if (location !== null) {
          console.log(`[checkRemoveCC] Clearing battle entity at position ${location - 1}`);
          clearDataBattleInPosition(account, location - 1);

          // Send update to renderer
          rendererSend('player:battle-update', {
            id: find[0],
            battleInfo: account.battleInfo,
            turn: account.turn,
            battle: account.battle
          });
        }
        break;
      }

      case 13: {
        // Login success case - likely not needed for battle CC removal
        // In C# this handles VIP packets and auto-equipment
        // Skipping implementation as it's not related to CC removal in battle
        //console.log('[checkRemoveCC] Case 13 - Login success (not implemented)');
        break;
      }

      default:
        //console.log(`[checkRemoveCC] Unknown case: ${caseType}`);
        break;
    }
  } catch (error) {}
}
