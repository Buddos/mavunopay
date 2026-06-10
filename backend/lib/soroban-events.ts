import axios from 'axios';
import { getSorobanConfig } from './soroban-config';

export type SorobanEvent = {
  id?: string;
  topics?: any[];
  data?: any;
};

export async function fetchSorobanTransactionEvents(txHash: string): Promise<SorobanEvent[]> {
  const cfg = getSorobanConfig();
  if (!cfg.rpcUrl) return [];
  try {
    // Best-effort request - different soroban-rpc versions expose transaction endpoints differently.
    // Try GET /transaction?hash=... first (common), then fallback to /transactions/{hash}.
    const tryUrls = [
      `${cfg.rpcUrl.replace(/\/+$/, '')}/transaction?hash=${encodeURIComponent(txHash)}`,
      `${cfg.rpcUrl.replace(/\/+$/, '')}/transactions/${encodeURIComponent(txHash)}`,
    ];

    for (const url of tryUrls) {
      try {
        const resp = await axios.get(url, { timeout: 5000 });
        const body = resp.data;
        // Many RPCs expose events under body.events or body.transaction?.meta?.events
        const events = body.events || body.result?.events || body.transaction?.meta?.events || body.transaction?.events;
        if (events && Array.isArray(events)) {
          return events.map((e: any) => normalizeEvent(e));
        }
      } catch (err) {
        // continue to next URL
      }
    }

    // If nothing returned, return empty
    return [];
  } catch (err) {
    console.warn('Failed to fetch soroban events for', txHash, err);
    return [];
  }
}

function normalizeEvent(raw: any): SorobanEvent {
  // raw may contain { topics: [...], data: {...} } or { type, topics, data }
  const topics = raw.topics || raw.topic || raw.topics_raw || [];
  const data = raw.data || raw.value || raw.fields || raw.data_raw || raw.payload || null;
  return { id: raw.id || raw.txid || undefined, topics, data };
}
