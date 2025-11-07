import { UpstreamContext } from 'node-tcp-proxy';

export interface PlayerConfig {
  partyConfig: {
    member1Id: number;
    member2Id: number;
    member3Id: number;
    member4Id: number;
    qsMemberIndex: number;
    leaderId: number;
  };
  battleSkillConfig: {
    changeGemChar: boolean;
    hoisinhChar: boolean;
    autoAttack: boolean;
    skillNormalChar: number;
    skillSoloChar: number;
    skillSpecialChar: number;
    skillCCChar: number;
    skillBuffChar: number;
    skillClearChar: number;
    changeGemPet: boolean;
    hoisinhPet: boolean;
    skillNormalPet: number;
    skillSoloPet: number;
    skillSpecialPet: number;
    skillCCPet: number;
    skillBuffPet: number;
    skillClearPet: number;
  };
}

export interface BattleSkillConfig {
  changeGemChar: boolean;
  hoisinhChar: boolean;
  autoAttack: boolean;
  skillNormalChar: number;
  skillSoloChar: number;
  skillSpecialChar: number;
  skillCCChar: number;
  skillBuffChar: number;
  skillClearChar: number;
  changeGemPet: boolean;
  hoisinhPet: boolean;
  skillNormalPet: number;
  skillSoloPet: number;
  skillSpecialPet: number;
  skillCCPet: number;
  skillBuffPet: number;
  skillClearPet: number;
}

export interface ClientBot {
  socket: ClientSocket;
  player: Player;
  pets: Pet[];
  charEquip: CharEquip[];
  petEquip: PetEquip[];
  tuido: Tuido[];
  tuideo: Tuideo[];
  luulang: Luulang[];
  battleInfo: (Battleinfo | null)[];
  turn: number; // Current battle turn counter
  charCol: number; // Character column position in battle (0-4)
  battle: number; // Battle state flag (0 = not in battle, 1 = in battle)
  party: PartyInfo; // Party information
  battleSkillConfig?: BattleSkillConfig; // Battle skill configuration
}

export interface ClientSocket {
  context?: UpstreamContext;
  remotePort: number | null;
  connectByTool: boolean;
  m_f: string;
}

export interface Player {
  _Id: number;
  _Name: string;
  _Lv: number;
  _Lv2: number;
  _Sex: number;
  _Hair: number;
  _HairColor: number;
  _SkinColor: number;
  _Hp: number;
  _HpMax: number;
  _Sp: number;
  _SpMax: number;
  _MapId: number;
  _MapX: number;
  _MapY: number;
  _Gold: number;
  _ExpTotal: number;
  _Exp: number;
  _ExpMax: number;
  _ExpMin: number;
  _Int: number;
  _Atk: number;
  _Def: number;
  _Hpx: number;
  _Spx: number;
  _Agi: number;
  _Int2: number;
  _Atk2: number;
  _Def2: number;
  _Hpx2: number;
  _Spx2: number;
  _Agi2: number;
  _Int_Plus1: number;
  _Atk_Plus1: number;
  _Def_Plus1: number;
  _Hpx_Plus1: number;
  _Spx_Plus1: number;
  _Agi_Plus1: number;
  _Int_Plus2: number;
  _Atk_Plus2: number;
  _Def_Plus2: number;
  _Hpx_Plus2: number;
  _Spx_Plus2: number;
  _Agi_Plus2: number;
  _Int3: number;
  _Atk3: number;
  _Def3: number;
  _Hpx3: number;
  _Spx3: number;
  _Int4: number;
  _Atk4: number;
  _Def4: number;
  _Hpx4: number;
  _Spx4: number;
  _Agi4: number;
  _Texp: number;
  _God: number;
  _Ghost: number;
  _Reborn: number;
  _ThuocTinh: number;
  _PlayerOnline: number;
  _LeaderId: number;
  _PartyFull: boolean;
  _Point: number;
  _MapName: string;
}

export interface Pet {
  _Id: number;
  _Name: string;
  _Lv: number;
  _ThuocTinh: number;
  _Hp: number;
  _HpMax: number;
  _Sp: number;
  _SpMax: number;
  _Fai: number;
  _ExpTotal: number;
  _Exp: number;
  _ExpMax: number;
  _ExpMin: number;
  _Texp: number;
  _Reborn: number;
  _Int: number;
  _Atk: number;
  _Def: number;
  _Hpx: number;
  _Spx: number;
  _Agi: number;
  _Int2: number;
  _Atk2: number;
  _Def2: number;
  _Hpx2: number;
  _Spx2: number;
  _Agi2: number;
  _Int3: number;
  _Atk3: number;
  _Def3: number;
  _Hpx3: number;
  _Spx3: number;
  _Agi3: number;
  _Mu: number;
  _Ao: number;
  _vukhi: number;
  _tay: number;
  _chan: number;
  _dacthu: number;
  _Mu_Doben: number;
  _Ao_Doben: number;
  _vukhi_Doben: number;
  _tay_Doben: number;
  _chan_Doben: number;
  _dacthu_Doben: number;
  _Proto: number;
}

export interface NpcInMap {
  _Id: number;
  _MapX: number;
  _MapY: number;
  _Delay: number;
  _KC: number;
}

