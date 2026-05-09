import {
  app, BrowserWindow, Tray, Menu, nativeImage, ipcMain,
  shell, dialog, Notification,
} from "electron";
import { autoUpdater } from "electron-updater";
import * as path from "path";
import { store } from "./store";
import { syncTrades, type TradeSyncPayload } from "./sync/api";
import { filterUnsynced, markSynced } from "./sync/queue";
import { MT4Watcher } from "./watchers/mt4";
import { NinjaTraderWatcher } from "./watchers/ninjatrader";
import { TradovateWatcher } from "./watchers/tradovate";

// ── Single instance lock ───────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); process.exit(0); }

let tray: Tray | null = null;
let win: BrowserWindow | null = null;
let syncTimer: ReturnType<typeof setInterval> | null = null;
let syncStatus: { ok: boolean; lastAt: string | null; tradesTotal: number } = {
  ok: true, lastAt: null, tradesTotal: 0,
};

const watchers: Array<{ stop: () => void; broker: string }> = [];
let pendingTrades: TradeSyncPayload[] = [];

// ── App lifecycle ──────────────────────────────────────────────────────────
app.on("ready", async () => {
  setupAutoUpdater();
  createTray();
  createWindow();
  startWatchers();
  scheduleSyncLoop();

  app.on("second-instance", () => {
    if (win) { win.show(); win.focus(); }
  });
});

app.on("window-all-closed", (e: Event) => {
  // Keep running in tray when window is closed
  e.preventDefault();
});

app.on("before-quit", () => {
  stopWatchers();
  if (syncTimer) clearInterval(syncTimer);
});

app.setLoginItemSettings({ openAtLogin: store.get("launchAtLogin") });

// ── Tray ───────────────────────────────────────────────────────────────────
function createTray(): void {
  const iconPath = getAssetPath("tray-icon.png");
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip("EdgeBridge — TradeMind Sync");
  rebuildTrayMenu();
  tray.on("double-click", showWindow);
}

