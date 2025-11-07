export const DATA_PMT: [number, number][] = [
  [49919, 2],
  [49920, 5],
  [49921, 1],
  [49922, 1],
  [49923, 1],
  [49924, 2],
  [49925, 1],
  [49926, 1],
  [49931, 1],
  [49930, 2],
  [49928, 1],
  [49927, 12],
  [49929, 2],
  [49932, 1],
  [49933, 2],
  [49934, 2],
  [49935, 1],
  [49937, 2],
  [49938, 3],
  [49939, 1],
  [49936, 1],
  [49940, 1]
]

export const DATA_HLQ: any[] = [
  [
    //map 49738
    ['hide', 1, 342, 215]
  ],
  [
    //map 49731
    ['talk', 2, 222, 235]
  ],
  [
    //map 49732
    ['talk', 1, 1282, 1895],
    ['hide', 2, 1202, 895],
    ['talk', 5, 362, 275],
    ['talk', 8, 1522, 275]
  ],
  [
    //map 49734
    ['talk', 1, 1302, 2215],
    ['startNew'],
    ['talk', 2, 1562, 1795],
    ['startNew'],
    ['hide', 4, 1922, 1055],
    ['startNew'],
    ['talk', 8, 1922, 1115],
    ['startNew'],
    ['hide', 5, 462, 355],
    ['startNew'],
    ['hide', 6, 462, 355],
    ['startNew'],
    ['hide', 5, 462, 355],
    ['startNew'],
    ['talk', 17, 462, 355],
    ['startNew'],
    ['talk', 17, 462, 355],
    ['startNew'],
    ['hide', 1, 1962, 515],
    ['startNew'],
    ['hide', 1, 1962, 515]
  ],
  [
    //map 49735
    ['talk', 9, 222, 1655],
    ['talk', 10, 2602, 1295],
    ['hide', 2, 2982, 775],
    ['talk', 16, 2342, 555],
    ['hide', 3, 1842, 435],
    ['talk', 22, 1382, 415],
    ['talk', 23, 522, 555]
  ],
  [
    //map 49736
    ['talk', 9, 2202, 2315],
    ['talk', 10, 1582, 1755],
    ['hide', 2, 1102, 2235],
    ['hide', 3, 482, 1835],
    ['talk', 15, 522, 1115],
    ['talk', 20, 522, 515]
  ],
  [
    //map 49737
    ['talk', 13, 2982, 2155],
    ['hide', 2, 1102, 2255],
    ['talk', 16, 482, 1095],
    ['hide', 3, 902, 1155],
    ['hide', 4, 2042, 1615],
    ['hide', 5, 2522, 775],
    ['hide', 6, 1942, 435],
    ['talk', 25, 522, 675]
  ]
]

export const DATA_40NPC = ['talk', 5, 882, 295, [1]]

export const DATA2k: any[] = [
  [
    //map 12922
    ['hide', 3, 682, 295],
    ['hide', 4, 682, 295],
    ['hide', 2, 0, 0]
  ],
  [
    //map 12923
    ['hide', 3, 622, 375],
    ['hide', 2, 0, 0]
  ],
  [
    //map 12924,26,28, 29,31,32,33
    ['hide', 3, 302, 1435],
    ['hide', 4, 302, 1435],
    ['hide', 5, 302, 1435],
    ['talk', 1, 682, 295],
    ['hide', 2, 0, 0]
  ],
  [
    //map 12925,27
    ['hide', 3, 302, 1435],
    ['hide', 4, 302, 1435],
    ['hide', 5, 302, 1435],
    ['talk', 1, 682, 295],
    ['hide', 1, 0, 0]
  ],
  [
    //map 12930
    ['hide', 4, 302, 1435],
    ['hide', 5, 302, 1435],
    ['hide', 6, 302, 1435],
    ['talk', 1, 682, 295],
    ['hide', 3, 0, 0]
  ],
  [
    //map 12935,36,37,38
    ['hide', 5, 302, 1435],
    ['hide', 4, 302, 1435],
    ['hide', 3, 302, 1435],
    ['talk', 1, 682, 295],
    ['hide', 2, 0, 0]
  ],
  [
    //map 12934
    ['hide', 2, 762, 455],
    ['talk', 1, 762, 455],
    ['startNew'],
    ['talk', 2, 662, 395, [1]],
    ['startNew'],
    ['talk', 2, 662, 395, [1]]
  ],
  [
    //map 12939
    ['hide', 3, 502, 495],
    ['hide', 2, 682, 455],
    ['talk', 1, 682, 455]
  ]
]

export enum EVENT_WEEK_TYPE {
  GO_TO_MAP = 'goToMapEvent',
  GET_EVENT = 'getEvent',
  START_EVENT = 'startEvent',
  STOP_EVENT = 'stopEvent'
}

export enum EVENT_NAME {
  PMT = 'pmt',
  HLQ = 'hlq',
  NHI_KIEU = '2k',
  NPC_40 = '40npc',
  CHAN_HA = 'chanha',
  TIEN_DAU = 'tiendau',
  HAI_TAC = 'haitac',
  GA_HAI_TAC = 'gahaitac'
}

