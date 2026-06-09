import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "MavunoPay — Profile" }] }),
  component: Profile,
});

export default function Profile() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold">Profile</h2>
      <p className="mt-2">Manage your account and settings. (Coming soon)</p>
    </div>
  );
}
