import { useState, useEffect } from 'react';
import { HaitacConfig } from '../../../types';

interface MissionComponentProps {
  selectedPlayerId: number | null;
  haitacConfig?: HaitacConfig;
  onConfigChange: (playerId: number, config: Partial<{ haitacConfig: HaitacConfig }>) => void;
}

export function MissionComponent({ selectedPlayerId, haitacConfig, onConfigChange }: MissionComponentProps): React.JSX.Element {
  // Tab state for child tabs
  const [activeChildTab, setActiveChildTab] = useState(0);
  const childTabs = ['Hải Tặc', 'Quest'];
  // State for rotating member IDs (1,2,3,4,5)
  const [rotatingIds, setRotatingIds] = useState('');

  // State for fixed team: leader,member1,member2,member3
  const [fixedTeam, setFixedTeam] = useState('');

  // State to store the list of rotating member IDs
  const [rotatingIdList, setRotatingIdList] = useState<number[]>([]);

  // State to track current rotating member index
  const [currentRotatingIndex, setCurrentRotatingIndex] = useState(0);

  // Load config when it changes
  useEffect(() => {
    if (haitacConfig) {
      setFixedTeam(haitacConfig.fixedTeam || '');
      setRotatingIds(haitacConfig.rotatingIds || '');
    }
  }, [haitacConfig]);

  // Save config when fixedTeam or rotatingIds change
  useEffect(() => {
    if (selectedPlayerId && (fixedTeam || rotatingIds)) {
      onConfigChange(selectedPlayerId, {
        haitacConfig: {
          fixedTeam,
          rotatingIds
        }
      });
    }
  }, [fixedTeam, rotatingIds, selectedPlayerId, onConfigChange]);

  // Handler for "Start Kéo Hải Tặc" - 3 members send party invite to leader
  const handleStartPullPirate = () => {
    if (!fixedTeam.trim()) {
      return;
    }

    const teamIds = fixedTeam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (teamIds.length !== 4) {
      return;
    }

    const [leaderId, member1Id, member2Id, member3Id] = teamIds;

    // Send party invites from 3 members to leader
    window.api.invitePartyMembers(leaderId, {
      member1Id,
      member2Id,
      member3Id
    });
  };

  // Handler for "Start Hải Tặc" - Store rotating IDs and invite first one
  const handleStartPirate = () => {
    if (!rotatingIds.trim()) {
      return;
    }

    if (!fixedTeam.trim()) {
      return;
    }

    // Parse rotating IDs
    const ids = rotatingIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (ids.length === 0) {
      return;
    }

    // Parse fixed team
    const teamIds = fixedTeam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (teamIds.length !== 4) {
      return;
    }

    const leaderId = teamIds[0];

    // Store rotating ID list
    setRotatingIdList(ids);
    setCurrentRotatingIndex(0);

    // Send invite from first rotating member to leader
    window.api.invitePartyMembers(leaderId, {
      rotatingMemberId: ids[0]
    });
  };

  // Quest tab state
  const [warpId, setWarpId] = useState('');

  const handleWarp = () => {
    if (!selectedPlayerId) {
      return;
    }

    const id = parseInt(warpId.trim());
    if (isNaN(id) || id <= 0) {
      return;
    }

    window.api.autoQuest(selectedPlayerId, id);
  };

  const renderHaiTacTab = () => (
    <div className="space-y-6">
      {/* Hải Tặc Event Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Hải Tặc Event</h2>

        <div className="space-y-4">
          {/* Rotating Member IDs Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rotating Member IDs (comma-separated)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rotatingIds}
                onChange={(e) => setRotatingIds(e.target.value)}
                placeholder="e.g., 1,2,3,4,5"
                className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleStartPirate}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium whitespace-nowrap"
              >
                Start Hải Tặc
              </button>
            </div>
          </div>

          {/* Fixed Team Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fixed Team (leader,member1,member2,member3)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={fixedTeam}
                onChange={(e) => setFixedTeam(e.target.value)}
                placeholder="e.g., lead,1,2,3"
                className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleStartPullPirate}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium whitespace-nowrap"
              >
                Start Kéo Hải Tặc
              </button>
            </div>
          </div>

          {/* Status Display */}
          {rotatingIdList.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Status</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>Rotating Members: {rotatingIdList.join(', ')}</p>
                <p>Current Rotating Member: {rotatingIdList[currentRotatingIndex]}</p>
                <p>Fixed Team: {fixedTeam}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">How it works</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>
            <strong>Start Kéo Hải Tặc:</strong> 3 fixed members send party invites to the leader
          </li>
          <li>
            <strong>Start Hải Tặc:</strong> First rotating member sends invite to party leader
          </li>
          <li>
            • Team structure: 4 fixed members + 1 rotating member
          </li>
          <li>
            • When party reaches 4 members, autoCatchHaiTac() will run automatically
          </li>
        </ul>
      </div>
    </div>
  );

  const renderQuestTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quest</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Warp
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={warpId}
                onChange={(e) => setWarpId(e.target.value)}
                placeholder="Enter warp ID (number)"
                className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <button
                onClick={handleWarp}
                disabled={!selectedPlayerId || !warpId.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Warp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-auto p-4">
      <div className="max-w-4xl mx-auto">
        {/* Child Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-8" aria-label="Tabs">
            {childTabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveChildTab(index)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeChildTab === index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeChildTab === 0 && renderHaiTacTab()}
          {activeChildTab === 1 && renderQuestTab()}
        </div>
      </div>
    </div>
  );
}
