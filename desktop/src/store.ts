import Store from "electron-store";

export type BrokerConfig = {
  type: "mt4" | "mt5" | "ninjatrader" | "tradovate" | "csv";
  enabled: boolean;
  watchPath: string;
};

export type AppSettings = {
  apiToken: string;
  apiUrl: string;
  syncIntervalMs: number;
  launchAtLogin: boolean;
  brokers: BrokerConfig[];
  lastSyncAt: string | null;
  deviceName: string;
};

const defaults: AppSettings = {
  apiToken: "",
  apiUrl: "https://trademindedge.com",
  syncIntervalMs: 30_000,
  launchAtLogin: true,
  deviceName: "",
  lastSyncAt: null,
  brokers: [
    { type: "mt4", enabled: false, watchPath: "" },
    { type: "mt5", enabled: false, watchPath: "" },
    { type: "ninjatrader", enabled: false, watchPath: "" },
    { type: "tradovate", enabled: false, watchPath: "" },
    { type: "csv", enabled: false, watchPath: "" },
  ],
};

export const store = new Store<AppSettings>({
  name: "edgebridge-settings",
  defaults,
  schema: {
    apiToken: { type: "string" },
    apiUrl: { type: "string" },
    syncIntervalMs: { type: "number", minimum: 10_000, maximum: 300_000 },
    launchAtLogin: { type: "boolean" },
    deviceName: { type: "string" },
    lastSyncAt: { type: ["string", "null"] },
    brokers: { type: "array" },
  },
});