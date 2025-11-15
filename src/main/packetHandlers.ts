/* eslint-disable @typescript-eslint/no-unused-vars */
import { sendPacketWithDelay } from '.';
import API from '../helpers/API';
import { PACKET } from '../helpers/constant';
import { DATA_BATTLE_PET, DATA_BATTLE_SKILL, DATA_ITEM, DATA_WARP } from '../helpers/constant2';
import { graph } from '../helpers/transfomer';
import { clients, getListPlayer } from '../store/clients';
import { Battleinfo, ClientBot } from '../types';
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

function checkFinishDialog(A_0: number[], remotePort: number) {
  try {
    const find = remotePorts.find((e) => e[1] == remotePort);
    if (!find) return;
    const account = clients[find[0]];
    if (!account) return;

    switch (A_0[5]) {
      case 2:
        if (A_0.length >= 8) {
          // const num7 = parseInt(
          //   API.byteToHexstring([A_0[9], A_0[8], A_0[7], A_0[6]]),
          //   16
          // );
          let value3 = '';
          for (let j = A_0.length - 1; j >= 0 && A_0[j] !== 0; j--) {
            value3 = String(A_0[j]) + value3;
          }
        }
        break;

      case 4:
        if (A_0.length >= 8) {
          // const num5 = parseInt(
          //   API.byteToHexstring([A_0[9], A_0[8], A_0[7], A_0[6]]),
          //   16
          // );
          let text2 = '';
          for (let i = A_0.length - 1; i >= 0 && A_0[i] !== 0; i--) {
            text2 = String.fromCharCode(A_0[i]) + text2;
          }
        }
        break;

      case 3: {
        // _Value_Item_OnMap = A_0[32]; // TODO: Implement if needed
        account.player._ThuocTinh = A_0[6];
        account.player._Lv = A_0[23];
        account.player._ExpTotal = parseInt(
          API.byteToHexstring([A_0[27], A_0[26], A_0[25], A_0[24]]),
          16
        );
        account.player._Point = parseInt(API.byteToHexstring([A_0[31], A_0[30]]), 16);

        // TODO: Implement Texps lookup - for now, skip exp calculation
        // const texp = Texps.Texps[account.player._Lv];
        // const texp2 = Texps.Texps[account.player._Lv - 1];
        // switch (account.player._Reborn) {
        //   case 0:
        //     account.player._Exp = account.player._ExpTotal - texp2._0 - 5;
        //     account.player._ExpMax = texp._0 - texp2._0;
        //     break;
        //   case 1:
        //     account.player._Exp = account.player._ExpTotal - texp._1 - 5;
        //     account.player._ExpMax = texp._1 - texp2._1;
        //     break;
        //   case 2:
        //     account.player._Exp = account.player._ExpTotal - texp._2 - 5;
        //     account.player._ExpMax = texp._2 - texp2._2;
        //     break;
        // }

        account.player._Hp = parseInt(API.byteToHexstring([A_0[8], A_0[7]]), 16);
        account.player._Sp = parseInt(API.byteToHexstring([A_0[10], A_0[9]]), 16);
        account.player._Int = parseInt(API.byteToHexstring([A_0[12], A_0[11]]), 16);
        account.player._Atk = parseInt(API.byteToHexstring([A_0[14], A_0[13]]), 16);
        account.player._Def = parseInt(API.byteToHexstring([A_0[16], A_0[15]]), 16);
        account.player._Agi = parseInt(API.byteToHexstring([A_0[18], A_0[17]]), 16);
        account.player._Hpx = parseInt(API.byteToHexstring([A_0[20], A_0[19]]), 16);
        account.player._Spx = parseInt(API.byteToHexstring([A_0[22], A_0[21]]), 16);
        account.player._HpMax = parseInt(API.byteToHexstring([A_0[37], A_0[36]]), 16);
        account.player._SpMax = parseInt(API.byteToHexstring([A_0[39], A_0[38]]), 16);
        account.player._Atk2 = parseInt(
          API.byteToHexstring([A_0[43], A_0[42], A_0[41], A_0[40]]),
          16
        );
        account.player._Def2 = parseInt(
          API.byteToHexstring([A_0[47], A_0[46], A_0[45], A_0[44]]),
          16
        );
        account.player._Int2 = parseInt(
          API.byteToHexstring([A_0[51], A_0[50], A_0[49], A_0[48]]),
          16
        );
        account.player._Agi2 = parseInt(
          API.byteToHexstring([A_0[55], A_0[54], A_0[53], A_0[52]]),
          16
        );
        account.player._Hpx2 = parseInt(
          API.byteToHexstring([A_0[59], A_0[58], A_0[57], A_0[56]]),
          16
        );
        account.player._Spx2 = parseInt(
          API.byteToHexstring([A_0[63], A_0[62], A_0[61], A_0[60]]),
          16
        );

        if (account.player._Int2 >= 0) {
          account.player._Int_Plus1 = 1;
        } else {
          account.player._Int_Plus1 = 0;
        }
        if (account.player._Atk2 >= 0) {
          account.player._Atk_Plus1 = 1;
        } else {
          account.player._Atk_Plus1 = 0;
        }
        if (account.player._Def2 >= 0) {
          account.player._Def_Plus1 = 1;
        } else {
          account.player._Def_Plus1 = 0;
        }
        if (account.player._Agi2 >= 0) {
          account.player._Agi_Plus1 = 1;
        } else {
          account.player._Agi_Plus1 = 0;
        }
        if (account.player._Hpx2 >= 0) {
          account.player._Hpx_Plus1 = 1;
        } else {
          account.player._Hpx_Plus1 = 0;
        }
        if (account.player._Spx2 >= 0) {
          account.player._Spx_Plus1 = 1;
        } else {
          account.player._Spx_Plus1 = 0;
        }

        // Initialize character skill list if not exists
        if (!account.charListSkill) {
          account.charListSkill = [];
        }
        account.charListSkill = [];
        account.charListSkill.push(10000);
        account.charListSkill.push(17001);
        account.charListSkill.push(18001);

        let text = '';
        if (A_0.length > 117) {
          const byteArray = API.byteArrayToByteArray(A_0, 117, A_0.length - 117);
          text = API.byteToHexstring(Array.from(byteArray));
        }
        let num = 0;
        do {
          if (num + 4 > text.length) break;
          const num2 = API.hexToInt32(text.substring(num, num + 4));

          // Check if skill exists in DATA_BATTLE_SKILL
          const skillExists = DATA_BATTLE_SKILL.some((skill) => skill[0] === num2);
          if (!skillExists) {
            break;
          }

          // Handle special skills
          // if (num2 === 14002) {
          //   skilldaotau = 14002;
          // }
          // if (num2 === 11013) {
          //   skillHoiSinh = 11013;
          // }
          // if (num2 === 14003) {
          //   skill_buonban = API.hexToInt32(text.substring(num + 4, num + 6));
          // }

          account.charListSkill.push(num2);
          num += 6;
        } while (num <= 500);

        if (account.player._Reborn === 3) {
          const num3 = A_0.length - 4;
          account.player._Lv2 = parseInt(API.byteToHexstring([A_0[num3 - 20], A_0[num3 - 21]]), 16);
          account.player._ExpTotal = parseInt(
            API.byteToHexstring([
              A_0[num3 - 12],
              A_0[num3 - 13],
              A_0[num3 - 14],
              A_0[num3 - 15],
              A_0[num3 - 16],
              A_0[num3 - 17],
              A_0[num3 - 18],
              A_0[num3 - 19]
            ]),
            16
          );
          account.player._Int3 = parseInt(
            API.byteToHexstring([A_0[num3 - 10], A_0[num3 - 11]]),
            16
          );
          account.player._Atk3 = parseInt(API.byteToHexstring([A_0[num3 - 8], A_0[num3 - 9]]), 16);
          account.player._Def3 = parseInt(API.byteToHexstring([A_0[num3 - 6], A_0[num3 - 7]]), 16);
          account.player._Hpx3 = parseInt(API.byteToHexstring([A_0[num3 - 2], A_0[num3 - 3]]), 16);
          account.player._Spx3 = parseInt(API.byteToHexstring([A_0[num3], A_0[num3 - 1]]), 16);

          // TODO: Implement Texps lookup for reborn level 3
          // if (account.player._Lv2 === 0) {
          //   const texp = Texps.Texps[account.player._Lv2];
          //   account.player._Exp = account.player._ExpTotal;
          //   account.player._ExpMax = texp._3;
          // } else {
          //   const texp = Texps.Texps[account.player._Lv2];
          //   const texp2 = Texps.Texps[account.player._Lv2 - 1];
          //   account.player._Exp = account.player._ExpTotal - texp2._3;
          //   account.player._ExpMax = texp._3 - texp2._3;
          // }

          const num4 = parseInt(
            API.byteToHexstring([A_0[A_0.length - 2], A_0[A_0.length - 3]]),
            16
          );
          if (num4 > 0) {
            account.charListSkill.push(num4);
          }
        }

        // Update player in clients list (Data_Players equivalent)
        if (clients[account.player._Id]) {
          const existingPlayer = clients[account.player._Id];
          existingPlayer.player._Id = account.player._Id;
          existingPlayer.player._Name = account.player._Name;
          existingPlayer.player._Lv = account.player._Lv;
          existingPlayer.player._MapId = account.player._MapId;
          existingPlayer.player._MapX = account.player._MapX;
          existingPlayer.player._MapY = account.player._MapY;
          existingPlayer.player._Reborn = account.player._Reborn;
          existingPlayer.player._ThuocTinh = account.player._ThuocTinh;
          // _Online = "ON" - handled by _PlayerOnline flag
          existingPlayer.player._PlayerOnline = 1;
        } else {
          // Player doesn't exist in clients, but account already has the data
          account.player._PlayerOnline = 1;
        }

        // Send update to renderer
        rendererSend('player:login', {
          id: account.player._Id,
          name: account.player._Name,
          mapId: account.player._MapId,
          status: 'Online',
          player: account.player
        });

        rendererSend('player:list-update', {
          listPlayer: getListPlayer()
        });

        // Auto change gem after login
        autoChangeGem(account);

        break;
      }
    }
  } catch (ex) {
    // Ignore errors
  }
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

            // Auto change gem after battle ends - for this account
            autoChangeGem(account);

            // If this is Hải Tặc event, check if gem change is needed before restarting walking
            // But don't restart if waiting for rotating member to leave party
            if (account.currentEvent === 'haitac' && !account.haitacIntervalId && !account.waitingForRotatingMemberOutParty) {
              // Check if all gems (character and pet) are correct
              const allGemsCorrect = checkIfAllGemsCorrect(account);

              if (allGemsCorrect) {
                // All gems are correct, restart walking immediately
                autoCatchHaiTac(account, account.player._Id);
              } else {
                // Set flag to restart walking after gem change completes
                account.waitingForHaitacWalkRestart = true;
              }
            }

            // Also call autoChangeGem for all party members
            // Check if this is a leader with party members
            if (
              account.party.currentMember1 > 0 ||
              account.party.currentMember2 > 0 ||
              account.party.currentMember3 > 0 ||
              account.party.currentMember4 > 0
            ) {
              // This is a leader, call autoChangeGem for all party members
              const memberIds = [
                account.party.currentMember1,
                account.party.currentMember2,
                account.party.currentMember3,
                account.party.currentMember4
              ].filter((id) => id > 0);

              memberIds.forEach((memberId) => {
                const memberAccount = clients[memberId];
                if (memberAccount) {
                  autoChangeGem(memberAccount);
                }
              });
            } else if (account.party.currentPartyId > 0) {
              // This is a party member, also call for the leader
              const leaderAccount = clients[account.party.currentPartyId];
              if (leaderAccount) {
                autoChangeGem(leaderAccount);
              }
            }
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

function checkWarpFinish(A_0: number[], remotePort: number) {
  const find = remotePorts.find((e) => e[1] == remotePort);
  if (!find) return;
  const account = clients[find[0]];

  if (!account || !account.socket.connectByTool) return;

  const num = parseInt(API.byteToHexstring([A_0[8], A_0[7], A_0[6], A_0[5]]), 16);

  if (num != account.player._Id) return;

  const currentMapId = parseInt(API.byteToHexstring([A_0[10], A_0[9]]), 16);

  account.player._MapId = currentMapId;
  rendererSend('player:login', {
    id: num,
    name: account.player._Name,
    mapId: account.player._MapId,
    status: 'Online',
    player: account.player
  });

  // Also send the entire updated list derived from clients
  rendererSend('player:list-update', {
    listPlayer: getListPlayer()
  });

  // If autoQuest is active, continue warping to target
  if (account.currentEvent === 'autoQuest' && account.autoQuestTargetMapId) {
    autoWarp(account, account.autoQuestTargetMapId);
  }
}

// AutoWarp function - converts C# AutoWarp logic
export function autoWarp(account: ClientBot, targetMapId: number): void {
  const currentMapId = account.player._MapId;
  
  // Check if already at target map or in battle
  if (currentMapId === targetMapId || account.battle === 1) {
    // Warp finished - clear event
    afterAutoWarpFinished(account);
    return;
  }

  // Get warp path using BFS
  const paths = bfs(currentMapId, targetMapId);
  if (!paths || paths.length === 0) {
    // No path found - clear event
    afterAutoWarpFinished(account);
    return;
  }

  // Use first path found
  const path = paths[0];
  account.autoQuestWarpPath = path;

  // Get next map in path
  const currentIndex = path.indexOf(currentMapId);
  if (currentIndex === -1 || currentIndex >= path.length - 1) {
    // Already at target or invalid path
    afterAutoWarpFinished(account);
    return;
  }

  const nextMapId = path[currentIndex + 1];

  // Get warp door ID from DATA_WARP
  const warpDoorId = getWarpID(currentMapId, nextMapId);
  if (warpDoorId <= 0) {
    // No warp door found - clear event
    afterAutoWarpFinished(account);
    return;
  }

  // Send warp packet
  const warpPacket = API.Warp(warpDoorId);
  if (account.socket.context) {
    sendPacketWithDelay(account.socket.context, warpPacket, 0);
  }
}

// Helper function to get warp door ID between two maps
function getWarpID(mapId1: number, mapId2: number): number {
  const warp = DATA_WARP.find(([src, _doorId, dest]) => src === mapId1 && dest === mapId2);
  return warp ? warp[1] : 0;
}

// Helper function for BFS pathfinding (similar to C# bfs)
function bfs(start: number, end: number): number[][] | null {
  if (!(start in graph)) return null;

  const paths: number[][] = [];
  const queue: [number, number[]][] = [[start, [start]]];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const [node, path] = queue.shift()!;

    for (const neighbor of graph[node]) {
      if (neighbor === end) {
        paths.push([...path, neighbor]);
      } else if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }

  return paths.length > 0 ? paths : null;
}

// Helper function to clear auto warp state
function afterAutoWarpFinished(account: ClientBot): void {
  if (account.currentEvent === 'autoQuest') {
    account.currentEvent = undefined;
    account.autoQuestTargetMapId = undefined;
    account.autoQuestWarpPath = undefined;
  }
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

        // Check if client is running Hải Tặc event
        if (account.currentEvent === 'haitac') {
          // For Hải Tặc event, always accept party invite
          const packet = API.leaderAcceptedPartyFrom(memberId);
          sendPacketWithDelay(account.socket.context, packet, 0);
        } else {
          // Normal party logic: Check if this member is in your configured member list (you are the leader)
          if (
            memberId === account.party.member1Id ||
            memberId === account.party.member2Id ||
            memberId === account.party.member3Id ||
            memberId === account.party.member4Id
          ) {
            const packet = API.leaderAcceptedPartyFrom(memberId);
            sendPacketWithDelay(account.socket.context, packet, 0);
          }
        }
        break;
      }

      case 4: {
        // Member left party
        const memberId = API.hexToInt32(API.byteToHexstring(A_0).substring(12, 20));

        // Check if this is a rotating member leaving during Hải Tặc event
        const isRotatingMember =
          account.currentEvent === 'haitac' && account.party.rotatingMembers?.includes(memberId);

        if (isRotatingMember) {
          // Clear rotating member from currentMember4 slot
          if (account.party.currentMember4 === memberId) {
            account.party.currentMember4 = 0;
          }

          // Clear flag - rotating member has left party
          account.waitingForRotatingMemberOutParty = false;

          // Clear walking interval when rotating member leaves
          if (account.haitacIntervalId) {
            clearInterval(account.haitacIntervalId);
            account.haitacIntervalId = undefined;
          }

          // Check gems after rotating member leaves
          autoChangeGem(account);

          // Move to next rotating member
          if (
            account.party.currentRotatingIndex !== undefined &&
            account.party.rotatingMembers &&
            account.party.currentRotatingIndex < account.party.rotatingMembers.length - 1
          ) {
            // Find next available rotating member (skip if not found, continue to next)
            let foundNextMember = false;
            for (
              let i = account.party.currentRotatingIndex + 1;
              i < account.party.rotatingMembers.length;
              i++
            ) {
              const nextRotatingId = account.party.rotatingMembers[i];
              const nextRotatingClient = clients[nextRotatingId];

              if (nextRotatingClient && nextRotatingClient.socket.context) {
                // Found valid rotating member, set index and send invite
                account.party.currentRotatingIndex = i;
                const packet = API.joinToParty(account.player._Id);
                sendPacketWithDelay(nextRotatingClient.socket.context, packet, 500);
                foundNextMember = true;
                break;
              }
            }

            // If no more rotating members found, clear the event
            if (!foundNextMember) {
              account.currentEvent = undefined;
              account.party.rotatingMembers = undefined;
              account.party.currentRotatingIndex = undefined;
            }
          } else {
            // All rotating members have been processed
            account.currentEvent = undefined;
            account.party.rotatingMembers = undefined;
            account.party.currentRotatingIndex = undefined;
          }
        } else {
          // Normal party member leaving - clear from appropriate slot
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
            // Clear event when leaving party as leader
            if (account.currentEvent) {
              account.currentEvent = undefined;
              account.party.rotatingMembers = undefined;
              account.party.currentRotatingIndex = undefined;
            }
          } else if (memberId === account.player._Id) {
            account.party.currentPartyId = 0;
            // Clear event when you leave party
            if (account.currentEvent) {
              account.currentEvent = undefined;
              account.party.rotatingMembers = undefined;
              account.party.currentRotatingIndex = undefined;
            }
          }
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
          // Check if this is a rotating member for Hải Tặc event
          const isRotatingMember =
            account.currentEvent === 'haitac' && account.party.rotatingMembers?.includes(memberId);

          if (isRotatingMember) {
            // This is a rotating member joining for Hải Tặc event
            // Clear flag - new rotating member has joined
            account.waitingForRotatingMemberOutParty = false;

            // Add rotating member to currentMember4 slot
            account.party.currentMember4 = memberId;

            // Check if all 3 fixed members have joined (party should be: Leader + 3 fixed + 1 rotating = 5 total)
            const hasAllFixedMembers =
              account.party.currentMember1 > 0 &&
              account.party.currentMember2 > 0 &&
              account.party.currentMember3 > 0;

            // Check leader's pet gem - if all gems are correct, restart walking
            // Otherwise wait for gem change to complete
            if (hasAllFixedMembers) {
              // Check if all gems (character and pet) are correct
              const allGemsCorrect = checkIfAllGemsCorrect(account);

              if (allGemsCorrect) {
                // All gems are correct, restart walking
                autoCatchHaiTac(account, leaderId);
              } else {
                // Set flag to restart walking after gem change completes
                account.waitingForHaitacWalkRestart = true;
                // Trigger gem change check
                autoChangeGem(account);
              }
            }
          } else {
            // Normal party member joining - add to appropriate slot
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
          }
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
      case 1: {
        // Pet caught - check if it's Hải Tặc NPC 42550
        try {
          const text = API.byteToHexstring(A_0);
          const petId = API.hexToInt32(text.substring(22, 26));

          // Check if this is Hải Tặc NPC (42550)
          if (petId === 42550) {
            // Check if this account is a rotating member in Hải Tặc event
            // Find the leader who is running Hải Tặc event with this account as rotating member
            const leaderId = account.party.currentPartyId;
            if (leaderId > 0) {
              const leaderClient = clients[leaderId];

              if (
                leaderClient?.currentEvent === 'haitac' &&
                leaderClient.party.rotatingMembers?.includes(account.player._Id)
              ) {
                // Set flag on leader to wait for rotating member to leave party
                leaderClient.waitingForRotatingMemberOutParty = true;

                // Stop leader's walking interval
                if (leaderClient.haitacIntervalId) {
                  clearInterval(leaderClient.haitacIntervalId);
                  leaderClient.haitacIntervalId = undefined;
                }

                // Send trainoff to leader to stop movement
                sendPacketWithDelay(leaderClient.socket.context, PACKET.trainoff, 0);

                // Wait 1000ms after battle ends before leaving party (server rule)
                // Rotating member leaves party after delay
                const outPacket = API.outToParty(leaderId);
                console.log(
                  `[Out Party] Rotating member ${account.player._Id} (${account.player._Name}) caught Hải Tặc pet, will leave party after 1000ms. Leader: ${leaderId}`
                );
                sendPacketWithDelay(account.socket.context, outPacket, 1000);
              }
            }
          }
        } catch (e) {
          // Error in case 1
        }
        break;
      }

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

        // Check if we're waiting for gems from bag or waiting for character gem change
        if (account.pendingGemChange) {
          // Check if the added item is the gem we're waiting for
          const expectedGemIds: number[] = [];
          switch (account.pendingGemChange.element) {
            case 1: // Địa
              expectedGemIds.push(23086, 23135);
              break;
            case 2: // Thủy
              expectedGemIds.push(23087, 23136);
              break;
            case 3: // Hỏa
              expectedGemIds.push(23088, 23137);
              break;
            case 4: // Phong
              expectedGemIds.push(23089, 23138);
              break;
          }

          // Check if any of the expected gems are now in the bag
          const gemFound = account.tuido.some(
            (item) => expectedGemIds.includes(item._Id) && item._Sl > 0
          );

          if (gemFound) {
            // Clear pending flag and call autoChangeGem again
            account.pendingGemChange = undefined;

            // Wait a bit for server to process the items, then call autoChangeGem
            setTimeout(() => {
              autoChangeGem(account);
            }, 500);
          }
        } else if (account.waitingForCharGemChange) {
          // Character gem change completed (bag updated), now change pet gem
          account.waitingForCharGemChange = false;

          // Wait a bit for server to process, then call autoChangeGem for pet
          setTimeout(() => {
            autoChangeGem(account);

            // If waiting for Hải Tặc walk restart and gem is correct, restart walking
            if (
              account.waitingForHaitacWalkRestart &&
              account.currentEvent === 'haitac' &&
              !account.haitacIntervalId
            ) {
              if (!checkIfNeedsGemChange(account)) {
                account.waitingForHaitacWalkRestart = false;
                autoCatchHaiTac(account, account.player._Id);
              }
            }
          }, 500);
        } else if (
          account.waitingForHaitacWalkRestart &&
          account.currentEvent === 'haitac' &&
          !account.haitacIntervalId
        ) {
          // Check if gem is now correct after bag update
          if (!checkIfNeedsGemChange(account)) {
            account.waitingForHaitacWalkRestart = false;
            autoCatchHaiTac(account, account.player._Id);
          }
        }
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

        // Check if we're waiting for gems from bag or waiting for character gem change (case 8: Add single item to specific slot)
        if (account.pendingGemChange) {
          const expectedGemIds: number[] = [];
          switch (account.pendingGemChange.element) {
            case 1: // Địa
              expectedGemIds.push(23086, 23135);
              break;
            case 2: // Thủy
              expectedGemIds.push(23087, 23136);
              break;
            case 3: // Hỏa
              expectedGemIds.push(23088, 23137);
              break;
            case 4: // Phong
              expectedGemIds.push(23089, 23138);
              break;
          }

          // Check if the added item is the gem we're waiting for
          if (arrayIndex >= 0 && arrayIndex < account.tuido.length) {
            const addedItem = account.tuido[arrayIndex];
            if (expectedGemIds.includes(addedItem._Id) && addedItem._Sl > 0) {
              // Clear pending flag and call autoChangeGem again
              account.pendingGemChange = undefined;

              // Wait a bit for server to process the items, then call autoChangeGem
              setTimeout(() => {
                autoChangeGem(account);
              }, 500);
            }
          }
        } else if (account.waitingForCharGemChange) {
          // Character gem change completed (bag updated), now change pet gem
          account.waitingForCharGemChange = false;

          // Wait a bit for server to process, then call autoChangeGem for pet
          setTimeout(() => {
            autoChangeGem(account);

            // If waiting for Hải Tặc walk restart and gem is correct, restart walking
            if (
              account.waitingForHaitacWalkRestart &&
              account.currentEvent === 'haitac' &&
              !account.haitacIntervalId
            ) {
              if (!checkIfNeedsGemChange(account)) {
                account.waitingForHaitacWalkRestart = false;
                autoCatchHaiTac(account, account.player._Id);
              }
            }
          }, 500);
        } else if (
          account.waitingForHaitacWalkRestart &&
          account.currentEvent === 'haitac' &&
          !account.haitacIntervalId
        ) {
          // Check if gem is now correct after bag update
          if (!checkIfNeedsGemChange(account)) {
            account.waitingForHaitacWalkRestart = false;
            autoCatchHaiTac(account, account.player._Id);
          }
        }
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

        // Check if we're waiting for character gem change to complete
        if (account.waitingForCharGemChange) {
          // Check if the equipped item is in slot 5 (Đặc Thù - gem slot)
          const equippedItemId = account.charEquip[5]?._Id || 0;
          const gemIds = [23086, 23087, 23088, 23089, 23135, 23136, 23137, 23138];
          if (equippedItemId > 0 && gemIds.includes(equippedItemId)) {
            // Check if gem matches character element
            const gemIsCorrect = checkGemMatchesElement(account, equippedItemId);

            if (gemIsCorrect) {
              // Character gem change completed and is correct, now change pet gem
              account.waitingForCharGemChange = false;

              // Wait a bit for server to process, then call autoChangeGem for pet
              setTimeout(() => {
                autoChangeGem(account);

                // If waiting for Hải Tặc walk restart and all gems are correct, restart walking
                if (
                  account.waitingForHaitacWalkRestart &&
                  account.currentEvent === 'haitac' &&
                  !account.haitacIntervalId
                ) {
                  if (checkIfAllGemsCorrect(account)) {
                    account.waitingForHaitacWalkRestart = false;
                    autoCatchHaiTac(account, account.player._Id);
                  }
                }
              }, 500);
            } else {
              // Gem is equipped but doesn't match, keep waiting or try again
              account.waitingForCharGemChange = false;
              setTimeout(() => {
                autoChangeGem(account);
              }, 500);
            }
          }
        } else if (
          account.waitingForHaitacWalkRestart &&
          account.currentEvent === 'haitac' &&
          !account.haitacIntervalId
        ) {
          // Check if all gems (character and pet) are now correct after equipment update
          if (checkIfAllGemsCorrect(account)) {
            account.waitingForHaitacWalkRestart = false;
            autoCatchHaiTac(account, account.player._Id);
          }
        }
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
          if (id > 0) {
            // Find item in DATA_ITEM to get loai (equipment category)
            const findItem = DATA_ITEM.find((e) => e[0] === id);
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

function checkTurn(A_0: number[], remotePort: number) {
  const find = remotePorts.find((e) => e[1] === remotePort);
  if (!find) {
    return;
  }

  const account = clients[find[0]];
  if (!account) {
    return;
  }

  const caseType = A_0[5];

  if (caseType != 1) {
    return;
  }

  // Check if this account is a leader (has member configuration)
  const isLeader =
    account.party.member1Id > 0 ||
    account.party.member2Id > 0 ||
    account.party.member3Id > 0 ||
    account.party.member4Id > 0;

  const leaderId = account.party.leaderId;

  if (!isLeader) {
    // This is a party member (or potential party member)
    // First try to find leader from configured leaderId
    let leaderAccount = leaderId > 0 ? clients[leaderId] : null;

    // If leader not found or leaderId is 0, check if this member is in someone else's party
    // This handles rotating members in Hải Tặc event who might have incorrect leaderId
    if (!leaderAccount) {
      // First check if this member has a currentPartyId set (they joined a party)
      if (account.party.currentPartyId > 0) {
        leaderAccount = clients[account.party.currentPartyId];
      }

      // If still not found, try to find the actual party leader by checking if this member is in someone's currentMember slots
      if (!leaderAccount) {
        for (const [playerId, client] of Object.entries(clients)) {
          if (client && client.party) {
            if (
              client.party.currentMember1 === account.player._Id ||
              client.party.currentMember2 === account.player._Id ||
              client.party.currentMember3 === account.player._Id ||
              client.party.currentMember4 === account.player._Id
            ) {
              leaderAccount = client;
              break;
            }
          }
        }
      }
    }

    if (leaderAccount) {
      // Increment turn counter
      leaderAccount.turn++;

      // Count how many members are currently in the party (including leader)
      let memberCount = 1; // Leader counts as 1
      if (leaderAccount.party.currentMember1 > 0) memberCount++;
      if (leaderAccount.party.currentMember2 > 0) memberCount++;
      if (leaderAccount.party.currentMember3 > 0) memberCount++;
      if (leaderAccount.party.currentMember4 > 0) memberCount++;

      // If all members have taken their turn, trigger auto attack
      if (leaderAccount.turn >= memberCount) {
        // Reset turn counter immediately after checking
        leaderAccount.turn = 0;

        // Call autoAttack function
        autoAttack(leaderAccount, leaderAccount.player._Id);
      }
    } else {
      // Not in any party, treat as solo player
      autoAttack(account, account.player._Id);
    }
  } else if (isLeader) {
    // This is the leader - increment own turn counter
    account.turn++;

    // Count members (including leader)
    let memberCount = 1; // Leader counts as 1
    if (account.party.currentMember1 > 0) memberCount++;
    if (account.party.currentMember2 > 0) memberCount++;
    if (account.party.currentMember3 > 0) memberCount++;
    if (account.party.currentMember4 > 0) memberCount++;

    // If all members have taken their turn
    if (account.turn >= memberCount) {
      // Reset turn counter immediately after checking
      account.turn = 0;

      autoAttack(account, account.player._Id);
    }
  } else {
    // Solo player (not in party, not a leader)
    // Call autoAttack immediately
    autoAttack(account, account.player._Id);
  }
}

// Helper: Convert position number (1-20) to location hex string
function getLocation(position: number): string {
  const row = Math.floor((position - 1) / 5);
  const col = (position - 1) % 5;
  return row.toString(16).padStart(2, '0') + col.toString(16).padStart(2, '0');
}

// Helper: Get location of first alive enemy with adjacent alive enemy (F1 logic)
function getVTF1(battleInfo: (Battleinfo | null)[]): string {
  // Check positions 1-5 (row 0) for adjacent enemies
  for (let i = 0; i < 4; i++) {
    const pos1 = battleInfo[i];
    const pos2 = battleInfo[i + 1];
    if (pos1 && pos1._Hp > 0 && pos2 && pos2._Hp > 0) {
      return getLocation(i + 2); // Return position of second enemy (i+2 because positions are 1-based)
    }
  }

  // Check positions 6-10 (row 1) for adjacent enemies
  for (let i = 5; i < 9; i++) {
    const pos1 = battleInfo[i];
    const pos2 = battleInfo[i + 1];
    if (pos1 && pos1._Hp > 0 && pos2 && pos2._Hp > 0) {
      return getLocation(i + 2);
    }
  }

  // If no adjacent enemies, find first alive enemy
  for (let i = 0; i < 10; i++) {
    const pos = battleInfo[i];
    if (pos && pos._Hp > 0) {
      return getLocation(i + 1);
    }
  }

  return '0002'; // Default location
}

// Helper: Get first alive enemy location (sequential attack)
function getFirstAliveEnemy(battleInfo: (Battleinfo | null)[]): string {
  for (let i = 0; i < 10; i++) {
    const pos = battleInfo[i];
    if (pos && pos._Hp > 0) {
      return getLocation(i + 1);
    }
  }
  return '0002'; // Default location
}

const listSkillMySelf = [18001, 14013, 10010, 12025, 11016, 17001, 10031];

// Character attack function
function characterAttack(account: ClientBot, skillId: number, location: string): void {
  const skillHex = API.rearrangeSkillId(skillId);
  let locationHex = getFirstAliveEnemy(account.battleInfo);
  const charColHex = account.charCol.toString(16).padStart(2, '0');

  if (location) {
    locationHex = location;
  }

  if (listSkillMySelf.includes(skillId)) {
    locationHex = `03${charColHex}`;
  }

  // if (location !== 'Lần lượt') {
  //   if (location === 'F1') {
  //     locationHex = getVTF1(account.battleInfo);
  //   } else {
  //     // location is a position number string
  //     const pos = parseInt(location);
  //     locationHex = getLocation(pos);
  //   }
  // } else {
  //   // Sequential attack - find first alive enemy
  //   locationHex = getFirstAliveEnemy(account.battleInfo);
  // }

  const packet = `F4440A00320103${charColHex}${locationHex}${skillHex}0F16`;
  //59e9a7ad9facae af 03af 828a a2bb
  //59e9a7ad9facae af aeaf 828a a9c5
  sendPacketWithDelay(account.socket.context, API.xorWithAD(packet), 0);
}

// Pet attack function
function petAttack(account: ClientBot, skillId: number, location: string): void {
  const petIndex = account.petBattle ? account.petBattle - 1 : 0;
  const pet = account.pets[petIndex];

  if (!pet) {
    return;
  }

  // Check if this is the leader's pet

  const skillHex = API.rearrangeSkillId(skillId);
  let locationHex = getFirstAliveEnemy(account.battleInfo);
  const charColHex = account.charCol.toString(16).padStart(2, '0');

  if (location) {
    locationHex = location;
  }

  if (listSkillMySelf.includes(skillId)) {
    locationHex = `02${charColHex}`;
  }

  // if (location !== 'Lần lượt') {
  //   if (location === 'F1') {
  //     locationHex = getVTF1(account.battleInfo);
  //   } else {
  //     // location is a position number string
  //     const pos = parseInt(location);
  //     locationHex = getLocation(pos);
  //   }
  // } else {
  //   // Sequential attack - find first alive enemy
  //   locationHex = getFirstAliveEnemy(account.battleInfo);
  // }

  const packet = `F4440A00320102${charColHex}${locationHex}${skillHex}0F16`;
  sendPacketWithDelay(account.socket.context, API.xorWithAD(packet), 0);
}

// Helper function to find first NPC 42550 in slots 0-9
function findHaiTacNPC(battleInfo: (Battleinfo | null)[]): string | null {
  for (let i = 0; i < 10; i++) {
    const entity = battleInfo[i];
    if (entity && entity._Id === 42550) {
      // Return location hex for this position (1-10)
      return getLocation(i + 1);
    }
  }
  return null;
}

// Auto attack function
function autoAttack(account: ClientBot, leaderId: number) {
  // Check if this is Hải Tặc event
  if (account.currentEvent === 'haitac') {
    handleHaiTacBattle(account, leaderId);
    return;
  }

  // Normal auto attack logic
  if (account.battleSkillConfig?.autoAttack) {
    const battleSkillConfig = account.battleSkillConfig;

    const skillCharUse = battleSkillConfig.skillNormalChar;
    characterAttack(account, skillCharUse, '');
    if (account.petBattle) {
      const skillPetUse = battleSkillConfig.skillNormalPet;
      petAttack(account, skillPetUse, '');
    }
  }
}

// Handle battle during Hải Tặc event
function handleHaiTacBattle(account: ClientBot, leaderId: number) {
  // Find NPC 42550 in slots 0-9
  const haitacNPCLocation = findHaiTacNPC(account.battleInfo);
  const hasHaiTacNPC = haitacNPCLocation !== null;

  // Get all party members
  const allMembers = [
    leaderId,
    account.party.currentMember1,
    account.party.currentMember2,
    account.party.currentMember3,
    account.party.currentMember4
  ].filter((id) => id > 0);

  // Get rotating member (current one)
  const rotatingMemberId =
    account.party.rotatingMembers && account.party.currentRotatingIndex !== undefined
      ? account.party.rotatingMembers[account.party.currentRotatingIndex]
      : 0;

  // Process each member
  allMembers.forEach((memberId) => {
    const memberClient = clients[memberId];
    if (!memberClient) {
      return;
    }

    const isLeader = memberId === leaderId;
    const isRotating = memberId === rotatingMemberId;

    if (isLeader) {
      // Leader always uses skill 18001 (targets self)
      characterAttack(memberClient, 18001, haitacNPCLocation || '');
    } else if (isRotating) {
      // Rotating member always uses skill 15002 (no pet)
      characterAttack(memberClient, !hasHaiTacNPC ? 17001 : 15002, haitacNPCLocation || '');
    } else {
      // Fixed members (2, 3, 4)
      const config = memberClient.battleSkillConfig;

      if (!hasHaiTacNPC) {
        // No NPC 42550: use defense skill 17001
        characterAttack(memberClient, 17001, haitacNPCLocation || '');

        // Pet also defends if exists
        if (memberClient.petBattle) {
          petAttack(memberClient, 17001, haitacNPCLocation || '');
        }
      } else {
        // Has NPC 42550: use priority skills
        // Priority: skillClear > skillSpecial > skillNormal > 10000

        // Character attack
        let charSkill = 10000; // Default
        if (
          config?.skillClearChar &&
          config.skillClearChar > 0 &&
          config.skillClearChar !== 99999
        ) {
          charSkill = config.skillClearChar;
        } else if (
          config?.skillSpecialChar &&
          config.skillSpecialChar > 0 &&
          config.skillSpecialChar !== 99999
        ) {
          charSkill = config.skillSpecialChar;
        } else if (
          config?.skillNormalChar &&
          config.skillNormalChar > 0 &&
          config.skillNormalChar !== 99999
        ) {
          charSkill = config.skillNormalChar;
        }

        characterAttack(memberClient, charSkill, haitacNPCLocation);

        // Pet attack if exists
        if (memberClient.petBattle) {
          let petSkill = 10000; // Default
          if (config?.skillClearPet && config.skillClearPet > 0 && config.skillClearPet !== 99999) {
            petSkill = config.skillClearPet;
          } else if (
            config?.skillSpecialPet &&
            config.skillSpecialPet > 0 &&
            config.skillSpecialPet !== 99999
          ) {
            petSkill = config.skillSpecialPet;
          } else if (
            config?.skillNormalPet &&
            config.skillNormalPet > 0 &&
            config.skillNormalPet !== 99999
          ) {
            petSkill = config.skillNormalPet;
          }

          petAttack(memberClient, petSkill, haitacNPCLocation);
        }
      }
    }
  });

  // Also handle leader's pet
  const leaderClient = clients[leaderId];
  if (leaderClient?.petBattle) {
    const config = leaderClient.battleSkillConfig;

    if (!hasHaiTacNPC) {
      // Defense
      petAttack(leaderClient, 17001, haitacNPCLocation || '');
    } else {
      // Priority skills
      let petSkill = 10000;
      if (config?.skillClearPet && config.skillClearPet > 0 && config.skillClearPet !== 99999) {
        petSkill = config.skillClearPet;
      } else if (
        config?.skillSpecialPet &&
        config.skillSpecialPet > 0 &&
        config.skillSpecialPet !== 99999
      ) {
        petSkill = config.skillSpecialPet;
      } else if (
        config?.skillNormalPet &&
        config.skillNormalPet > 0 &&
        config.skillNormalPet !== 99999
      ) {
        petSkill = config.skillNormalPet;
      }

      petAttack(leaderClient, petSkill, haitacNPCLocation);
    }
  } else {
  }
}

// Auto catch Hải Tặc function
function autoCatchHaiTac(account: ClientBot, leaderId: number) {
  // Clear existing interval if any
  if (account.haitacIntervalId) {
    clearInterval(account.haitacIntervalId);
    account.haitacIntervalId = undefined;
  }

  // Send trainon packet
  sendPacketWithDelay(account.socket.context, PACKET.trainon, 0);

  // Define walk coordinates
  const walkCoordinates = [
    { x: 1462, y: 1155 },
    { x: 1642, y: 1135 },
    { x: 1522, y: 1215 }
  ];

  // Start walking interval (every 2000ms)
  account.haitacIntervalId = setInterval(() => {
    // Check if still in Hải Tặc event
    // Event should be cleared when all rotating members are done
    if (!account.currentEvent || account.currentEvent !== 'haitac') {
      if (account.haitacIntervalId) {
        clearInterval(account.haitacIntervalId);
        account.haitacIntervalId = undefined;
      }
      return;
    }

    // Random walk coordinate
    const randomIndex = Math.floor(Math.random() * walkCoordinates.length);
    const coord = walkCoordinates[randomIndex];
    const walkPacket = API.Walk(coord.x, coord.y);
    sendPacketWithDelay(account.socket.context, walkPacket, 0);
  }, 2000);
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

        if (!isNaN(slotIndex) && slotIndex >= 0 && slotIndex < 20) {
          const entity = account.battleInfo[slotIndex];

          if (entity) {
            // Initialize _Statuses if it doesn't exist
            if (!entity._Statuses) {
              entity._Statuses = [];
            }

            switch (statusType) {
              case 1: // LIVE - Clear Hard CC statuses
                // Clear only Hard CC statuses
                entity._Statuses = entity._Statuses.filter(
                  (skillId: number) => !LIST_HARD_CC.includes(skillId)
                );
                break;

              case 2: // DEF - Clear all defense skills
                entity._Statuses = entity._Statuses.filter(
                  (skillId: number) => !LIST_DEF.includes(skillId)
                );
                break;

              case 5: // BUFF - Clear all buff skills
                entity._Statuses = entity._Statuses.filter(
                  (skillId: number) => !LIST_BUFF.includes(skillId)
                );
                break;

              default:
                break;
            }

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
          }
        }
        break;
      }

      case 3: {
        // Clear battle entity at location
        const locationString = `${A_0[6].toString(16).padStart(2, '0')}${A_0[7].toString(16).padStart(2, '0')}`;
        const location = getLocation2(locationString);

        if (location !== null) {
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
        break;
      }

      default:
        break;
    }
  } catch (error) {}
}

// Helper function to check if gem matches character element
function checkGemMatchesElement(account: ClientBot, gemId: number): boolean {
  const thuocTinh = account.player._ThuocTinh; // Character element

  switch (thuocTinh) {
    case 1: // Địa
      return gemId === 23086 || gemId === 23135;
    case 2: // Thủy
      return gemId === 23087 || gemId === 23136;
    case 3: // Hỏa
      return gemId === 23088 || gemId === 23137;
    case 4: // Phong
      return gemId === 23089 || gemId === 23138;
    default:
      return false;
  }
}

// Helper function to check if character needs gem change
function checkIfNeedsGemChange(account: ClientBot): boolean {
  // Check if changeGemChar is enabled
  if (!account.battleSkillConfig?.changeGemChar) {
    return false;
  }

  // Check slot 6 (charEquip[5] - Đặc Thù slot)
  const charEquipSlot5 = account.charEquip[5];
  if (!charEquipSlot5) {
    return true; // No gem equipped, needs change
  }

  const gemId = charEquipSlot5._Id;
  return !checkGemMatchesElement(account, gemId);
}

// Helper function to check if pet gem matches pet element
function checkPetGemMatchesElement(petElement: number, gemId: number): boolean {
  switch (petElement) {
    case 1: // Địa
      return gemId === 23086 || gemId === 23135;
    case 2: // Thủy
      return gemId === 23087 || gemId === 23136;
    case 3: // Hỏa
      return gemId === 23088 || gemId === 23137;
    case 4: // Phong
      return gemId === 23089 || gemId === 23138;
    default:
      return false;
  }
}

// Helper function to check if pet needs gem change
function checkIfNeedsPetGemChange(account: ClientBot): boolean {
  // Check if changeGemPet is enabled
  if (!account.battleSkillConfig?.changeGemPet) {
    return false;
  }

  // Check if pet is in battle
  if (!account.petBattle) {
    return false; // No pet in battle, no need to change
  }

  const petIndex = account.petBattle - 1;
  const pet = account.pets[petIndex];
  if (!pet) {
    return false; // No pet found
  }

  const petGemId = pet._dacthu; // Pet equipment slot 5 (Đặc Thù)
  const petId = pet._Id; // Pet NPC ID

  // Get pet element from DATA_BATTLE_PET
  const findNPC = DATA_BATTLE_PET.find((e) => e[0] === petId);
  if (!findNPC) {
    return false; // Pet not found in data
  }

  const elementString = findNPC[2]; // Element as string: "Địa", "Thủy", "Hỏa", "Phong"
  let petElement = 0;
  switch (elementString) {
    case 'Địa':
      petElement = 1;
      break;
    case 'Thủy':
      petElement = 2;
      break;
    case 'Hỏa':
      petElement = 3;
      break;
    case 'Phong':
      petElement = 4;
      break;
  }

  if (petElement === 0) {
    return false; // Invalid element
  }

  // Check if gem matches pet element
  return !checkPetGemMatchesElement(petElement, petGemId);
}

// Helper function to check if all gems (character and pet) are correct
function checkIfAllGemsCorrect(account: ClientBot): boolean {
  // Check if character gem change is needed
  const needsCharGemChange = checkIfNeedsGemChange(account);

  // Check if pet gem change is needed
  const needsPetGemChange = checkIfNeedsPetGemChange(account);

  // Check if gem changes are in progress
  const charGemInProgress =
    account.waitingForCharGemChange ||
    (account.pendingGemChange && account.pendingGemChange.type === 'char');
  const petGemInProgress = account.pendingGemChange && account.pendingGemChange.type === 'pet';

  // All gems are correct if:
  // 1. Character gem doesn't need change (or changeGemChar is disabled)
  // 2. Pet gem doesn't need change (or changeGemPet is disabled or no pet)
  // 3. No gem changes are in progress
  return !needsCharGemChange && !needsPetGemChange && !charGemInProgress && !petGemInProgress;
}

// Auto change gem function for character and pet
function autoChangeGem(account: ClientBot) {
  try {
    // Track if character needs gem change
    let charNeedsGemChange = false;

    // Check character gem
    if (account.battleSkillConfig?.changeGemChar) {
      const charEquipSlot5 = account.charEquip[5]; // Slot 5 is Đặc Thù (special equipment)
      if (charEquipSlot5) {
        const id = charEquipSlot5._Id;
        const thuocTinh = account.player._ThuocTinh; // Character element

        // Check if current gem matches the element
        let gemMatches = false;
        switch (thuocTinh) {
          case 1: // Địa
            gemMatches = id === 23086 || id === 23135;
            break;
          case 2: // Thủy
            gemMatches = id === 23087 || id === 23136;
            break;
          case 3: // Hỏa
            gemMatches = id === 23088 || id === 23137;
            break;
          case 4: // Phong
            gemMatches = id === 23089 || id === 23138;
            break;
        }

        // If gem doesn't match element, find and equip correct gem
        if (!gemMatches) {
          charNeedsGemChange = true; // Mark that character needs gem change

          // First, try to find matching gem directly in bag
          let gemFound = false;
          for (const item of account.tuido) {
            const id2 = item._Id;
            const stt = item._Stt;

            let shouldEquip = false;
            switch (id2) {
              case 23086: // Ngọc NhamQuái (Địa)
              case 23135: // Alternative Địa gem
                if (thuocTinh === 1) {
                  shouldEquip = true;
                }
                break;
              case 23087: // Ngọc ThủyThần (Thủy)
              case 23136: // Alternative Thủy gem
                if (thuocTinh === 2) {
                  shouldEquip = true;
                }
                break;
              case 23088: // NgọcPhụngHoàng (Hỏa)
              case 23137: // Alternative Hỏa gem
                if (thuocTinh === 3) {
                  shouldEquip = true;
                }
                break;
              case 23089: // Ngọc ThanhLong (Phong)
              case 23138: // Alternative Phong gem
                if (thuocTinh === 4) {
                  shouldEquip = true;
                }
                break;
            }

            if (shouldEquip) {
              // Equip character gem
              const packet = API.equipItem(stt, null);
              if (account.socket.context) {
                // Set flag to wait for bag update before changing pet gem
                account.waitingForCharGemChange = true;
                sendPacketWithDelay(account.socket.context, packet, 0);
              }
              gemFound = true;
              break; // Found and equipped, exit loop
            }
          }

          // If gem not found directly, check for bag of gems
          if (!gemFound) {
            // Get bag gem ID for this element
            let bagGemId = 0;
            switch (thuocTinh) {
              case 1: // Địa
                bagGemId = 46293; // Túi bảo cự nham
                break;
              case 2: // Thủy
                bagGemId = 46294; // Túi bảo thiên thủy
                break;
              case 3: // Hỏa
                bagGemId = 46295; // Túi bảo hỏa phụng
                break;
              case 4: // Phong
                bagGemId = 46296; // Túi bảo phi long
                break;
            }

            // Find bag of gems in inventory
            if (bagGemId > 0) {
              for (const item of account.tuido) {
                if (item._Id === bagGemId && item._Sl > 0) {
                  // Use/open the bag
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const usePacket = API.useItem(item._Stt);
                  if (account.socket.context) {
                    // Set flags to wait for gems and bag update
                    account.pendingGemChange = {
                      type: 'char',
                      element: thuocTinh
                    };
                    account.waitingForCharGemChange = true;
                    sendPacketWithDelay(account.socket.context, usePacket, 0);
                  }
                  break;
                }
              }
            }
          }
        }
      }
    }

    // Check pet gem - only if not waiting for character gem change
    // If character needs gem change, wait for bag update before changing pet gem
    if (account.battleSkillConfig?.changeGemPet && account.petBattle && !charNeedsGemChange) {
      const petIndex = account.petBattle - 1; // Convert to 0-based index
      const pet = account.pets[petIndex];

      if (pet) {
        const id3 = pet._dacthu; // Pet equipment slot 5 (Đặc Thù)
        const id4 = pet._Id; // Pet NPC ID

        // Get pet element from DATA_BATTLE_PET
        const findNPC = DATA_BATTLE_PET.find((e) => e[0] === id4);
        if (findNPC) {
          const elementString = findNPC[2]; // Element as string: "Địa", "Thủy", "Hỏa", "Phong"
          let thuoctinh = 0;
          switch (elementString) {
            case 'Địa':
              thuoctinh = 1;
              break;
            case 'Thủy':
              thuoctinh = 2;
              break;
            case 'Hỏa':
              thuoctinh = 3;
              break;
            case 'Phong':
              thuoctinh = 4;
              break;
          }

          // Check if current gem matches the pet element
          let gemMatches = false;
          switch (thuoctinh) {
            case 1: // Địa
              gemMatches = id3 === 23086 || id3 === 23135;
              break;
            case 2: // Thủy
              gemMatches = id3 === 23087 || id3 === 23136;
              break;
            case 3: // Hỏa
              gemMatches = id3 === 23088 || id3 === 23137;
              break;
            case 4: // Phong
              gemMatches = id3 === 23089 || id3 === 23138;
              break;
          }

          // If gem doesn't match element, find and equip correct gem
          if (!gemMatches) {
            // First, try to find matching gem directly in bag
            let gemFound = false;
            for (const item of account.tuido) {
              const id5 = item._Id;
              const stt2 = item._Stt;

              let shouldEquip = false;
              switch (id5) {
                case 23086: // Ngọc NhamQuái (Địa)
                case 23135: // Alternative Địa gem
                  if (thuoctinh === 1) {
                    shouldEquip = true;
                  }
                  break;
                case 23087: // Ngọc ThủyThần (Thủy)
                case 23136: // Alternative Thủy gem
                  if (thuoctinh === 2) {
                    shouldEquip = true;
                  }
                  break;
                case 23088: // NgọcPhụngHoàng (Hỏa)
                case 23137: // Alternative Hỏa gem
                  if (thuoctinh === 3) {
                    shouldEquip = true;
                  }
                  break;
                case 23089: // Ngọc ThanhLong (Phong)
                case 23138: // Alternative Phong gem
                  if (thuoctinh === 4) {
                    shouldEquip = true;
                  }
                  break;
              }

              if (shouldEquip) {
                // Equip pet gem (petIndex is 0-based, but we need 1-based for equipItem)
                const packet = API.equipItem(stt2, account.petBattle);
                if (account.socket.context) {
                  sendPacketWithDelay(account.socket.context, packet, 0);
                }
                gemFound = true;
                break; // Found and equipped, exit loop
              }
            }

            // If gem not found directly, check for bag of gems
            if (!gemFound) {
              // Get bag gem ID for this element
              let bagGemId = 0;
              switch (thuoctinh) {
                case 1: // Địa
                  bagGemId = 46293; // Túi bảo cự nham
                  break;
                case 2: // Thủy
                  bagGemId = 46294; // Túi bảo thiên thủy
                  break;
                case 3: // Hỏa
                  bagGemId = 46295; // Túi bảo hỏa phụng
                  break;
                case 4: // Phong
                  bagGemId = 46296; // Túi bảo phi long
                  break;
              }

              // Find bag of gems in inventory
              if (bagGemId > 0) {
                for (const item of account.tuido) {
                  if (item._Id === bagGemId && item._Sl > 0) {
                    // Use/open the bag
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const usePacket = API.useItem(item._Stt);
                    if (account.socket.context) {
                      // Set flag to wait for gems
                      account.pendingGemChange = {
                        type: 'pet',
                        element: thuoctinh
                      };
                      sendPacketWithDelay(account.socket.context, usePacket, 0);
                    }
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    // Error in autoChangeGem
  }
}
