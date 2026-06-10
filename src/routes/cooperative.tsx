import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/cooperative')({
  head: () => ({ meta: [{ title: 'MavunoPay — Cooperative Dashboard' }] }),
  component: CooperativeDashboard,
});

export default function CooperativeDashboard() {
  const [farmer, setFarmer] = useState<any | null>(null);
  const [coops, setCoops] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [coopName, setCoopName] = useState('');
  const [coopDesc, setCoopDesc] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('mavunopay_farmer');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFarmer(parsed);
        refreshData(parsed.id);
        return;
      } catch (error) {
        // fall back to legacy id storage
      }
    }

    const legacyId = localStorage.getItem('mavunopay_farmer_id');
    if (legacyId) {
      setFarmer({ id: legacyId });
      refreshData(legacyId);
    }
  }, []);

  async function refreshData(farmerId: string) {
    await fetchCooperatives(farmerId);
  }

  async function fetchCooperatives(farmerId: string) {
    const res = await fetch(`/api/cooperatives?farmerId=${farmerId}`);
    if (res.ok) {
      const json = await res.json();
      setCoops(json.cooperatives ?? []);
    } else {
      setCoops([]);
    }
  }

  async function createCoop() {
    if (!farmer) return;
    const res = await fetch('/api/cooperatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId: farmer.id, name: coopName, description: coopDesc }),
    });
    const payload = await res.json();
    if (res.ok) {
      setStatus('Cooperative created successfully.');
      setCoopName('');
      setCoopDesc('');
      refreshData(farmer.id);
    } else {
      setStatus(payload.error || 'Unable to create cooperative.');
    }
  }

  async function joinCoop() {
    if (!farmer) return;
    const res = await fetch('/api/cooperatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId: farmer.id, action: 'join', joinCode }),
    });
    const payload = await res.json();
    if (res.ok) {
      setStatus('Joined cooperative successfully.');
      setJoinCode('');
      refreshData(farmer.id);
    } else {
      setStatus(payload.error || 'Unable to join cooperative.');
    }
  }

  if (!farmer) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold">Cooperative dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">
          Please log in first or restore your farmer profile from local storage.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Cooperative dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Track your co-op membership, pool, members, and governance actions.</p>
        </div>
        <a href="/dashboard" className="rounded-md border border-slate-200 bg-slate-100 px-4 py-2 text-sm">
          Back to dashboard
        </a>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-medium">Your cooperatives</h3>
            <p className="mt-1 text-sm text-slate-500">View all co-ops you lead or belong to.</p>
          </div>
          <div className="text-sm text-slate-500">Farmer ID: {farmer.id}</div>
        </div>

        <div className="mt-6 space-y-4">
          {coops.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              You are not currently part of any cooperative. Create one now or join with a code.
            </div>
          ) : (
            coops.map((coop) => (
              <div key={coop.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">{coop.name}</h4>
                    <p className="mt-1 text-sm text-slate-600">{coop.description || 'No description provided.'}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-700">
                    {coop.leaderId === farmer.id ? 'Leader' : 'Member'}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Pool balance</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900">KES {Number(coop.savingsBalance || 0).toLocaleString()}</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Members</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900">{Array.isArray(coop.members) ? coop.members.length : '—'}</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Join code</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900">{coop.joinCode}</div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                  <div>
                    <strong>Members</strong>
                  </div>
                  <div className="mt-2 space-y-1">
                    {Array.isArray(coop.members) && coop.members.length > 0 ? (
                      coop.members.map((memberId: string) => (
                        <div key={memberId} className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700">
                          {memberId}
                        </div>
                      ))
                    ) : (
                      <div>No member details available.</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium">Create or join a cooperative</h3>
            <p className="mt-1 text-sm text-slate-500">Start your own group savings community or join a trade cooperative with the join code.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Create new cooperative</div>
            <div className="mt-4 space-y-3">
              <input
                value={coopName}
                onChange={(e) => setCoopName(e.target.value)}
                placeholder="Cooperative name"
                className="w-full rounded-md border px-3 py-2"
              />
              <textarea
                value={coopDesc}
                onChange={(e) => setCoopDesc(e.target.value)}
                placeholder="Description"
                className="w-full rounded-md border px-3 py-2"
                rows={4}
              />
              <button
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                onClick={createCoop}
                disabled={!coopName.trim()}
              >
                Create cooperative
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Join with a code</div>
            <div className="mt-4 space-y-3">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Join code"
                className="w-full rounded-md border px-3 py-2"
              />
              <button
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm"
                onClick={joinCoop}
                disabled={!joinCode.trim()}
              >
                Join cooperative
              </button>
            </div>
          </div>
        </div>

        {status && <div className="mt-6 rounded-lg bg-slate-100 p-4 text-sm text-slate-700">{status}</div>}
      </section>
    </div>
  );
}