function rebuildTrayMenu(): void {
  if (!tray) return;
  const last = syncStatus.lastAt
    ? `Last sync: ${new Date(syncStatus.lastAt).toLocaleTimeString()}`
    : "Not synced yet";

  const menu = Menu.buildFromTemplate([
    { label: "EdgeBridge", enabled: false },
    { type: "separator" },
    { label: last, enabled: false },
    {
      label: `${syncStatus.tradesTotal} trades synced`,
      enabled: false,
    },
    {
      label: syncStatus.ok ? "● Connected" : "● Disconnected",
      enabled: false,
      icon: nativeImage.createFromDataURL(
        syncStatus.ok
          ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAABmJLR0QA/wD/AP+gvaeTAAAADklEQVQI12NgYGD4TwABBAEBVn+fwQAAAABJRU5ErkJggg=="
          : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAABmJLR0QA/wD/AP+gvaeTAAAADklEQVQI12NgYGD4TwABBAEBVn+fwQAAAABJRU5ErkJggg=="
      ),
    },
    { type: "separator" },
    { label: "Sync Now", click: () => runSync(true) },
    { label: "Settings", click: showWindow },
    { label: "Open TradeMind", click: () => shell.openExternal("https://trademindedge.com/dashboard") },
    { type: "separator" },
    { label: "Quit EdgeBridge", click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);
}

function showWindow(): void {
  if (win) { win.show(); win.focus(); }
  else createWindow();
}

// ── Settings window ────────────────────────────────────────────────────────
function createWindow(): void {
  win = new BrowserWindow({
    width: 520,
    height: 680,
    minWidth: 480,
    minHeight: 600,
    resizable: true,
    title: "EdgeBridge Settings",
    backgroundColor: "#0D0F14",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    ...(process.platform === "darwin" ? { titleBarStyle: "hiddenInset" } : {}),
  });

  win.loadFile(path.join(__dirname, "../src/renderer/index.html"));
  win.once("ready-to-show", () => win?.show());

  win.on("close", (e) => {
    e.preventDefault();
    win?.hide();
  });

  win.on("closed", () => { win = null; });
}

// ── Watchers ───────────────────────────────────────────────────────────────
function startWatchers(): void {
  stopWatchers();
  const brokers = store.get("brokers");

  for (const broker of brokers) {
    if (!broker.enabled || !broker.watchPath) continue;

    const collectTrades = (trades: TradeSyncPayload[]) => {
      const unseen = filterUnsynced(trades);
      if (unseen.length > 0) {
        pendingTrades.push(...unseen);
        runSync(false);
      }
    };

    const onError = (err: Error) => {
      sendToRenderer("sync-error", { broker: broker.type, message: err.message });
    };

    if (broker.type === "mt4" || broker.type === "mt5") {
      const w = new MT4Watcher(broker.watchPath, broker.type, collectTrades, onError);
      w.start();
      watchers.push({ stop: () => w.stop(), broker: broker.type });
    } else if (broker.type === "ninjatrader") {
      const w = new NinjaTraderWatcher(broker.watchPath, collectTrades, onError);
      w.start();
      watchers.push({ stop: () => w.stop(), broker: broker.type });
    } else if (broker.type === "tradovate" || broker.type === "csv") {
      const w = new TradovateWatcher(broker.watchPath, collectTrades, onError);
      w.start();
      watchers.push({ stop: () => w.stop(), broker: broker.type });
    }
  }
}

function stopWatchers(): void {
  for (const w of watchers) w.stop();
  watchers.length = 0;
}

// ── Sync loop ──────────────────────────────────────────────────────────────
function scheduleSyncLoop(): void {
  if (syncTimer) clearInterval(syncTimer);
  const interval = store.get("syncIntervalMs");
  syncTimer = setInterval(() => runSync(false), interval);
}

let syncing = false;
async function runSync(manual: boolean): Promise<void> {
  if (syncing) return;
  if (pendingTrades.length === 0 && !manual) return;

  const token = store.get("apiToken");
  if (!token) {
    sendToRenderer("sync-status", { ok: false, message: "No API token — open Settings" });
    return;
  }

  syncing = true;
  sendToRenderer("sync-status", { ok: true, message: "Syncing..." });

  const batch = [...pendingTrades];
  pendingTrades = [];

  const activeBrokers = store.get("brokers").filter((b) => b.enabled).map((b) => b.type);
  const result = await syncTrades(batch, activeBrokers);

  if (result.ok) {
    markSynced(batch.map((t) => t.brokerTradeId));
    syncStatus = {
      ok: true,
      lastAt: new Date().toISOString(),
      tradesTotal: syncStatus.tradesTotal + result.created,
    };
    sendToRenderer("sync-success", result);

    if (manual || result.created > 0) {
      new Notification({
        title: "EdgeBridge",
        body: result.created > 0
          ? `${result.created} trade${result.created > 1 ? "s" : ""} synced to TradeMind`
          : "Already up to date",
        silent: !manual,
      }).show();
    }
  } else {
    // Put trades back in pending so they'll retry
    pendingTrades.unshift(...batch);
    syncStatus.ok = false;
    sendToRenderer("sync-error", { broker: "api", message: result.serverError ?? "Sync failed" });
  }

  syncing = false;
  rebuildTrayMenu();
}

// ── IPC ───────────────────────────────────────────────────────────────────
ipcMain.handle("get-settings", () => store.store);

ipcMain.handle("save-settings", (_e, settings) => {
  try {
    store.set("apiToken", settings.apiToken ?? store.get("apiToken"));
    store.set("apiUrl", settings.apiUrl ?? store.get("apiUrl"));
    store.set("deviceName", settings.deviceName ?? store.get("deviceName"));
    store.set("launchAtLogin", settings.launchAtLogin ?? store.get("launchAtLogin"));
    store.set("syncIntervalMs", settings.syncIntervalMs ?? store.get("syncIntervalMs"));
    if (settings.brokers) store.set("brokers", settings.brokers);

    app.setLoginItemSettings({ openAtLogin: store.get("launchAtLogin") });
    startWatchers();
    scheduleSyncLoop();

    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
});

ipcMain.handle("browse-path", async (_e, title: string) => {
  const result = await dialog.showOpenDialog(win!, {
    title,
    properties: ["openDirectory"],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("sync-now", async () => {
  await runSync(true);
  return syncStatus;
});

ipcMain.handle("get-sync-status", () => syncStatus);

// ── Auto-updater ───────────────────────────────────────────────────────────
function setupAutoUpdater(): void {
  if (process.env.NODE_ENV === "development") return;

  try {
    autoUpdater.setFeedURL({
      provider: "generic",
      url: "https://trademind.app/api/bridge/update",
    });
    autoUpdater.autoDownload = true;
    autoUpdater.checkForUpdates();
    setInterval(() => autoUpdater.checkForUpdates(), 4 * 60 * 60 * 1000);

    autoUpdater.on("update-available", () => {
      new Notification({ title: "EdgeBridge Update", body: "An update is downloading..." }).show();
    });

    autoUpdater.on("update-downloaded", () => {
      new Notification({
        title: "EdgeBridge Update Ready",
        body: "Restart EdgeBridge to apply the update.",
      }).show();
    });
  } catch {
    // Updater unavailable in dev builds
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getAssetPath(filename: string): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, "assets", filename)
    : path.join(__dirname, "../assets", filename);
}

function sendToRenderer(channel: string, data: unknown): void {
  win?.webContents.send(channel, data);
}