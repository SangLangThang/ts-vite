import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { createProxy, TcpProxy, UpstreamContext } from 'node-tcp-proxy';
import { join } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import icon from '../../resources/icon.png?asset';
import API from '../helpers/API';
import { updateClient, setRendererSend, getClient } from '../store/clients';
import { onReceivePacket, remotePorts, autoWarp } from './packetHandlers';
import { setMainWindow, rendererSend } from './renderer';

let proxyLocal: TcpProxy | null = null;

const PROXY_INFO = {
  host: '43.229.151.172',
  portIn: 6414,
  hostFake: '127.0.0.200'
};

function createProxyLocal(): void {
  if (proxyLocal) {
    proxyLocal.end();
    proxyLocal = null;
  }

  proxyLocal = createProxy(
    6414,
    PROXY_INFO.host,
    6417,

    {
      hostname: PROXY_INFO.hostFake,
      upstream: function (context, data) {
        //console.log('upstream', data.toString('hex'));
        if (API.compareString(data, 8, 10, 'ac')) {
          const id = API.findIDCharFromData(data);
          updateClient(id, context);

          // Update remotePorts array
          const currentIndex = remotePorts.findIndex((e) => e[0] == id);
          if (currentIndex == -1) {
            remotePorts.push([id, (context as any).proxySocket?.remotePort || null]);
          } else {
            remotePorts[currentIndex][1] = (context as any).proxySocket?.remotePort || null;
          }
        }
        return API.actionSend(data);
      },
      downstream: function (context, data) {
        try {
          onReceivePacket(data, (context as any).proxySocket.remotePort);
        } catch {}
        return data;
      },
      serviceHostSelected: function (proxySocket, i) {
        return i;
      }
    }
  );
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  // Set main window for renderer communication
  setMainWindow(mainWindow);

  // Set renderer send function in the clients store
  setRendererSend(rendererSend);

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Handle bag data request
  ipcMain.on('player:request-bag', (_event, playerId: number) => {
    const client = getClient(playerId);
    if (client) {
      rendererSend('player:bag-update', {
        id: playerId,
        tuido: client.tuido,
        tuideo: client.tuideo,
        luulang: client.luulang
      });
    }
  });

  // Handle equipment data request
  ipcMain.on('player:request-equipment', (_event, playerId: number) => {
    const client = getClient(playerId);
    if (client) {
      rendererSend('player:equipment-update', {
        id: playerId,
        charEquip: client.charEquip,
        pets: client.pets
      });
    }
  });

  // Handle battle data request
  ipcMain.on('player:request-battle', (_event, playerId: number) => {
    const client = getClient(playerId);
    if (client) {
      rendererSend('player:battle-update', {
        id: playerId,
        battleInfo: client.battleInfo,
        turn: client.turn,
        battle: client.battle
      });
    }
  });

  // Handle party data request
  ipcMain.on('player:request-party', (_event, playerId: number) => {
    const client = getClient(playerId);
    if (client) {
      rendererSend('player:party-update', {
        id: playerId,
        party: client.party
      });
    }
  });

  // Handle party data update
  ipcMain.on('player:update-party', (_event, data: { playerId: number; party: any }) => {
    const client = getClient(data.playerId);
    if (client) {
      client.party = { ...client.party, ...data.party };
      // Send updated party back to renderer
      rendererSend('player:party-update', {
        id: data.playerId,
        party: client.party
      });
    }
  });

  // Handle party invite
  ipcMain.on('party:invite-members', (_event, data: { playerId: number; partyConfig: any }) => {
    const { member1Id, member2Id, member3Id, member4Id, rotatingMemberId } = data.partyConfig;

    // Scenario 1: Rotating member invites to leader (Start Hải Tặc)
    if (rotatingMemberId !== undefined) {
      const leaderClient = getClient(data.playerId);

      if (!leaderClient || !leaderClient.socket.context) {
        return;
      }

      // This is the initial call - rotatingMemberId contains the full array of rotating IDs
      // Parse it as comma-separated string or array
      const rotatingIds = typeof rotatingMemberId === 'string'
        ? rotatingMemberId.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id) && id > 0)
        : Array.isArray(rotatingMemberId) ? rotatingMemberId : [rotatingMemberId];

      if (rotatingIds.length === 0) {
        return;
      }

      // Store rotating members list and set current index to 0
      leaderClient.party.rotatingMembers = rotatingIds;
      leaderClient.party.currentRotatingIndex = 0;
      leaderClient.currentEvent = 'haitac';

      // Find first available rotating member (skip if not found, continue to next)
      let foundFirstMember = false;
      for (let i = 0; i < rotatingIds.length; i++) {
        const rotatingId = rotatingIds[i];
        const rotatingClient = getClient(rotatingId);

        if (rotatingClient && rotatingClient.socket.context) {
          // Found valid rotating member, set index and send invite
          leaderClient.party.currentRotatingIndex = i;
          const packet = API.joinToParty(data.playerId);
          sendPacketWithDelay(rotatingClient.socket.context, packet, 0);
          foundFirstMember = true;
          break;
        }
      }

      // If no rotating members found, clear the event
      if (!foundFirstMember) {
        leaderClient.currentEvent = undefined;
        leaderClient.party.rotatingMembers = undefined;
        leaderClient.party.currentRotatingIndex = undefined;
      }
      return;
    }

    // Scenario 2: Fixed members invite to leader (Start Kéo Hải Tặc)
    if (member1Id || member2Id || member3Id) {
      const leaderClient = getClient(data.playerId);

      if (!leaderClient || !leaderClient.socket.context) {
        return;
      }

      const memberIds = [member1Id, member2Id, member3Id].filter((id) => id > 0);

      // Members send invites to leader
      memberIds.forEach((memberId, index) => {
        const memberClient = getClient(memberId);
        if (memberClient && memberClient.socket.context) {
          const packet = API.joinToParty(data.playerId);
          sendPacketWithDelay(memberClient.socket.context, packet, index * 500);
        }
      });
      return;
    }

    // Scenario 3: Legacy behavior - leader invites members
    const leaderClient = getClient(data.playerId);

    if (!leaderClient || !leaderClient.socket.context) {
      return;
    }

    const memberIds = [member1Id, member2Id, member3Id, member4Id].filter((id) => id > 0);

    // Send invite packets to each member
    memberIds.forEach((memberId, index) => {
      const memberClient = getClient(memberId);
      if (memberClient && memberClient.socket.context) {
        const packet = API.joinToParty(data.playerId);
        sendPacketWithDelay(memberClient.socket.context, packet, index * 500);
      }
    });
  });

  // Handle config save
  ipcMain.on('quest:auto-quest', (_event, data: { playerId: number; warpId: number }) => {
    const { playerId, warpId } = data;
    const client = getClient(playerId);
    if (client && client.socket.context) {
      // Set current event to autoQuest
      client.currentEvent = 'autoQuest';
      // Store target map ID (warpId is the target map ID)
      client.autoQuestTargetMapId = warpId;
      client.autoQuestWarpPath = undefined;
      
      // Start auto warp
      autoWarp(client, warpId);
    }
  });

  ipcMain.handle('config:save', async (_event, config: any) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Save Configuration',
        defaultPath: 'config.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });

      if (filePath) {
        writeFileSync(filePath, JSON.stringify(config, null, 2));
        return { success: true, filePath };
      }
      return { success: false, message: 'Save cancelled' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  });

  // Handle config load
  ipcMain.handle('config:load', async () => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Load Configuration',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
      });

      if (filePaths && filePaths.length > 0) {
        const data = readFileSync(filePaths[0], 'utf-8');
        const config = JSON.parse(data);
        // Apply config to all clients
        Object.keys(config).forEach((playerIdStr) => {
          const playerId = parseInt(playerIdStr);
          const playerConfig = config[playerId];
          const client = getClient(playerId);

          if (client) {
            // Apply party config
            if (playerConfig.partyConfig) {
              client.party = {
                ...client.party,
                leaderId: parseInt(playerConfig.partyConfig.leaderId) || 0,
                member1Id: parseInt(playerConfig.partyConfig.member1Id) || 0,
                member2Id: parseInt(playerConfig.partyConfig.member2Id) || 0,
                member3Id: parseInt(playerConfig.partyConfig.member3Id) || 0,
                member4Id: parseInt(playerConfig.partyConfig.member4Id) || 0,
                qsMemberIndex: parseInt(playerConfig.partyConfig.qsMemberIndex) || 0
              };
            }

            // Apply battle skill config
            if (playerConfig.battleSkillConfig) {
              client.battleSkillConfig = playerConfig.battleSkillConfig;
            }

            // Hải Tặc config is handled by renderer only (not stored in client)
            // It will be loaded by MissionComponent from the config file

            // Notify renderer about the updates
            rendererSend('player:party-update', {
              id: playerId,
              party: client.party
            });
          }
        });

        return { success: true, config };
      }
      return { success: false, message: 'Load cancelled' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  });

  // Handle debug XOR with AD
  ipcMain.handle('debug:xor-with-ad', (_event, hexString: string) => {
    try {
      const result = API.xorWithAD(hexString);
      return result;
    } catch (error: any) {
      throw new Error(`XOR conversion failed: ${error.message}`);
    }
  });

  // Handle debug decimal to hex conversion
  ipcMain.handle('debug:decimal-to-hex', (_event, decimal: number) => {
    try {
      // Convert decimal to hex (padded to 4 characters)
      const hex = decimal.toString(16).padStart(4, '0');

      // Rearrange using the same logic as rearrangeSkillId
      const rearranged = API.rearrangeSkillId(decimal);

      return { hex, rearranged };
    } catch (error: any) {
      throw new Error(`Decimal to hex conversion failed: ${error.message}`);
    }
  });

  createWindow();
  createProxyLocal();
});

export function sendPacketWithDelay(context?: UpstreamContext, data?: string, time = 0) {
  if (!context || !data) return;

  setTimeout(() => {
    (proxyLocal as any).handleUpstreamData(context, Buffer.from(API.hexStringToByte(data)));
  }, time);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
