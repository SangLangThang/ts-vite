import { BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

/**
 * Set the main window reference
 */
export function setMainWindow(window: BrowserWindow | null) {
  mainWindow = window;
}

/**
 * Send data to the renderer process
 * @param event - Event name
 * @param data - Data to send
 */
export function rendererSend(event: string, data: any) {
  mainWindow?.webContents?.send(event, data);
}
