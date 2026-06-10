import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "MavunoPay — Dashboard" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [farmer, setFarmer] = useState<any | null>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [creditProfile, setCreditProfile] = useState<any>(null);
  const [coops, setCoops] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("mavunopay_farmer");
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

    const legacyId = localStorage.getItem("mavunopay_farmer_id");
    if (legacyId) {
      setFarmer({ id: legacyId });
      refreshData(legacyId);
    }
  }, []);

  async function refreshData(farmerId: string) {
    await Promise.all([
      fetchGoals(farmerId),
      fetchTransactions(farmerId),
      fetchNotifications(farmerId),
      fetchCreditProfile(farmerId),
      fetchCooperatives(farmerId),
    ]);
  }

  async function fetchGoals(farmerId: string) {
    const res = await fetch(`/api/goals?farmerId=${farmerId}`);
    if (res.ok) {
      const j = await res.json();
      setGoals(j.goals ?? []);
    }
  }

  async function fetchTransactions(farmerId: string) {
    const res = await fetch(`/api/transactions?farmerId=${farmerId}`);
    if (res.ok) {
      const j = await res.json();
      setTransactions(j.transactions ?? []);
    } else {
      setTransactions([]);
    }
  }

  async function fetchNotifications(farmerId: string) {
    const res = await fetch(`/api/notifications?farmerId=${farmerId}`);
    if (res.ok) {
      const j = await res.json();
      setNotifications(j.notifications ?? []);
    }
  }

  async function markNotificationRead(id: string) {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'markRead' }),
    });
    if (res.ok) {
      setNotifications((current) => current.map((note) => (note.id === id ? { ...note, read: true } : note)));
    }
  }

  async function markAllNotificationsRead() {
    const unreadIds = notifications.filter((note) => !note.read).map((note) => note.id);
    await Promise.all(unreadIds.map((id) => markNotificationRead(id)));
  }

  async function fetchCreditProfile(farmerId: string) {
    const res = await fetch(`/api/credit-profile?farmerId=${farmerId}`);
    if (res.ok) {
      const j = await res.json();
      setCreditProfile(j.profile);
    }
  }

  async function fetchCooperatives(farmerId: string) {
    const res = await fetch(`/api/cooperatives?farmerId=${farmerId}`);
    if (res.ok) {
      const j = await res.json();
      setCoops(j.cooperatives ?? []);
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);
  }

  function totalSaved() {
    return goals.reduce((sum, goal) => sum + (Number(goal.balance) || 0), 0);
  }

  function totalTarget() {
    return goals.reduce((sum, goal) => sum + (Number(goal.targetAmount) || 0), 0);
  }

  function logout() {
    localStorage.removeItem("mavunopay_farmer");
    window.location.href = '/';
  }

  if (!farmer) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="mt-4">No farmer selected. Please register or paste your Farmer ID.</p>
        <RegisterWidget onRegistered={(f: any) => { setFarmer(f); refreshData(f.id); }} />
      </div>
    );
  }

  const saved = totalSaved();
  const goalTotal = totalTarget();
  const progress = goalTotal > 0 ? Math.min(100, Math.round((saved / goalTotal) * 100)) : 0;

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Welcome back, {farmer.name ?? 'Farmer'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Farmer ID: {farmer.id}</p>
        </div>
        <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm" onClick={logout}>
          Logout
        </button>
      </div>

      {notifications.length > 0 && (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium">Notifications</h3>
              <p className="mt-1 text-sm text-slate-500">Important updates for your farm savings, loans, and cooperative activity.</p>
            </div>
            <button
              className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm"
              onClick={markAllNotificationsRead}
              disabled={notifications.every((note) => note.read)}
            >
              Mark all read
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {notifications.slice(0, 6).map((note) => (
              <div key={note.id} className={`rounded-2xl border px-4 py-3 ${note.read ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-300'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{note.title}</div>
                    <div className="text-xs text-slate-500">{new Date(note.createdAt).toLocaleString()}</div>
                  </div>
                  {!note.read ? (
                    <button
                      className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                      onClick={() => markNotificationRead(note.id)}
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
                <div className="mt-2 text-sm text-slate-700">{note.message}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total saved</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">{formatCurrency(saved)}</div>
          <div className="mt-2 text-sm text-slate-500">Across {goals.length} goal{goals.length === 1 ? '' : 's'}</div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Goal target</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">{formatCurrency(goalTotal)}</div>
          <div className="mt-2 text-sm text-slate-500">Progress: {progress}%</div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Allocation rules</div>
          <div className="mt-3 space-y-2">
            {(farmer.allocationRules || []).map((rule: any) => (
              <div key={rule.key} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="capitalize">{rule.key.replace(/_/g, ' ')}</span>
                <span>{rule.pct}%</span>
              </div>
            ))}
            {(farmer.allocationRules || []).length === 0 && (
              <div className="text-sm text-slate-500">No allocation rules configured yet.</div>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium">Savings Goals</h3>
            <p className="mt-1 text-sm text-slate-500">Track progress, targets, and balances for each goal.</p>
          </div>
          <div className="text-sm text-slate-500">Total progress: {progress}%</div>
        </div>

        <div className="mt-5 space-y-4">
          {goals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">
              No goals yet. Create one below and start saving on every payment.
            </div>
          ) : (
            goals.map((goal) => {
              const target = Number(goal.targetAmount) || 0;
              const balance = Number(goal.balance) || 0;
              const completed = target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 0;
              const unlockDate = goal.unlockDate ? new Date(goal.unlockDate).toLocaleDateString() : null;
              return (
                <div key={goal.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{goal.name}</div>
                      <div className="text-sm text-slate-500">Target {formatCurrency(target)} · Balance {formatCurrency(balance)}</div>
                      {goal.description && <div className="mt-2 text-sm text-slate-600">{goal.description}</div>}
                      {goal.targetDate && <div className="mt-1 text-sm text-slate-500">Target date: {new Date(goal.targetDate).toLocaleDateString()}</div>}
                      {goal.locked && <div className="mt-1 text-sm text-amber-700">Locked until {unlockDate || 'maturity'}</div>}
                    </div>
                    <div className="text-right text-sm text-slate-600">{completed}% complete</div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-primary w-full" />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">{completed}% complete</div>
                </div>
              );
            }))}
        </div>

        <div className="mt-6">
          <CreateGoalWidget farmerId={farmer.id} onCreated={(goal: any) => {
            setGoals((s) => [goal, ...s]);
            fetchTransactions(farmer.id);
          }} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr,0.8fr]">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium">Recent Transactions</h3>
              <p className="mt-1 text-sm text-slate-500">All incoming payments allocated across your goals.</p>
            </div>
            <button className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm" onClick={() => fetchTransactions(farmer.id)}>
              Refresh
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">
                No transactions yet. Simulate a payment to see allocations in action.
              </div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t.assetCode ? `${t.assetCode} ${Number(t.amount).toLocaleString()}` : formatCurrency(Number(t.amount) || 0)} received</div>
                      <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-slate-500">{t.groupPayment ? 'Co-op collection' : t.memo || 'Automatic allocation'}</div>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    Allocations: {(t.allocations || []).map((a: any) => `${a.key}: ${formatCurrency(Number(a.amount) || 0)} (${a.pct}%)`).join(', ')}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h4 className="text-sm font-medium">Simulate Payment</h4>
            <p className="mt-1 text-sm text-slate-500">Post a payment and automatically allocate funds to your goals.</p>
            <SimulatePayment publicKey={farmer.stellarPublicKey} onDone={() => {
              fetchGoals(farmer.id);
              fetchTransactions(farmer.id);
            }} />
          </div>
        </div>

        <div className="space-y-4">
          <CreditProfileWidget farmerId={farmer.id} />
          <CooperativeWidget farmer={farmer} coops={coops} />
          <WithdrawalWidget farmerId={farmer.id} goals={goals} onRequested={() => fetchGoals(farmer.id)} />
          <LoanWidget farmerId={farmer.id} onRequested={() => fetchCreditProfile(farmer.id)} />
        </div>
      </section>
    </div>
  );
}

function CreditProfileWidget({ farmerId }: { farmerId: string }) {
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/credit-profile?farmerId=${farmerId}`).then(async (res) => {
      if (res.ok) {
        const json = await res.json();
        setProfile(json.profile);
      }
    });
  }, [farmerId]);

  if (!profile) return null;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Credit Profile</h3>
          <p className="mt-1 text-sm text-slate-500">Your farm-based credit score and borrowing power.</p>
        </div>
        <a href={`/api/credit-profile?farmerId=${farmerId}&export=csv`} className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm">
          Export CSV
        </a>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Score</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{profile.score}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Tier</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{profile.tier}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Saved</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">KES {Number(profile.totalSaved).toLocaleString()}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Pending withdrawals</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{profile.pendingWithdrawals}</div>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        {profile.recommendations?.map((item: string, index: number) => (
          <div key={index}>• {item}</div>
        ))}
      </div>
    </div>
  );
}

