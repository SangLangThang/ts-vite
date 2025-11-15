import { useCallback, useState } from 'react';
import { PlayerConfig } from 'src/types';
import { AccountList } from './components/AccountList';
import { ConfigMenu } from './components/ConfigMenu';
import { ContentTabs } from './components/ContentTabs';

interface AllConfigs {
  [playerId: number]: PlayerConfig;
}

function App(): React.JSX.Element {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [playerConfigs, setPlayerConfigs] = useState<AllConfigs>({});
  const [configVersion, setConfigVersion] = useState(0); // Used to force re-render

  const handleSave = async () => {
    try {
      const result = await window.api.saveConfig(playerConfigs);
      if (result.success) {
        // Configuration saved
      } else {
        // Save cancelled or failed
      }
    } catch (error) {
      // Error saving config
    }
  };

  const handleLoad = async () => {
    try {
      const result = await window.api.loadConfig();
      if (result.success) {
        setPlayerConfigs(result.config as AllConfigs);
        setConfigVersion((prev) => prev + 1); // Force re-render
      } else {
        // Load cancelled or failed
      }
    } catch (error) {
      // Error loading config
    }
  };

  const updatePlayerConfig = useCallback((playerId: number, config: Partial<PlayerConfig>) => {
    setPlayerConfigs((prev) => {
      const updated = {
        ...prev,
        [playerId]: {
          ...prev[playerId],
          ...config
        }
      };
      return updated;
    });
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Config Menu */}
      <ConfigMenu onSave={handleSave} onLoad={handleLoad} />

      {/* Account List */}
      <AccountList selectedPlayerId={selectedPlayerId} onSelectPlayer={setSelectedPlayerId} />

      {/* Content Tabs - takes remaining height */}
      <div className="flex-1 overflow-hidden">
        <ContentTabs
          key={configVersion} // Force remount when config is loaded
          selectedPlayerId={selectedPlayerId}
          playerConfigs={playerConfigs}
          onUpdateConfig={updatePlayerConfig}
        />
      </div>
    </div>
  );
}

export default App;
