import { useEffect, useState } from 'react';
import { Player } from 'src/types';

interface AccountListProps {
  selectedPlayer: Player | null;
  onSelectPlayer: (player: Player) => void;
}

export function AccountList({
  selectedPlayer,
  onSelectPlayer
}: AccountListProps): React.JSX.Element {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Listen for player list updates
    window.api.onPlayerListUpdate((data: { listPlayer: Player[] }) => {
      setPlayers(data.listPlayer);

      // Auto-select first player if no player is selected - use setTimeout to avoid setState during render
      if (data.listPlayer.length > 0 && !selectedPlayer) {
        setTimeout(() => {
          onSelectPlayer(data.listPlayer[0]);
        }, 0);
      }
    });

    // Listen for individual player login
    window.api.onPlayerLogin((data: { player: Player }) => {
      setPlayers((prev) => {
        const index = prev.findIndex((p) => p._Id === data.player._Id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = data.player;
          return updated;
        }
        return prev;
      });

      // Update selected player if it's the one that was updated - use setTimeout to avoid setState during render
      if (selectedPlayer && selectedPlayer._Id === data.player._Id) {
        setTimeout(() => {
          onSelectPlayer(data.player);
        }, 0);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      window.api.removePlayerListUpdateListener?.();
      window.api.removePlayerLoginListener?.();
    };
  }, [selectedPlayer, onSelectPlayer]);

  const getStatus = (player: Player): string => {
    if (player._PlayerOnline === 1) {
      return player._MapName ? `Map: ${player._MapName}` : 'Online';
    }
    return 'Connecting...';
  };

  const getStatusColor = (player: Player): string => {
    if (player._PlayerOnline === 1) {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="h-[150px] w-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Account list - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {players.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No players connected
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {players.map((player) => (
              <div
                key={player._Id}
                onClick={() => onSelectPlayer(player)}
                className={`flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors cursor-pointer ${
                  selectedPlayer?._Id === player._Id ? 'bg-blue-100' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {player._Name || `Player ${player._Id}`}
                  </div>
                  {player._Lv > 0 && (
                    <div className="text-xs text-gray-500">Level {player._Lv}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(player)}`}
                  >
                    {getStatus(player)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