function CooperativeWidget({ farmer, coops }: { farmer: any; coops: any[] }) {
  const [coop, setCoop] = useState<any | null>(coops[0] ?? null);
  const [status, setStatus] = useState<string>('');
  const [joinCode, setJoinCode] = useState('');
  const [coopName, setCoopName] = useState('');
  const [coopDesc, setCoopDesc] = useState('');

  useEffect(() => {
    setCoop(coops[0] ?? null);
  }, [coops]);

  async function createCoop() {
    const res = await fetch('/api/cooperatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId: farmer.id, name: coopName, description: coopDesc }),
    });
    const payload = await res.json();
    if (res.ok) {
      setCoop(payload.coop);
      setStatus('Cooperative created successfully.');
    } else {
      setStatus(payload.error || 'Unable to create cooperative.');
    }
  }

  async function joinCoop() {
    const res = await fetch('/api/cooperatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId: farmer.id, action: 'join', joinCode }),
    });
    const payload = await res.json();
    if (res.ok) {
      setCoop(payload.coop);
      setStatus('Joined cooperative successfully.');
    } else {
      setStatus(payload.error || 'Unable to join cooperative.');
    }
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Cooperative</h3>
          <p className="mt-1 text-sm text-slate-500">Manage your group savings and governance.</p>
        </div>
        <a href="/cooperative" className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
          View cooperative dashboard
        </a>
      </div>
      {coop ? (
        <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">{coop.name}</div>
          <div className="text-sm text-slate-600">{coop.description || 'No description provided.'}</div>
          <div className="text-sm text-slate-500">Savings pool: KES {Number(coop.savingsBalance || 0).toLocaleString()}</div>
          <div className="text-sm text-slate-500">Join code: {coop.joinCode}</div>
        </div>
      ) : (
        <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
          <div className="text-sm text-slate-600">No cooperative connected yet. Create one or join with a code.</div>
          <div className="space-y-3">
            <input
              value={coopName}
              onChange={(e) => setCoopName(e.target.value)}
              placeholder="Cooperative name"
              className="w-full rounded-md border px-3 py-2"
            />
            <input
              value={coopDesc}
              onChange={(e) => setCoopDesc(e.target.value)}
              placeholder="Description"
              className="w-full rounded-md border px-3 py-2"
            />
            <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={createCoop}>
              Create cooperative
            </button>
            <div className="mt-2 border-t border-slate-200 pt-3">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Join code"
                className="w-full rounded-md border px-3 py-2"
              />
              <button className="mt-2 inline-flex items-center rounded-md border border-slate-200 px-4 py-2 text-sm" onClick={joinCoop}>
                Join cooperative
              </button>
            </div>
          </div>
        </div>
      )}
      {status && <div className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{status}</div>}
    </div>
  );
}

