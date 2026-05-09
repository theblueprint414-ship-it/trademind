import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("edgeBridge", {
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (s: unknown) => ipcRenderer.invoke("save-settings", s),
  browsePath: (title: string) => ipcRenderer.invoke("browse-path", title),
  syncNow: () => ipcRenderer.invoke("sync-now"),
  getSyncStatus: () => ipcRenderer.invoke("get-sync-status"),

  onSyncSuccess: (cb: (data: unknown) => void) => {
    ipcRenderer.on("sync-success", (_e, d) => cb(d));
    return () => ipcRenderer.removeAllListeners("sync-success");
  },
  onSyncError: (cb: (data: unknown) => void) => {
    ipcRenderer.on("sync-error", (_e, d) => cb(d));
    return () => ipcRenderer.removeAllListeners("sync-error");
  },
  onSyncStatus: (cb: (data: unknown) => void) => {
    ipcRenderer.on("sync-status", (_e, d) => cb(d));
    return () => ipcRenderer.removeAllListeners("sync-status");
  },
});

export type EdgeBridgeAPI = typeof import("./preload");