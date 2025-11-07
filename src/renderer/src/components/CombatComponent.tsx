import { useEffect, useState } from 'react';
import { Battleinfo, Player } from '../types';

interface CombatComponentProps {
  selectedPlayer: Player | null;
}

export function CombatComponent({ selectedPlayer }: CombatComponentProps): React.JSX.Element {
  const [battleInfo, setBattleInfo] = useState<(Battleinfo | null)[]>([]);
  const [turn, setTurn] = useState<number>(0);

  useEffect(() => {
    if (!selectedPlayer) {
      setBattleInfo([]);
      setTurn(0);
      return;
    }

    // Request battle info when player changes
    window.api.requestPlayerBattle(selectedPlayer._Id);

    // Listen for battle updates
    const handler = window.api.onPlayerBattleUpdate(
      (data: { id: number; battleInfo: (Battleinfo | null)[]; turn: number; battle: number }) => {
        if (data.id === selectedPlayer._Id) {
          setBattleInfo(data.battleInfo || []);
          setTurn(data.turn || 0);
        }
      }
    );

    return () => {
      window.api.removePlayerBattleUpdateListener(handler);
    };
  }, [selectedPlayer]);

  // Create 4 rows with 5 columns each
  // Position layout:
  // Row 1: 5-4-3-2-1 (positions 4,3,2,1,0)
  // Row 2: 10-9-8-7-6 (positions 9,8,7,6,5)
  // Row 3: 15-14-13-12-11 (positions 14,13,12,11,10)
  // Row 4: 20-19-18-17-16 (positions 19,18,17,16,15)
  const rows = [
    [4, 3, 2, 1, 0],
    [9, 8, 7, 6, 5],
    [14, 13, 12, 11, 10],
    [19, 18, 17, 16, 15]
  ];

  const getBattleEntity = (position: number): Battleinfo | null => {
    return battleInfo[position] || null;
  };

  const getHpPercentage = (entity: Battleinfo | null): number => {
    if (!entity || entity._HpMax === 0) return 0;
    return Math.max(0, Math.min(100, (entity._Hp / entity._HpMax) * 100));
  };

  const getSpPercentage = (entity: Battleinfo | null): number => {
    if (!entity || entity._SpMax === 0) return 0;
    return Math.max(0, Math.min(100, (entity._Sp / entity._SpMax) * 100));
  };

  const getEntityTypeColor = (type: number): string => {
    switch (type) {
      case 2:
      case 9:
        return 'bg-blue-100 border-blue-300'; // Player
      default:
        return 'bg-red-100 border-red-300'; // NPC/Monster
    }
  };

  const getElementColor = (element: number): string => {
    switch (element) {
      case 1:
        return 'text-red-600'; // Fire
      case 2:
        return 'text-blue-600'; // Water
      case 3:
        return 'text-yellow-600'; // Light
      case 4:
        return 'text-purple-600'; // Dark
      case 5:
        return 'text-green-600'; // Wood
      default:
        return 'text-gray-600';
    }
  };

  // Skill ID categories (matching main process)
  const LIST_HARD_CC = [
    13018, 10033, 10004, 11014, 14008, 14021, 20014, 20025, 20026, 20027, 13002
  ];
  const LIST_SOFT_CC = [10019];
  const LIST_DEF = [10031, 10010, 13021, 14013];
  const LIST_BUFF = [12025];

  const getStatusIcon = (
    skillId: number
  ): { imagePath: string; color: string; title: string; category: string } | null => {
    if (LIST_HARD_CC.includes(skillId)) {
      return {
        imagePath: `/skills/icon_sk${skillId}.webp`,
        color: 'border-red-500',
        title: `Hard CC - Skill ${skillId}`,
        category: 'hard_cc'
      };
    }
    if (LIST_SOFT_CC.includes(skillId)) {
      return {
        imagePath: `/skills/icon_sk${skillId}.webp`,
        color: 'border-orange-500',
        title: `Soft CC - Skill ${skillId}`,
        category: 'soft_cc'
      };
    }
    if (LIST_DEF.includes(skillId)) {
      return {
        imagePath: `/skills/icon_sk${skillId}.webp`,
        color: 'border-blue-500',
        title: `Defense - Skill ${skillId}`,
        category: 'def'
      };
    }
    if (LIST_BUFF.includes(skillId)) {
      return {
        imagePath: `/skills/icon_sk${skillId}.webp`,
        color: 'border-green-500',
        title: `Buff - Skill ${skillId}`,
        category: 'buff'
      };
    }
    return null;
  };

  // Check if there's any battle data
  const hasBattleData = battleInfo.some((entity) => entity !== null && entity !== undefined);

  if (!selectedPlayer) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a player to view battle info
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 relative">
      {/* Turn counter */}
      {turn > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shrink-0">
          <span className="text-sm font-semibold text-blue-700">Turn: {turn}</span>
        </div>
      )}

      {/* Battle grid - always show when player is selected */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 flex-1 min-h-0">
            {row.map((position) => {
              const entity = getBattleEntity(position);
              const hpPercent = getHpPercentage(entity);
              const spPercent = getSpPercentage(entity);

              return (
                <div
                  key={position}
                  className={`flex-1 border-2 rounded-lg p-2 transition-all min-w-0 ${
                    entity ? getEntityTypeColor(entity._Type) : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {entity ? (
                    <div className="h-full flex flex-col gap-1 text-xs overflow-hidden">
                      {/* Position and Name */}
                      <div className="flex justify-between items-start shrink-0">
                        <span className="font-bold text-gray-500">#{position + 1}</span>
                        <span className={`font-semibold ${getElementColor(entity._ThuocTinh)}`}>
                          Lv.{entity._Lv}
                        </span>
                      </div>

                      {/* Name */}
                      <div className="font-medium text-gray-800 truncate shrink-0" title={entity._Name}>
                        {entity._Name}
                      </div>

                      {/* Status Icons */}
                      {entity._Statuses && entity._Statuses.length > 0 && (
                        <div className="flex gap-0.5 shrink-0 flex-wrap">
                          {entity._Statuses.map((skillId, idx) => {
                            const statusInfo = getStatusIcon(skillId);
                            if (!statusInfo) return null;
                            return (
                              <div
                                key={idx}
                                className={`w-5 h-5 border-2 ${statusInfo.color} rounded bg-gray-800 bg-opacity-80 flex items-center justify-center overflow-hidden`}
                                title={statusInfo.title}
                              >
                                <img
                                  src={statusInfo.imagePath}
                                  alt={statusInfo.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* HP Bar */}
                      <div className="space-y-0.5 shrink-0">
                        <div className="flex justify-between text-xs">
                          <span className="text-red-600 font-semibold">HP</span>
                          <span className="text-gray-600">{entity._Hp}/{entity._HpMax}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* SP Bar */}
                      <div className="space-y-0.5 shrink-0">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600 font-semibold">SP</span>
                          <span className="text-gray-600">{entity._Sp}/{entity._SpMax}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${spPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                      <span>#{position + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* No battle message - shown over the grid */}
      {!hasBattleData && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 text-gray-400 pointer-events-none">
          No battle in progress
        </div>
      )}
    </div>
  );
}