function WithdrawalWidget({ farmerId, goals, onRequested }: { farmerId: string; goals: any[]; onRequested: () => void }) {
  const [goalId, setGoalId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'standard' | 'emergency'>('standard');
  const [message, setMessage] = useState('');

  async function requestWithdrawal() {
    const res = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId, goalId, amount: Number(amount), type }),
    });
    const payload = await res.json();
    if (res.ok) {
      setMessage('Withdrawal request created.');
      setAmount('');
      onRequested();
    } else {
      setMessage(payload.error || 'Unable to create withdrawal request.');
    }
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-medium">Withdraw funds</h3>
      <p className="mt-1 text-sm text-slate-500">Request a payout from one of your goals.</p>
      <div className="mt-4 space-y-3">
        <label className="sr-only" htmlFor="withdrawal-goal">Select goal</label>
        <select id="withdrawal-goal" className="w-full rounded-md border px-3 py-2" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          <option value="">Select goal</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>{goal.name} — KES {Number(goal.balance || 0).toLocaleString()}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="withdrawal-amount">Withdrawal amount</label>
        <input
          id="withdrawal-amount"
          type="number"
          className="w-full rounded-md border px-3 py-2"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex gap-2">
          <button className={`rounded-md px-4 py-2 text-sm ${type === 'standard' ? 'bg-primary text-primary-foreground' : 'border border-slate-200 bg-white'}`} onClick={() => setType('standard')}>
            Standard
          </button>
          <button className={`rounded-md px-4 py-2 text-sm ${type === 'emergency' ? 'bg-amber-500 text-white' : 'border border-slate-200 bg-white'}`} onClick={() => setType('emergency')}>
            Emergency
          </button>
        </div>
        <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={requestWithdrawal} disabled={!goalId || !amount}>
          Request withdrawal
        </button>
        {message && <div className="text-sm text-slate-600">{message}</div>}
      </div>
    </div>
  );
}

