import { graph } from './transfomer';
import { DATA_BATTLE_SKILL } from './constant2';
import { DATA2k, DATA_HLQ, EVENT_NAME, PACKET } from './constant';

const actionSend = (data: Buffer) => {
  if (data.toString('hex').slice(8, 10) === 'ac') {
    return Buffer.from(hexStringToByte(fakeAlogin(data)));
  }

  return data;
};

const hexStringToByte = (s: string) => {
  const array = new Array(Math.round(s.length / 2) - 1 + 1);
  for (let i = 0; i < s.length; i += 2) {
    array[Math.round(i / 2)] = parseInt(s.substring(i, i + 2), 16);
  }
  return array;
};

const fakeAlogin = (inputString: Buffer) => {
  return inputString
    .toString('hex')
    .replace('adadadadaead', 'adaddbc30bad')
    .replace('adaddbc317ad', 'adaddbc30bad');
};

const compareString = (data: Buffer, start: number, end: number, stringCompare: string) => {
  return data.toString('hex').slice(start, end) === stringCompare;
};

function xorWithAD(hexString: string): string {
  let result = '';
  for (let i = 0; i < hexString.length; i += 2) {
    const hexByte = hexString.substr(i, 2);
    const decimalValue = parseInt(hexByte, 16);
    const xoredValue = decimalValue ^ 0xad;
    const xoredHexValue = xoredValue.toString(16).padStart(2, '0');
    result += xoredHexValue;
  }
  return result;
}

function hexToInt32(num: string): number {
  const array = hexStringToByte(num);
  let result = 0;
  switch (array.length) {
    case 1:
      result = parseInt(byteToHexstring(new Uint8Array([array[0]])), 16);
      break;
    case 2:
      result = parseInt(byteToHexstring(new Uint8Array([array[1], array[0]])), 16);
      break;
    case 4:
      result = parseInt(
        byteToHexstring(new Uint8Array([array[3], array[2], array[1], array[0]])),
        16
      );
      break;
  }
  return result;
}

function byteToHexstring(bytes: Uint8Array | number[]): string {
  let text = '';
  for (let i = 0; i < bytes.length; i++) {
    const hex = bytes[i].toString(16);
    text += (hex.length === 1 ? '0' : '') + hex;
  }
  return text;
}

function findIDCharFromData(data: Buffer) {
  return hexToInt32(xorWithAD(data.toString('hex').slice(12, 16)));
}

function convertElement(data?: number) {
  if (!data) return '';
  const conversionMap = {
    Địa: 1,
    Thủy: 2,
    Hỏa: 3,
    Phong: 4,
    Tâm: 5
  };

  for (const [key, value] of Object.entries(conversionMap)) {
    if (value === data) {
      return key;
    }
  }
  return '';
}

function convertElement2(data?: string) {
  if (!data) return undefined;
  switch (data) {
    case 'Địa':
      return 1;
    case 'Thủy':
      return 2;
    case 'Hỏa':
      return 3;
    case 'Phong':
      return 4;
    case 'Tâm':
      return 5;
    default:
      return undefined;
  }
}

function createDataAutoQ(contentAutoQ: string[]): any[] {
  const dataStepsQ: any[] = [];
  contentAutoQ.forEach((stepQ) => {
    if (!stepQ.slice(0, 3).includes('//')) {
      const result: any[] = [];
      if (['warp', 'send', 'pets', 'pete', 'tele', 'menu'].includes(stepQ.slice(0, 4))) {
        result.push(stepQ.slice(0, 4), +stepQ.slice(4));
      }
      if (['talk', 'hide', 'spec', 'pick'].includes(stepQ.slice(0, 4))) {
        const data = [...stepQ.slice(4).split(',')];
        result.push(stepQ.slice(0, 4), +data[0], +data[1], +data[2]);
        data.splice(0, 3);
        if (data.length > 0) {
          result.push(data);
        }
      }
      if (stepQ.slice(0, 4) === 'walk') {
        const xy = stepQ.slice(4).split(',');
        result.push('walk', +xy[0], +xy[1]);
      }

      if (stepQ.slice(0, 4) === 'buyx') {
        const data = [...stepQ.slice(4).split(',')];
        result.push(stepQ.slice(0, 4), +data[0], +data[1]);
      }

      dataStepsQ.push(result as any);
    } else {
      dataStepsQ.push(['startNew']);
    }
  });
  return dataStepsQ;
}

