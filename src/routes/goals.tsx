import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "MavunoPay — Goals" }] }),
  component: Goals,
});

function Goals() {
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    const id = localStorage.getItem('mavunopay_farmer_id');
    setFarmerId(id);
    if (id) fetchGoals(id);
  }, []);

  async function fetchGoals(id: string) {
    const res = await fetch(`http://localhost:3001/api/goals?farmerId=${id}`);
    if (res.ok) {
      const j = await res.json();
      setGoals(j.goals ?? []);
    }
  }

  if (!farmerId) return <div className="p-8">No farmer selected. Register first.</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold">Your Goals</h2>
      <div className="mt-4 space-y-2">
        {goals.length === 0 && <div>No goals yet.</div>}
        {goals.map(g => (
          <div key={g.id} className="p-3 border rounded-md">
            <div className="font-medium">{g.name}</div>
            <div className="text-sm text-muted-foreground">Target: {g.targetAmount}</div>
            <div className="text-sm">Balance: {g.balance}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