function LoanWidget({ farmerId, onRequested }: { farmerId: string; onRequested: () => void }) {
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('12');
  const [message, setMessage] = useState('');

  async function requestLoan() {
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId, amount: Number(amount), termMonths: Number(term) }),
    });
    const payload = await res.json();
    if (res.ok) {
      setMessage(`Loan ${payload.loan.status}.`);
      setAmount('');
      onRequested();
    } else {
      setMessage(payload.error || 'Unable to request loan.');
    }
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-medium">Loan request</h3>
      <p className="mt-1 text-sm text-slate-500">Use your credit profile to access working capital.</p>
      <div className="mt-4 space-y-3">
        <input
          type="number"
          className="w-full rounded-md border px-3 py-2"
          placeholder="Loan amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="number"
          className="w-full rounded-md border px-3 py-2"
          placeholder="Term months"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={requestLoan} disabled={!amount || !term}>
          Request loan
        </button>
        {message && <div className="text-sm text-slate-600">{message}</div>}
      </div>
    </div>
  );
}

function RegisterWidget({ onRegistered }: { onRegistered: (f: any) => void }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name }),
    });
    const j = await res.json();
    if (res.ok) {
      const farmer = j.farmer;
      localStorage.setItem("mavunopay_farmer", JSON.stringify(farmer));
      onRegistered(farmer);
    } else {
      alert(j.error || "Registration failed");
    }
    setLoading(false);
  }

  return (
    <div className="mt-4 max-w-md">
      <label htmlFor="register-phone" className="block text-sm font-medium">Phone</label>
      <input id="register-phone" className="mt-1 w-full rounded-md border px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +2547..." />
      <label htmlFor="register-name" className="block text-sm font-medium mt-3">Name (optional)</label>
      <input id="register-name" className="mt-1 w-full rounded-md border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Farmer name" />
      <div className="mt-4">
        <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={register} disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </div>
    </div>
  );
}

function CreateGoalWidget({ farmerId, onCreated }: { farmerId: string; onCreated: (g: any) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [locked, setLocked] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!name.trim() || !target.trim()) return;
    setLoading(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmerId,
        name,
        description,
        targetAmount: Number(target),
        targetDate: targetDate || null,
        locked,
        unlockDate: unlockDate || null,
        currency: 'KES',
      }),
    });
    const payload = await res.json();
    if (res.ok) {
      setName('');
      setDescription('');
      setTarget('');
      setTargetDate('');
      setLocked(false);
      setUnlockDate('');
      onCreated(payload.goal);
    } else {
      alert(payload.error || 'Unable to create goal');
    }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="text-base font-semibold text-slate-900">Create a new savings goal</div>
      <div className="mt-4 space-y-3 text-sm text-slate-700">
        <input className="w-full rounded-md border px-3 py-2" placeholder="Goal name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="w-full rounded-md border px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-md border px-3 py-2" placeholder="Target amount" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
          <input className="rounded-md border px-3 py-2" placeholder="Target date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
            Lock goal until maturity
          </label>
          {locked && (
            <label className="sr-only" htmlFor="unlock-date">Unlock date</label>
          )}
          {locked && <input id="unlock-date" className="rounded-md border px-3 py-2" type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} />}
        </div>
        <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={create} disabled={loading || !name || !target}>
          {loading ? 'Creating...' : 'Save goal'}
        </button>
      </div>
    </div>
  );
}

function SimulatePayment({ publicKey, onDone }: { publicKey: string; onDone: () => void }) {
  const [amount, setAmount] = useState('500');
  const [assetCode, setAssetCode] = useState('KES');
  const [groupPayment, setGroupPayment] = useState(false);
  const [memo, setMemo] = useState('Harvest sale');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function simulate() {
    setLoading(true);
    const res = await fetch('/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey, amount: Number(amount), assetCode, memo, groupPayment }),
    });
    const payload = await res.json();
    if (res.ok) {
      setMessage('Payment allocated successfully.');
      setAmount('500');
      onDone();
    } else {
      setMessage(payload.error || 'Unable to simulate payment.');
    }
    setLoading(false);
  }

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-md border px-3 py-2" type="number" placeholder="Amount" />
        <input value={assetCode} onChange={(e) => setAssetCode(e.target.value)} className="rounded-md border px-3 py-2" placeholder="Asset code" />
      </div>
      <input value={memo} onChange={(e) => setMemo(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Memo" />
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={groupPayment} onChange={(e) => setGroupPayment(e.target.checked)} />
        Group payment for cooperative savings
      </label>
      <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={simulate} disabled={loading}>
        {loading ? 'Simulating...' : 'Simulate payment'}
      </button>
      {message && <div className="text-sm text-slate-600">{message}</div>}
    </div>
  );
}

export default Dashboard;
