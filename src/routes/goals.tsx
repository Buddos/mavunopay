import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "MavunoPay — Goals" }] }),
  component: Goals,
});

function Goals() {
  const [farmer, setFarmer] = useState<any | null>(null);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('mavunopay_farmer');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFarmer(parsed);
        fetchGoals(parsed.id);
        return;
      } catch (error) {
        // fall back to legacy id storage
      }
    }

    const id = localStorage.getItem('mavunopay_farmer_id');
    if (id) {
      setFarmer({ id });
      fetchGoals(id);
    }
  }, []);

  async function fetchGoals(id: string) {
    const res = await fetch(`/api/goals?farmerId=${id}`);
    if (res.ok) {
      const j = await res.json();
      setGoals(j.goals ?? []);
    }
  }

  if (!farmer) return <div className="p-8">No farmer selected. Register first.</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold">Your Savings Goals</h2>
      <p className="mt-2 text-sm text-muted-foreground">Farmer ID: {farmer.id}</p>
      <div className="mt-6 space-y-4">
        {goals.length === 0 ? (
          <div className="rounded-lg border bg-white p-4 text-sm text-slate-600">
            You have no savings goals yet. Create one from the dashboard to start allocating funds automatically.
          </div>
        ) : (
          goals.map((goal) => {
            const target = Number(goal.targetAmount) || 0;
            const balance = Number(goal.balance) || 0;
            const progress = target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 0;
            return (
              <div key={goal.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold">{goal.name}</div>
                    <div className="text-sm text-slate-500">Target: KES {target.toLocaleString()}</div>
                  </div>
                  <div className="text-right text-sm text-slate-700">
                    <div className="font-semibold">KES {balance.toLocaleString()}</div>
                    <div className="text-slate-500">{progress}%</div>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
