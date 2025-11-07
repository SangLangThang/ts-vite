import { useState } from 'react'
import { Player } from '../types'
import { BasicComponent } from './BasicComponent'
import { CombatComponent } from './CombatComponent'
import { MissionComponent } from './MissionComponent'
import { BagComponent } from './BagComponent'

interface PlayerConfig {
  partyConfig?: any;
  battleSkillConfig?: any;
}

interface ContentTabsProps {
  selectedPlayer: Player | null;
  playerConfigs: { [playerId: number]: PlayerConfig };
  onUpdateConfig: (playerId: number, config: Partial<PlayerConfig>) => void;
}

export function ContentTabs({ selectedPlayer, playerConfigs, onUpdateConfig }: ContentTabsProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = ['Cơ bản', 'Thùng đồ', 'Chiến đấu', 'Nhiệm vụ']

  const playerConfig = selectedPlayer ? playerConfigs[selectedPlayer._Id] : undefined

  const renderTabContent = (): React.JSX.Element | null => {
    switch (activeTab) {
      case 0:
        return <BasicComponent
          selectedPlayer={selectedPlayer}
          initialConfig={playerConfig}
          onConfigChange={(config) => {
            if (selectedPlayer) {
              onUpdateConfig(selectedPlayer._Id, config)
            }
          }}
        />
      case 1:
        return <BagComponent selectedPlayer={selectedPlayer} />
      case 2:
        return <CombatComponent selectedPlayer={selectedPlayer} />
      case 3:
        return <MissionComponent />
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
