// Persistent dedup queue — prevents re-sending trades across restarts
import Store from "electron-store";

type QueueStore = {
  synced: Record<string, number>; // brokerTradeId → unix timestamp when synced
};

const queueStore = new Store<QueueStore>({
  name: "edgebridge-queue",
  defaults: { synced: {} },
});

export function markSynced(ids: string[]): void {
  const synced = queueStore.get("synced");
  const now = Date.now();
  for (const id of ids) synced[id] = now;
  queueStore.set("synced", synced);
  pruneOldEntries(synced);
}

export function filterUnsynced<T extends { brokerTradeId: string }>(trades: T[]): T[] {
  const synced = queueStore.get("synced");
  return trades.filter((t) => !synced[t.brokerTradeId]);
}

// Keep the queue from growing unbounded — remove entries older than 30 days
function pruneOldEntries(synced: Record<string, number>): void {
  const cutoff = Date.now() - 30 * 86_400_000;
  let pruned = false;
  for (const [id, ts] of Object.entries(synced)) {
    if (ts < cutoff) { delete synced[id]; pruned = true; }
  }
  if (pruned) queueStore.set("synced", synced);
}

export function getSyncedCount(): number {
  return Object.keys(queueStore.get("synced")).length;
}

export function clearQueue(): void {
  queueStore.set("synced", {});
}