function EncDec_byte(packet: Uint8Array): Uint8Array {
  const result = new Uint8Array(packet.length);
  for (let i = 0; i < packet.length; i++) {
    result[i] = packet[i] ^ 0xad;
  }
  return result;
}

function byteToInt16(bytes: number[]) {
  return parseInt(byteToHexstring(bytes), 16);
}

function getNameFromHex(bytes: number[]): string {
  const nameLengthIndex = 29; // Fixed index for name length
  const nameLength = bytes[nameLengthIndex] * 2; // Name length in bytes
  const nameStartIndex = 29 + nameLength + 8; // Calculate start index of the name
  const nameBytes = bytes.slice(nameStartIndex); // Extract name bytes

  // Convert name bytes to characters and join them to form the name string
  const name = nameBytes.map((byte) => String.fromCharCode(byte)).join('');
  return name;
}

function bfs(start: number, end: number) {
  if (!(start in graph)) return null;

  const paths: any = [];
  const queue: [number, number[]][] = [[start, [start]]];
  const visited = new Set<number>();

  while (queue.length) {
    const [node, path] = queue.shift() as [number, number[]];

    for (const neighbor of graph[node]) {
      if (neighbor === end) {
        // If the neighbor is the end node, add the current path to the result
        paths.push([...path, neighbor]);
      } else if (!visited.has(neighbor)) {
        // If the neighbor has not been visited, add it to the queue
        visited.add(neighbor);
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }

  return paths.length > 0 ? paths : null; // Return null if no paths are found
}

function Warp(door: number) {
  return '59e9a9adb9a5' + xorWithAD(door.toString(16)) + 'ad';
}

function Walk(x: number, y: number) {
  const text = byteToHexstring([
    hexStringToByte(x.toString(16).padStart(4, '0'))[1],
    hexStringToByte(x.toString(16).padStart(4, '0'))[0]
  ]);
  const text2 = byteToHexstring([
    hexStringToByte(y.toString(16).padStart(4, '0'))[1],
    hexStringToByte(y.toString(16).padStart(4, '0'))[0]
  ]);
  return xorWithAD('F4440900060105' + text + text2 + 'C9D6');
}

function Talk(npcId: number) {
  return '59e9a9adb9ac' + xorWithAD(npcId.toString(16)) + 'ad';
}

function Pick(slot: number) {
  return `59e9a9adbaaf${xorWithAD(slot.toString(16))}ad`;
}

function BuyLine(line: number, sl: number) {
  return `59e9a8adb6ac${xorWithAD(line.toString(16))}${xorWithAD(sl.toString(16))}ad`;
}

function isBrokenGem(idDacThu?: number, element?: number) {
  //1-Dia //2-Thuy //3-Hoa//4-Phong
  // 23086	Ngọc NhamQuái // 23087	Ngọc ThủyThần// 23088	NgọcPhụngHoàng// 23089	Ngọc ThanhLong
  if (!idDacThu || !element) return false;
  switch (element) {
    case 1:
      if (idDacThu === 23086) return false;
      return true;
    case 2:
      if (idDacThu === 23087) return false;
      return true;
    case 3:
      if (idDacThu === 23088) return false;
      return true;
    case 4:
      if (idDacThu === 23089) return false;
      return true;
    default:
      return true;
  }
}

function sliceStringHexToInt32(byteArray: number[], start: number, end: number) {
  return +hexToInt32(byteToHexstring(byteArray).substring(start, end));
}

function findItemsByElement(bag: any[], element?: number) {
  const result = {
    bagGem: [] as any[],
    gem: [] as any[]
  };
  if (!element) return result;
  // Define the mapping of elements to item IDs
  // const elementMapping: Record<1 | 2 | 3 | 4, number> = {
  //   1: 23086, // Địa - Ngọc NhamQuái
  //   2: 23087, // Thủy - Ngọc ThủyThần
  //   3: 23088, // Hỏa - NgọcPhụngHoàng
  //   4: 23089, // Phong - Ngọc ThanhLong
  // };

  // [46293, "Túi bảo cự nham", "38"],
  // [46294, "Túi bảo thiên thủy", "38"],
  // [46295, "Túi bảo hỏa phụng", "38"],
  // [46296, "Túi bảo phi long", "38"],

  const itemIDFind = {
    gemId: null as number | null,
    bagGemId: null as number | null
  };

  if (element === 1) {
    itemIDFind.gemId = 23086; // Địa - Ngọc NhamQuái
    itemIDFind.bagGemId = 46293; // Túi bảo cự nham
  }
  if (element === 2) {
    itemIDFind.gemId = 23087; // Thủy - Ngọc ThủyThần
    itemIDFind.bagGemId = 46294; // Túi bảo thiên thủy
  }

  if (element === 3) {
    itemIDFind.gemId = 23088; // Hỏa - NgọcPhụngHoàng
    itemIDFind.bagGemId = 46295; // Túi bảo hỏa phụng
  }
  if (element === 4) {
    itemIDFind.gemId = 23089; // Phong - Ngọc ThanhLong
    itemIDFind.bagGemId = 46296; // Túi bảo phi long
  }

  result.bagGem = bag.filter((item) => {
    return item.id === itemIDFind.bagGemId;
  });
  result.gem = bag.filter((item) => {
    return item.id === itemIDFind.gemId;
  });

  return result;
}

function equipItem(slot: number, petSlot: number | null = null) {
  const slotCV = xorWithAD(slot.toString(16).padStart(2, '0'));
  if (petSlot) {
    const petSlotCV = xorWithAD(petSlot.toString(16).padStart(2, '0'));
    return `59e9a9adbabc${petSlotCV}${slotCV}`;
  }
  return `59e9aeadbaa6${slotCV}`;
}
function useItem(slot: number) {
  const slotCV = xorWithAD(slot.toString(16).padStart(2, '0'));
  return `59e9abadbaa2${slotCV}acadad`;
}

function rearrangeSkillId(idskill: number) {
  const idConvert = idskill.toString(16);
  const result = [idConvert[2], idConvert[3], idConvert[0], idConvert[1]];
  return result.join('');
}

function convertDataToSlot(data: string | number) {
  // Mapping for both string codes to slot numbers and vice versa
  const conversionMap: {
    [key in
      | '0000'
      | '0001'
      | '0002'
      | '0003'
      | '0004'
      | '0100'
      | '0101'
      | '0102'
      | '0103'
      | '0104'
      | '0200'
      | '0201'
      | '0202'
      | '0203'
      | '0204'
      | '0300'
      | '0301'
      | '0302'
      | '0303'
      | '0304']: number;
  } = {
    '0000': 1,
    '0001': 2,
    '0002': 3,
    '0003': 4,
    '0004': 5,
    '0100': 6,
    '0101': 7,
    '0102': 8,
    '0103': 9,
    '0104': 10,
    '0200': 11,
    '0201': 12,
    '0202': 13,
    '0203': 14,
    '0204': 15,
    '0300': 16,
    '0301': 17,
    '0302': 18,
    '0303': 19,
    '0304': 20
  };

  // If input is a string, convert to slot number
  if (typeof data === 'string') {
    return conversionMap[data as keyof typeof conversionMap] || null;
  }

  // If input is a number, convert to string code
  if (typeof data === 'number') {
    // Find the key (string code) for the given value
    for (const [key, value] of Object.entries(conversionMap)) {
      if (value === data) {
        return key;
      }
    }
  }

  // Return null if no matching conversion found
  return null;
}

function joinToParty(id: number) {
  const idConvert = id.toString(16);
  const result = [idConvert[2], idConvert[3], idConvert[0], idConvert[1]];
  return '59e9abada0ac' + xorWithAD(result.join('')) + 'adad';
}

function leaderAcceptedPartyFrom(id: number) {
  const idConvert = id.toString(16);
  const result = [idConvert[2], idConvert[3], idConvert[0], idConvert[1]];
  //59e9aaada0aeac8885adad
  return xorWithAD('F44407000D0301') + xorWithAD(result.join('')) + 'adad';
}

function byteArrayToByteArray(byteArray: number[], startIndex: number, lengthIndex: number) {
  const array = new Uint8Array(lengthIndex);
  for (let i = 0; i < lengthIndex; i++) {
    array[i] = byteArray[startIndex + i];
  }
  return array;
}

function findNameSkill(id: number) {
  const findSkill = DATA_BATTLE_SKILL.find((e) => e[0] === +id);
  return findSkill ? findSkill[1] : 'X';
}

function outToParty(id: number) {
  const idConvert = (+id).toString(16);
  const result = [idConvert[2], idConvert[3], idConvert[0], idConvert[1]];
  //59e9abada0a938f0adad
  return '59e9abada0a9' + xorWithAD(result.join('')) + 'adad';
}

function setQuanSu(id: number) {
  const idConvert = (+id).toString(16);
  const result = [idConvert[2], idConvert[3], idConvert[0], idConvert[1]];
  return '59e9abada0a8' + xorWithAD(result.join('')) + 'adad';
}

function MenuTalk(select: number) {
  //59e9aeadb9a48d
  return '59e9aeadb9a4' + xorWithAD((select + 29).toString(16));
}

function getContentEvent(name: string) {
  switch (name) {
    //pmt
    case EVENT_NAME.PMT:
      return {
        lead: [['warp', 12808]],
        member: [['talk', 11, 402, 415, [1]]],
        type: name,
        map: 12808
      };
    //hổ lao quan
    case EVENT_NAME.HLQ:
      return {
        map: 12711,
        lead: [['warp', 12711]],
        member: [['talk', 1, 682, 335, [3]]],
        type: name
      };
    //nhị kiều
    case EVENT_NAME.NHI_KIEU:
      return {
        firstPacket: PACKET.on2k,
        lead: [['warp', 12061], ['startNew'], ['warp', 12921], ['startNew'], ['warp', 12922]],
        type: name,
        map: 12061
      };
    //40 npc
    case EVENT_NAME.NPC_40:
      return {
        lead: [['warp', 12003], ['startNew'], ['hide', 8, 242, 755, [1]]],
        type: name,
        map: 12003
      };
    //chấn hà
    case EVENT_NAME.CHAN_HA:
      return {
        lead: [['warp', 31000], ['startNew'], ['warp', 31072]],
        type: name,
        map: 31072
      };
    //tiên đấu
    case EVENT_NAME.TIEN_DAU:
      return {
        lead: [['warp', 23423], ['startNew'], ['talk', 1, 422, 515, [2]]],
        member: [
          ['talk', 1, 362, 335, [1]],
          ['startNew'],
          ['talk', 1, 362, 335, [1]],
          ['startNew'],
          ['talk', 1, 362, 335, [1]],
          ['startNew'],
          ['hide', 2, 0, 0]
        ],
        type: name,
        map: 49901
      };
  }
}

function createDataStepsQHLQ(currentMapId: number) {
  if ([49738].includes(currentMapId)) {
    return DATA_HLQ[0];
  }
  if ([49731].includes(currentMapId)) {
    return DATA_HLQ[1];
  }
  if ([49732].includes(currentMapId)) {
    return DATA_HLQ[2];
  }
  if ([49734].includes(currentMapId)) {
    return DATA_HLQ[3];
  }
  if ([49735].includes(currentMapId)) {
    return DATA_HLQ[4];
  }
  if ([49736].includes(currentMapId)) {
    return DATA_HLQ[5];
  }
  if ([49737].includes(currentMapId)) {
    return DATA_HLQ[6];
  }
  return [];
}

function createDataStepsQ2k(currentMapId: number) {
  if ([12922].includes(currentMapId)) {
    return DATA2k[0];
  }
  if ([12923].includes(currentMapId)) {
    return DATA2k[1];
  }
  if ([12924, 12926, 12928, 12929, 12931, 12932, 12933].includes(currentMapId)) {
    return DATA2k[2];
  }
  if ([12925, 12927].includes(currentMapId)) {
    return DATA2k[3];
  }
  if ([12930].includes(currentMapId)) {
    return DATA2k[4];
  }
  if ([12935, 12936, 12937].includes(currentMapId)) {
    return DATA2k[5];
  }
  if ([12934].includes(currentMapId)) {
    return DATA2k[6];
  }
  if ([12939].includes(currentMapId)) {
    return DATA2k[7];
  }
  return [];
}

function hexStringToUnicode(hexString: string) {
  let unicodeString = '';
  const source = xorWithAD(hexString.slice(12));
  for (let i = 0; i < source.length; i += 2) {
    const codePoint = parseInt(source.substring(i, i + 2), 16);
    unicodeString += String.fromCharCode(codePoint);
  }
  return unicodeString;
}

function convertChatFromServeToUnicode(A_0: number[]) {
  const text = xorWithAD(byteToHexstring(A_0.slice(10, A_0.length - 1)));

  return hexStringToUnicode(text) || '';
}

function int32ToHex4(num: number) {
  const hexString = num.toString(16).padStart(8, '0').toUpperCase();
  return (
    hexString.substring(6, 8) +
    hexString.substring(4, 6) +
    hexString.substring(2, 4) +
    hexString.substring(0, 2)
  );
}

function sendItem(_IdBDY: number, _IdPlayer: number, listSend: any[]) {
  return xorWithAD(
    'F44414001914' +
      int32ToHex4(+_IdBDY) +
      int32ToHex4(+_IdPlayer) +
      (listSend[0] ? listSend[0].slot.toString(16).padStart(2, '0') : '00') +
      (listSend[0] ? listSend[0].sl.toString(16).padStart(2, '0') : '00') +
      (listSend[1] ? listSend[1].slot.toString(16).padStart(2, '0') : '00') +
      (listSend[1] ? listSend[1].sl.toString(16).padStart(2, '0') : '00') +
      (listSend[2] ? listSend[2].slot.toString(16).padStart(2, '0') : '00') +
      (listSend[2] ? listSend[2].sl.toString(16).padStart(2, '0') : '00') +
      (listSend[3] ? listSend[3].slot.toString(16).padStart(2, '0') : '00') +
      (listSend[3] ? listSend[3].sl.toString(16).padStart(2, '0') : '00') +
      (listSend[4] ? listSend[4].slot.toString(16).padStart(2, '0') : '00') +
      (listSend[4] ? listSend[4].sl.toString(16).padStart(2, '0') : '00')
  );
}
export default {
  actionSend,
  hexStringToByte,
  byteToHexstring,
  fakeAlogin,
  compareString,
  xorWithAD,
  hexToInt32,
  findIDCharFromData,
  convertElement,
  createDataAutoQ,
  EncDec_byte,
  byteToInt16,
  getNameFromHex,
  bfs,
  Warp,
  Walk,
  Talk,
  Pick,
  BuyLine,
  isBrokenGem,
  convertElement2,
  sliceStringHexToInt32,
  findItemsByElement,
  equipItem,
  rearrangeSkillId,
  convertDataToSlot,
  joinToParty,
  leaderAcceptedPartyFrom,
  byteArrayToByteArray,
  findNameSkill,
  outToParty,
  MenuTalk,
  getContentEvent,
  createDataStepsQHLQ,
  createDataStepsQ2k,
  useItem,
  hexStringToUnicode,
  setQuanSu,
  convertChatFromServeToUnicode,
  sendItem
};
