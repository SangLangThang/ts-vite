import { useEffect, useState } from 'react';
import { PartyConfig, PartyInfo } from 'src/types';

interface PartyStatus {
  currentPartyId: number;
  currentMember1: number;
  currentMember2: number;
  currentMember3: number;
  currentMember4: number;
}

interface PartyZoneProps {
  selectedPlayerId: number;
  initialConfig?: PartyConfig;
  onConfigChange: (config: PartyConfig) => void;
}

export function PartyZone({ selectedPlayerId, initialConfig, onConfigChange }: PartyZoneProps) {
  const [partyConfig, setPartyConfig] = useState<PartyConfig>(
    initialConfig || {
      member1Id: 0,
      member2Id: 0,
      member3Id: 0,
      member4Id: 0,
      qsMemberIndex: 1, // 1-4: which member is QS
      leaderId: 0 // Id của chủ PT để tham gia
    }
  );

  // Party status from backend - received via packets
  const [partyStatus, setPartyStatus] = useState({
    currentPartyId: 0, // ID của party đang tham gia
    currentMember1: 0,
    currentMember2: 0,
    currentMember3: 0,
    currentMember4: 0
  });

  // Sync with initial config - only on mount or when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      console.log('PartyZone - syncing with initialConfig:', initialConfig);
      setPartyConfig(initialConfig);
    }
  }, [initialConfig]);

  useEffect(() => {
    if (!selectedPlayerId) return;

    const handlePartyUpdate = (data: { id: number; party: PartyInfo }) => {
      console.log('handlePartyUpdate', data);
      const party = data.party;

      // Only update partyStatus (current state from backend)
      // Don't overwrite partyConfig (user's desired configuration)
      setPartyStatus({
        currentPartyId: party.currentPartyId,
        currentMember1: party.currentMember1,
        currentMember2: party.currentMember2,
        currentMember3: party.currentMember3,
        currentMember4: party.currentMember4
      });

      // Only sync config from backend if we don't have an initial config
      // This allows backend to populate initial values, but won't overwrite user changes
      if (!initialConfig) {
        setPartyConfig({
          member1Id: party.member1Id,
          member2Id: party.member2Id,
          member3Id: party.member3Id,
          member4Id: party.member4Id,
          qsMemberIndex: party.qsMemberIndex,
          leaderId: party.leaderId
        });
      }
    };

    const partyHandler = window.api.onPlayerPartyUpdate?.(handlePartyUpdate);

    window.api.requestPlayerParty?.(selectedPlayerId);

    return () => {
      if (partyHandler) {
        window.api.removePlayerPartyUpdateListener?.(partyHandler);
      }
    };
  }, [selectedPlayerId, initialConfig]);

  const handleMemberIdChange = (memberNum: number, value: string) => {
    const newConfig = {
      ...partyConfig,
      [`member${memberNum}Id`]: parseInt(value) || 0
    };
    console.log('PartyZone - handleMemberIdChange, calling onConfigChange with:', newConfig);
    setPartyConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleQsChange = (memberNum: number) => {
    const newConfig = {
      ...partyConfig,
      qsMemberIndex: memberNum
    };
    console.log('PartyZone - handleQsChange, calling onConfigChange with:', newConfig);
    setPartyConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleLeaderIdChange = (value: string) => {
    const newConfig = {
      ...partyConfig,
      leaderId: parseInt(value) || 0
    };
    console.log('PartyZone - handleLeaderIdChange, calling onConfigChange with:', newConfig);
    setPartyConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleInviteMembers = () => {
    console.log('PartyZone - handleInviteMembers called');
    // Send invite request to main process
    window.api.invitePartyMembers?.(selectedPlayerId, partyConfig);
  };

  return (
    <div className="px-1 py-3">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-start gap-6">
          {/* Mời Button */}
          <button
            onClick={handleInviteMembers}
            className="px-3 py-0.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Mời
          </button>

          {/* 4 Member Inputs with Radio - User can input IDs */}
          {[1, 2, 3, 4].map((num) => {
            const memberIdValue = partyConfig[`member${num}Id`];
            const currentMemberId = partyStatus[`currentMember${num}`];

            // Check if this member has joined the party (compare with backend status)
            const configuredId = typeof memberIdValue === 'number' ? memberIdValue : 0;
            const isJoined = currentMemberId !== 0 && currentMemberId === configuredId;

            return (
              <div key={num} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="qsMember"
                  className="w-3 h-3 cursor-pointer"
                  title={`Chọn thành viên ${num} làm Quân Sư`}
                  checked={partyConfig.qsMemberIndex === num}
                  onChange={() => handleQsChange(num)}
                />
                <input
                  type="text"
                  placeholder={`TV ${num}`}
                  value={memberIdValue || ''}
                  onChange={(e) => handleMemberIdChange(num, e.target.value)}
                  className={`w-16 px-1 py-0.5 text-center border rounded text-black ${
                    isJoined ? 'bg-green-100 border-green-400' : 'border-gray-300 bg-white'
                  }`}
                />
              </div>
            );
          })}

          {/* Id Chủ PT Input - for joining party */}
          <div className="flex items-center gap-1 ml-2">
            <span className="text-gray-600">Id Chủ PT:</span>
            <input
              type="text"
              placeholder="ID"
              value={partyConfig.leaderId || ''}
              onChange={(e) => handleLeaderIdChange(e.target.value)}
              className={`w-16 px-1 py-0.5 text-center border rounded text-black ${
                partyConfig.leaderId === partyStatus.currentPartyId && partyConfig.leaderId !== 0
                  ? 'bg-green-100 border-green-400'
                  : 'border-gray-300 bg-white'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
