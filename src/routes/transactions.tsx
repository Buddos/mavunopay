import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "MavunoPay — Transactions" }] }),
  component: Transactions,
});

export default function Transactions() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold">Transactions</h2>
      <p className="mt-2">Transaction history will appear here. (Coming soon)</p>
    </div>
  );
}