export const EVENTS: IEvent[] = [
  {
    id: 'pmt',
    name: 'Phong Ma Trận'
  },
  {
    id: 'hlq',
    name: 'Hổ Lao Quan'
  },
  {
    id: '2k',
    name: 'Nhị Kiều'
  },
  {
    id: '40npc',
    name: '40 NPC'
  },
  {
    id: 'chanha',
    name: 'Chấn Hà'
  },
  {
    id: 'tiendau',
    name: 'Tiên đấu'
  },
  {
    id: 'haitac',
    name: 'Hải Tặc'
  },
  {
    id: 'gahaitac',
    name: 'Gà Hải Tặc'
  }
]

export const PACKET = {
  deleteFull1: '59e9b5ad8eafa79c9c9c9c9c9c9c9c9c9ca79c9c9c9c9c9c9c9c9c9c',
  hoa: '59e986ada4acacadadadb102d0b79303d0b7aeadadadadadaba79c9c9c9c9c9c9c9c9c9ca79c9c9c9c9c9c9c9c9c9c',
  dia: '59e986ada4acacadadadb102d0b79303d0b7acadadadadadaba79c9c9c9c9c9c9c9c9c9ca79c9c9c9c9c9c9c9c9c9c',
  thuy: '59e986ada4acacadadadb102d0b79303d0b7afadadadadadaba79c9c9c9c9c9c9c9c9c9ca79c9c9c9c9c9c9c9c9c9c',
  phong:
    '59e986ada4acacadadadb102d0b79303d0b7a9adadadadadaba79c9c9c9c9c9c9c9c9c9ca79c9c9c9c9c9c9c9c9c9c',
  botTongdung: '59e9a4adabacaecbadbeaba8d859e9a9adb9acafad59e9aeadb9a4b359e9afadb9ab',
  botGianung: '59e9a9adb9acacad59e9afadb9ab59e9aeadb9a4b359e9afadb9ab',
  addAtk: '59e9a7ada5acadadb1acadadadad',
  getItemBonus: '59e9abadbaf9acadadad59e9abadbaf9afadadad',
  pk1489: '59e9a9adb924adad',
  pk1490: '59e9a9adb93dadad',
  clickEnd: '59e9afadb9ab',
  ping: '59e9a9adafaf82ce',
  autouseon: '59e9a0adafaf82ccd8d9c2d8dec88dc2c3',
  autouseoff: '59e9a3adafaf82ccd8d9c2d8dec88dc2cbcb',
  useSlot1: '59e9aeadbaa6ac59e9abadbaa2acacadad',
  autoon: '59e9a7adafaf82ccd8d9c28dc2c3',
  autooff: '59e9a6adafaf82ccd8d9c28dc2cbcb',
  slot1totuideo1: '59e9aeadba89ac',
  tuideo1toslot1: '59e9aeadba88ac',
  pausetd: '59e9a7adafaf82ddccd8dec8d9c9',
  resettd: '59e9a7adafaf82dfc8dec8d9d9c9',
  resumetd: '59e9a6adafaf82dfc8ded8c0c8d9c9',
  ngu: '59e9a9adb9acaaad',
  trainon: '59e9a6adafaf82d9dfccc4c38dc2c3',
  trainoff: '59e9a1adafaf82d9dfccc4c38dc2cbcb',
  vaotd: '59e9a9adb9acacad59e9afadb9ab59e9aeadb9a4b359e9afadb9ab59e9a9adb9acacad59e9afadb9ab',
  move10toslot11: '59e9a8adbaa7a7aca6',
  move12toslot11: '59e9a8adbaa7a1aca6',
  move23toslot22: '59e9a8adbaa7baacbb',
  mix1vs11: '59e9a5adbaa3 acac a6ac adad',

  mix2vs11: '59e9a5adbaa3afaca6acadad',
  mix3vs11: '59e9a5adbaa3aeaca6acadad',
  mix4vs11: '59e9a5adbaa3acaca6acadad',
  mix5vs11: '59e9a5adbaa3acaca6acadad',
  mix6vs11: '59e9a5adbaa3acaca6acadad',
  mix7vs11: '59e9a5adbaa3acaca6acadad',
  mix8vs11: '59e9a5adbaa3acaca6acadad',
  mix9vs11: '59e9a5adbaa3acaca6acadad',
  horseUp: '59e9a5adafaf82c5c2dfdec8',
  on2k: '59e9a5adafaf829fc68dc2c3'
}

export const PRIORITY_MAP_IDS = [
  49737,
  49736,
  12933,
  12939,
  10991,
  12939,
  12938,
  12591 //test 12591
]

