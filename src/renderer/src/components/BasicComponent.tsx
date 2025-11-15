import { useEffect, useState } from 'react';
import { BattleSkills } from './BattleSkills';
import { EquipmentSlot } from './EquipmentSlot';
import { PartyZone } from './PartyZone';
import { BattleSkillConfig, CharEquip, PartyConfig, PartyInfo, Pet } from 'src/types';

interface BasicComponentProps {
  selectedPlayerId: number | null;
  onBattleConfigChange: (config: BattleSkillConfig) => void;
  onPartyConfigChange: (config: PartyConfig) => void;
  initialBattleConfig?: BattleSkillConfig;
  initialPartyConfig?: PartyConfig;
}

export function BasicComponent({
  selectedPlayerId,
  onBattleConfigChange,
  onPartyConfigChange,
  initialBattleConfig,
  initialPartyConfig
}: BasicComponentProps): React.JSX.Element {
  const [charEquipment, setCharEquipment] = useState<CharEquip[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetIndex, setSelectedPetIndex] = useState<number>(0);

  useEffect(() => {
    // Reset when player changes
    setCharEquipment([]);
    setPets([]);
    setSelectedPetIndex(0);

    if (!selectedPlayerId) return;

    // Listen for equipment/pet updates
    const handleEquipmentUpdate = (data: { id: number; charEquip?: CharEquip[]; pets?: Pet[] }) => {
      if (selectedPlayerId && data.id === selectedPlayerId) {
        if (data.charEquip) {
          setCharEquipment(data.charEquip);
        }
        if (data.pets) {
          setPets(data.pets);
        }
      }
    };

    // Listen for party updates from backend (when packets arrive)
    const handlePartyUpdate = (data: { id: number; party: PartyInfo }) => {
    };

    // Listen for pet battle updates - auto-select the battling pet
    const handlePetBattleUpdate = (data: { id: number; petBattle: number }) => {
      if (selectedPlayerId && data.id === selectedPlayerId) {
        if (data.petBattle > 0) {
          // petBattle is 1-based (1-4), convert to 0-based index (0-3)
          setSelectedPetIndex(data.petBattle - 1);
        }
      }
    };

    const equipHandler = window.api.onPlayerEquipmentUpdate?.(handleEquipmentUpdate);
    const partyHandler = window.api.onPlayerPartyUpdate?.(handlePartyUpdate);
    const petBattleHandler = window.api.onPlayerPetBattleUpdate?.(handlePetBattleUpdate);

    // Request current equipment and party data
    window.api.requestPlayerEquipment?.(selectedPlayerId);
    window.api.requestPlayerParty?.(selectedPlayerId);

    return () => {
      if (equipHandler) {
        window.api.removePlayerEquipmentUpdateListener?.(equipHandler);
      }
      if (partyHandler) {
        window.api.removePlayerPartyUpdateListener?.(partyHandler);
      }
      if (petBattleHandler) {
        window.api.removePlayerPetBattleUpdateListener?.(petBattleHandler);
      }
    };
  }, [selectedPlayerId]);

  if (!selectedPlayerId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">No player selected</p>
      </div>
    );
  }

  // Character equipment slots mapped by loai value (ITEM_EQUIP_TYPE)
  // Character uses NT_* (Nhân Vật) types: 7=Mũ, 8=Áo, 9=Vũ Khí, 10=Tay, 11=Chân, 6=Đặc Thù
  const charSlotConfig = [
    { loai: 1, name: 'Mũ' }, // NT_MU
    { loai: 2, name: 'Áo' }, // NT_AO
    { loai: 3, name: 'Vũ Khí' }, // NT_VK
    { loai: 4, name: 'Tay' }, // NT_TAY
    { loai: 5, name: 'Chân' }, // NT_CHAN
    { loai: 6, name: 'Đặc Thù', type: 14 } // DT (or type 14)
  ];

  // Pet equipment slots: Mũ (0), Áo (1), Vũ Khí (2), Tay (3), Chân (4), Đặc Thù (5)
  const petSlotNames = ['Mũ', 'Áo', 'Vũ Khí', 'Tay', 'Chân', 'Đặc Thù'];

  const selectedPet = pets[selectedPetIndex];

  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-2 gap-1 p-1">
        {/* Column 1: Character Equipment */}
        <div
          style={{ width: '350px', minWidth: '350px' }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="border-b border-gray-200 bg-blue-50 px-4">
            <h3 className="text-base font-semibold text-gray-800">Trang bị nhân vật</h3>
          </div>
          <div className="p-4 px-2">
            <div className="flex justify-center gap-4 flex-wrap">
              {charSlotConfig.map((slot, index) => {
                // Find equipment by matching loai value (or type=14 for special equipment)
                const equipment = charEquipment.find((item) => {
                  if (slot.type === 14) {
                    // Special case: match by type=14 OR loai=6
                    return item.type === 14 || item.loai === 6;
                  }
                  return item.loai === slot.loai;
                });
                return (
                  <div key={index}>
                    <EquipmentSlot
                      itemId={equipment?._Id || 0}
                      slotName={slot.name}
                      doben={equipment?._Doben}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Pet List & Equipment */}
        <div
          style={{ width: '350px', minWidth: '350px' }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-1">
            {/* Pet List */}
            {pets.length > 0 ? (
              <>
                <div className="mb-1">
                  <select
                    value={selectedPetIndex}
                    onChange={(e) => setSelectedPetIndex(parseInt(e.target.value))}
                    className="text-black w-full px-3 pt-0 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {pets.map((pet, index) => (
                      <option key={index} value={index} className="text-black">
                        {pet._Name || `Pet ${pet._Id}`} - Lv.{pet._Lv}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pet Equipment */}
                {selectedPet && (
                  <div className="flex justify-center gap-3 flex-wrap pt-3">
                    {petSlotNames.map((slotName, index) => {
                      let itemId = 0;
                      let doben = 0;

                      switch (index) {
                        case 0:
                          itemId = selectedPet._Mu;
                          doben = selectedPet._Mu_Doben;
                          break;
                        case 1:
                          itemId = selectedPet._Ao;
                          doben = selectedPet._Ao_Doben;
                          break;
                        case 2:
                          itemId = selectedPet._vukhi;
                          doben = selectedPet._vukhi_Doben;
                          break;
                        case 3:
                          itemId = selectedPet._tay;
                          doben = selectedPet._tay_Doben;
                          break;
                        case 4:
                          itemId = selectedPet._chan;
                          doben = selectedPet._chan_Doben;
                          break;
                        case 5:
                          itemId = selectedPet._dacthu;
                          doben = selectedPet._dacthu_Doben;
                          break;
                      }

                      return (
                        <div key={`pet-slot-${index}`}>
                          <EquipmentSlot itemId={itemId} slotName={slotName} doben={doben} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">Không có thú cưng</div>
            )}
          </div>
        </div>
      </div>

      <PartyZone
        selectedPlayerId={selectedPlayerId}
        initialConfig={initialPartyConfig}
        onConfigChange={onPartyConfigChange}
      />

      <BattleSkills
        initialConfig={initialBattleConfig}
        onConfigChange={onBattleConfigChange}
      />
    </div>
  );
}
