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

  useEffect(() => {
    const stored = localStorage.getItem("mavunopay_farmer");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFarmer(parsed);
        fetchGoals(parsed.id);
        fetchTransactions(parsed.id);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  async function fetchGoals(farmerId: string) {
    const res = await fetch(`http://localhost:3001/api/goals?farmerId=${farmerId}`);
    if (res.ok) {
      const j = await res.json();
      setGoals(j.goals ?? []);
    }
  }

  async function fetchTransactions(farmerId: string) {
    // Just read backend DB via a simple endpoint if available; otherwise show local data
    try {
      const res = await fetch(`http://localhost:3001/api/health`);
      if (res.ok) {
        // backend available — attempt to read transactions via data read (not provided), so skip
      }
    } catch (e) {
      // ignore
    }
  }

  if (!farmer) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="mt-4">No farmer selected. Please register or paste your Farmer ID.</p>
        <RegisterWidget onRegistered={(f: any) => { setFarmer(f); fetchGoals(f.id); }} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold">Welcome to your Dashboard</h2>
      <p className="mt-2 text-sm text-muted-foreground">Farmer ID: {farmer.id}</p>

      <section className="mt-6">
        <h3 className="text-lg font-medium">Savings Goals</h3>
        <div className="mt-4 space-y-2">
          {goals.length === 0 && <div>No goals yet.</div>}
          {goals.map((g) => (
            <div key={g.id} className="p-3 border rounded-md">
              <div className="font-medium">{g.name}</div>
              <div className="text-sm text-muted-foreground">Target: {g.targetAmount}</div>
              <div className="text-sm">Balance: {g.balance}</div>
            </div>
          ))}
        </div>
        <CreateGoalWidget farmerId={farmer.id} onCreated={(goal: any) => setGoals((s) => [goal, ...s])} />
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-medium">Recent Transactions</h3>
        <div className="mt-4">
          {transactions.length === 0 && <div>No transactions yet.</div>}
          {transactions.map((t) => (
            <div key={t.id} className="p-3 border rounded-md mb-2">{JSON.stringify(t)}</div>
          ))}
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-medium">Simulate Payment</h4>
          <SimulatePayment publicKey={farmer.stellarPublicKey} onDone={() => { fetchGoals(farmer.id); }} />
        </div>
      </section>
    </div>
  );
}

function RegisterWidget({ onRegistered }: { onRegistered: (f: any) => void }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    setLoading(true);
    const res = await fetch("http://localhost:3001/api/register", {
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
  const [target, setTarget] = useState("");

  async function create() {
    const res = await fetch("http://localhost:3001/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmerId, name, targetAmount: target }),
    });
    const j = await res.json();
    if (res.ok) {
      onCreated(j.goal);
      setName("");
      setTarget("");
    } else {
      alert(j.error || 'Failed to create goal');
    }
  }

  return (
    <div className="mt-4 max-w-md">
      <div className="flex gap-2">
        <label htmlFor="goal-name" className="sr-only">Goal name</label>
        <input id="goal-name" className="flex-1 rounded-md border px-3 py-2" placeholder="Goal name" value={name} onChange={(e) => setName(e.target.value)} />
        <label htmlFor="goal-target" className="sr-only">Target amount</label>
        <input id="goal-target" className="w-40 rounded-md border px-3 py-2" placeholder="Target amount" value={target} onChange={(e) => setTarget(e.target.value)} />
        <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground" onClick={create}>Add</button>
      </div>
    </div>
  );
}

function SimulatePayment({ publicKey, onDone }: { publicKey?: string; onDone?: () => void }) {
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!publicKey) return alert('No public key available');
    setLoading(true);
    const res = await fetch('http://localhost:3001/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey, amount: Number(amount) }),
    });
    const j = await res.json();
    setLoading(false);
    if (res.ok) {
      alert('Payment simulated');
      onDone?.();
    } else {
      alert(j.error || 'Simulation failed');
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <label htmlFor="simulate-amount" className="sr-only">Payment amount</label>
      <input id="simulate-amount" className="rounded-md border px-2 py-1 w-40" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground" onClick={send} disabled={loading}>{loading ? 'Sending...' : 'Simulate'}</button>
    </div>
  );
}