export const PRIORITY_NPC_IDS = [
  42201, // Đổng Trác
  43075,
  42237,
  42308,
  42255,
  42311,
  42282,
  42349,
  43081,
  42309,
  43074,
  42244,
  42221,
  42414,
  42442,
  42228,
  42279,
  42231,
  42334,
  42375,
  42219,
  42416,
  42323,
  42252,
  42307,
  42401,
  42343,
  42386,
  42383,
  42363,
  42427,
  42487,
  42305,
  42268,
  42353,
  42377,
  42338,
  43059,
  43061,
  42217,
  42326,
  42327,
  42225,
  42339,
  42215,
  42314,
  42298,
  42332,
  42446,
  42417,
  42483,
  42481,
  42425,
  42352,
  42423,
  42424,
  42478,
  42480,
  42491,
  42412,
  42408,
  42485,
  42407,
  42420,
  42460,
  42463,
  42461,
  42466,
  42464,
  42465,
  43108,
  43109,
  43110,
  43111,
  43124,
  27212,
  27211,
  27214,
  27213,
  61320,
  27233,
  42337,
  42453,
  27232,
  27231,
  42454,
  42359,
  27234,
  42291,
  42537,
  42292,
  42347,
  42445,
  61212,
  61213,
  42369,
  43072,
  61346,
  43058,
  42295,
  42217,
  42274,
  42341,
  42265,
  43008,
  42471,
  61226,
  61232,
  61333,
  61334,
  61325,
  61327,
  61324,
  61341,
  61345,
  43006,
  42287,
  42376,
  43080,
  42253,
  27173,
  27170,
  27171,
  27172,
  27004,
  27080,
  27156,
  27146,
  27176,
  27031,
  43122,
  43133,
  43131,
  43148,
  43151,
  43134,
  61338,
  61344,
  42493,
  51337,
  61335,
  61336,
  61339,
  61340,
  61342,
  43113,
  27056,
  15049,
  15050,
  25008 // test 25008
]

export enum STATUS_CODES {
  LIVE = 1,
  DEF = 2,
  BUFF = 5
}

export enum ITEM_EQUIP_TYPE {
  MU = 1,
  AO = 2,
  VK = 3,
  TAY = 4,
  CHAN = 5,
  DT = 6,
  NT_MU = 7,
  NT_AO = 8,
  NT_VK = 9,
  NT_TAY = 10,
  NT_CHAN = 11
}

export const LIST_ITEM_NEED_SEND = [
  { id: 46353, name: 'Hộp quà năm Tý' },
  { id: 46390, name: 'Hộp TT Hỏa' },
  { id: 46137, name: 'Kim tất lễ hộp' },
  { id: 46138, name: 'Túi tơ tằm' },
  { id: 46139, name: 'TNgọctrườnghộp' },
  { id: 46391, name: 'Hộp TT Dia' },
  { id: 46405, name: 'Viên mix sơ cấp' },
  { id: 46129, name: 'Linhhệvũkhíhộp' },
  { id: 46340, name: 'Trái cây giáng sinh' },
  { id: 46360, name: 'Hộp gấm văn khúc' },
  { id: 46258, name: 'Thần tình yêu thật' },
  { id: 46038, name: 'đạI phúc thần' },
  { id: 64024, name: 'Mảnh TNT INT' },
  { id: 46202, name: 'Túi gấm hồi ức' },
  { id: 46383, name: 'Hộp thiên thù' },
  { id: 46240, name: 'Kiện thể ngọc dịch' },
  { id: 64020, name: 'Mảnh hệ Thủy' },
  { id: 46388, name: 'Hộp TT Phong' },
  { id: 46130, name: 'Tthượngkimđan' },
  { id: 46327, name: 'Hộp bảo thủy hoa' },
  { id: 46394, name: 'Hộp Tượng TNT' },
  { id: 64023, name: 'Mảnh TNT ATK' },
  { id: 46050, name: 'Ðơn Thăng Hoa' },
  { id: 46389, name: 'Hộp TT Thủy' },
  { id: 46034, name: 'Cẩm nang hồi ức' },
  { id: 46341, name: 'Trái cây giáng sinh' },
  { id: 46300, name: 'Bánh ngọc thỏ' },
  { id: 46257, name: 'Thần tình yêu' },
  { id: 46235, name: 'Thần tình yêu' },
  { id: 46236, name: 'Thần tình yêu' },
  { id: 46239, name: 'Thần tình yêu' },
  { id: 46386, name: 'Thần tình yêu' }
]

export const LIST_HARD_CC = [
  13018, 10033, 10004, 11014, 14008, 14021, 20014, 20025, 20026, 20027, 13002
]
export const LIST_REMOVE_CC = [11019, 11025, 11031, 20015]
export const LIST_DEF = [10031, 10010, 13021]
export const LIST_BUFF = [12025, 14013]

// Static server configuration
export const STATIC_SERVER_PORT = 4567
export const STATIC_SERVER_URL = `http://localhost:${STATIC_SERVER_PORT}`

// Utility function to get image URLs
export const getImageUrl = (path: string) => `${STATIC_SERVER_URL}/static/${path}`

// Specific image URL helpers
export const getItemImageUrl = (itemId: number | null) =>
  getImageUrl(`items/item_${itemId ? itemId : 'default'}.png`)
export const getSkillImageUrl = (skillId: number) => getImageUrl(`skills/icon_sk${skillId}.webp`)
