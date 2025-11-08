import { useState } from 'react'
import { BasicComponent } from './BasicComponent'
import { CombatComponent } from './CombatComponent'
import { MissionComponent } from './MissionComponent'
import { BagComponent } from './BagComponent'
import { DebugComponent } from './DebugComponent'
import { PlayerConfig } from 'src/types'



interface ContentTabsProps {
  selectedPlayerId: number | null;
  playerConfigs: { [playerId: number]: PlayerConfig };
  onUpdateConfig: (playerId: number, config: Partial<PlayerConfig>) => void;
}

export function ContentTabs({ selectedPlayerId, playerConfigs, onUpdateConfig }: ContentTabsProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = ['Cơ bản', 'Thùng đồ', 'Chiến đấu', 'Nhiệm vụ', 'Debug']

  const playerConfig = selectedPlayerId ? playerConfigs[selectedPlayerId] : undefined

  const renderTabContent = (): React.JSX.Element | null => {
    switch (activeTab) {
      case 0:
        return <BasicComponent
          selectedPlayerId={selectedPlayerId}
          initialBattleConfig={playerConfig?.battleSkillConfig}
          initialPartyConfig={playerConfig?.partyConfig}
          onBattleConfigChange={(battleConfig) => {
            if (selectedPlayerId) {
              onUpdateConfig(selectedPlayerId, {
                battleSkillConfig: battleConfig,
                partyConfig: playerConfig?.partyConfig || {
                  member1Id: 0,
                  member2Id: 0,
                  member3Id: 0,
                  member4Id: 0,
                  qsMemberIndex: 1,
                  leaderId: 0
                }
              })
            }
          }}
          onPartyConfigChange={(partyConfig) => {
            console.log('ContentTabs - onPartyConfigChange called with:', partyConfig);
            if (selectedPlayerId) {
              const fullConfig = {
                battleSkillConfig: playerConfig?.battleSkillConfig || {
                  changeGemChar: false,
                  hoisinhChar: false,
                  autoAttack: false,
                  skillNormalChar: 99999,
                  skillSoloChar: 99999,
                  skillSpecialChar: 99999,
                  skillCCChar: 99999,
                  skillBuffChar: 99999,
                  skillClearChar: 99999,
                  changeGemPet: false,
                  hoisinhPet: false,
                  skillNormalPet: 99999,
                  skillSoloPet: 99999,
                  skillSpecialPet: 99999,
                  skillCCPet: 99999,
                  skillBuffPet: 99999,
                  skillClearPet: 99999
                },
                partyConfig: partyConfig
              };
              console.log('ContentTabs - calling onUpdateConfig with playerId:', selectedPlayerId, 'config:', fullConfig);
              onUpdateConfig(selectedPlayerId, fullConfig);
            }
          }}
        />
      case 1:
        return <BagComponent selectedPlayerId={selectedPlayerId} />
      case 2:
        return <CombatComponent selectedPlayerId={selectedPlayerId} />
      case 3:
        return <MissionComponent />
      case 4:
        return <DebugComponent />
      default:
        return null
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Horizontal scrollable tabs */}
      <div className="border-b border-gray-200 bg-gray-50 shadow-sm">
        <div className="flex gap-1 px-2 py-2 overflow-x-auto scrollbar-thin">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === index
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4 h-full">{renderTabContent()}</div>
    </div>
  )
}
