import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { createProxy, TcpProxy } from 'node-tcp-proxy';
import { join } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import icon from '../../resources/icon.png?asset';
import API from '../helpers/API';
import { updateClient, setRendererSend, getClient } from '../store/clients';
import { onReceivePacket, remotePorts } from './packetHandlers';
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
        //console.log("upstream", data.toString("hex"));

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

  ipcMain.on('ping', () => console.log('pong'));

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

  // Handle config save
  ipcMain.handle('config:save', async (_event, config: any) => {
    console.log('config', config);
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

  createWindow();
  createProxyLocal();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