export const TypePets = {
  _Id: '_Id',
  _Name: '_Name',
  _Lv: '_Lv',
  _ThuocTinh: '_ThuocTinh',
  _Hp: '_Hp',
  _HpMax: '_HpMax',
  _Sp: '_Sp',
  _SpMax: '_SpMax',
  _Fai: '_Fai',
  _ExpTotal: '_ExpTotal',
  _TExp: '_TExp',
  _Exp: '_Exp',
  _ExpMax: '_ExpMax',
  _ExpMin: '_ExpMin',
  _Reborn: '_Reborn',
  _Int: '_Int',
  _Atk: '_Atk',
  _Def: '_Def',
  _Hpx: '_Hpx',
  _Spx: '_Spx',
  _Agi: '_Agi',
  _Int2: '_Int2',
  _Atk2: '_Atk2',
  _Def2: '_Def2',
  _Hpx2: '_Hpx2',
  _Spx2: '_Spx2',
  _Agi2: '_Agi2',
  _Int3: '_Int3',
  _Atk3: '_Atk3',
  _Def3: '_Def3',
  _Hpx3: '_Hpx3',
  _Spx3: '_Spx3',
  _Agi3: '_Agi3',
  _Mu: '_Mu',
  _Ao: '_Ao',
  _vukhi: '_vukhi',
  _tay: '_tay',
  _chan: '_chan',
  _dacthu: '_dacthu',
  _Mu_Doben: '_Mu_Doben',
  _Ao_Doben: '_Ao_Doben',
  _vukhi_Doben: '_vukhi_Doben',
  _tay_Doben: '_tay_Doben',
  _chan_Doben: '_chan_Doben',
  _dacthu_Doben: '_dacthu_Doben',
  _Proto: '_Proto'
} as const;

export interface CharEquip {
  _Id: number;
  _Name: string;
  _Doben: number;
  loai: number;
  type: number;
}

export interface PetEquip {
  _Id: number;
  _Name: string;
  _Doben: number;
  loai: number;
  type: number;
}

export const TypeEquip = {
  _Id: 'Id',
  _Name: 'Name',
  _Doben: 'Doben'
} as const;

export interface PartyInfo {
  leaderId: number; // ID of party leader (0 if not in party)
  member1Id: number; // ID of first configured member
  member2Id: number; // ID of second configured member
  member3Id: number; // ID of third configured member
  member4Id: number; // ID of fourth configured member
  currentPartyId: number;
  currentMember1: number; // Currently joined member 1 (0 if not joined)
  currentMember2: number; // Currently joined member 2
  currentMember3: number; // Currently joined member 3
  currentMember4: number; // Currently joined member 4
  partyFull: boolean; // Whether all configured members have joined
  qsMemberIndex: number;
}

export interface Tuido {
  _Stt: number;
  _Id: number;
  _Name: string;
  _Sl: number;
  _Doben: number;
}

export interface Tuideo {
  _Stt: number;
  _Id: number;
  _Name: string;
  _Sl: number;
  _Doben: number;
}

export interface Luulang {
  _Stt: number;
  _Id: number;
  _Name: string;
  _Sl: number;
  _Doben: number;
}

export const TypeTui = {
  _Stt: 'Stt',
  _Id: 'Id',
  _Name: 'Name',
  _Sl: 'Sl',
  _Doben: 'Doben'
} as const;

export interface AttackSetting {
  _TurnCount: number;
  _Skill1: number;
  _Skill2: number;
  _Skill3: number;
  _Skill4: number;
  _Skill5: number;
  _Skill6: number;
  _Skill7: number;
  _Skill8: number;
  _Skill9: number;
  _Skill10: number;
  _Location1: string;
  _Location2: string;
  _Location3: string;
  _Location4: string;
  _Location5: string;
  _Location6: string;
  _Location7: string;
  _Location8: string;
  _Location9: string;
  _Location10: string;
}

export interface Battleinfo {
  _Id: number;
  _Name: string;
  _Lv: number;
  _Hp: number;
  _HpMax: number;
  _Sp: number;
  _SpMax: number;
  _ThuocTinh: number;
  _Type: number;
  _IdChar: number;
  _Color?: string; // Color from C# converted to string (hex or rgb)
  _Statuses?: number[]; // Array of active skill IDs affecting this entity
}

export const TypeBattleinfo = {
  _Id: 'Id',
  _Name: 'Name',
  _Lv: 'Lv',
  _Hp: 'Hp',
  _HpMax: 'HpMax',
  _Sp: 'Sp',
  _SpMax: 'SpMax',
  _ThuocTinh: 'ThuocTinh',
  _Type: 'Type',
  _IdChar: 'IdChar',
  _Color: 'Color'
} as const;

export interface ItemOnMap {
  _Gold: number;
  _Id: number;
  _Name: string;
  _MapX: number;
  _MapY: number;
}

export const TypeItemOnMap = {
  _Gold: 'Gold',
  _Id: 'Id',
  _Name: 'Name',
  _MapX: 'MapX',
  _MapY: 'MapY'
} as const;

export const TypeNpcInMap = {
  _Id: 'Id',
  _MapX: 'MapX',
  _MapY: 'MapY',
  _Delay: 'Delay',
  _KC: 'KC'
} as const;

export interface InfoText {
  _Text: string;
  _Color: string; // Color from C# converted to string (hex or rgb)
}
