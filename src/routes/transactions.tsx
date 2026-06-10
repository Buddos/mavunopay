import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "MavunoPay — Transactions" }] }),
  component: Transactions,
});

export default function Transactions() {
  const [farmer, setFarmer] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("mavunopay_farmer");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFarmer(parsed);
        fetchTransactions(parsed.id);
      } catch (error) {
        setError("Unable to parse stored farmer details.");
      }
    }
  }, []);

  async function fetchTransactions(farmerId: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/transactions?farmerId=${encodeURIComponent(farmerId)}`);
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || "Failed to load transactions.");
        setTransactions([]);
      } else {
        setTransactions(payload.transactions ?? []);
      }
    } catch (err) {
      setError("Unable to connect to the backend.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  function formatAmount(amount: number, assetCode?: string) {
    if (!assetCode || assetCode === 'KES') {
      return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
    }
    return `${amount.toLocaleString()} ${assetCode}`;
  }

  return (
    <div className="p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Transaction History</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track payments and automatic goal allocations over time.</p>
        </div>
        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm"
          onClick={() => farmer && fetchTransactions(farmer.id)}
          disabled={!farmer || loading}
        >
          Refresh
        </button>
      </div>

      {!farmer ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
          No farmer selected. Log in or register from the dashboard to view transactions.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Loading transactions...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No transactions yet. Use the dashboard payment simulator or send a live payment to see allocations.
            </div>
          )}

          {transactions.map((tx) => (
            <div key={tx.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-base font-semibold text-slate-900">{formatAmount(Number(tx.amount) || 0, tx.assetCode)}</div>
                  <div className="text-sm text-slate-500">{new Date(tx.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-slate-500">{tx.groupPayment ? 'Co-op collection' : tx.memo || "Automatic allocation"}</div>
              </div>
              <div className="mt-4 text-sm text-slate-700">
                Allocations: {(tx.allocations || []).map((alloc: any) => `${alloc.key}: ${formatAmount(Number(alloc.amount) || 0, alloc.assetCode || tx.assetCode || 'KES')} (${alloc.pct}%)`).join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
