import { authenticator } from "~/auth.server";
import { notReady } from "~/lib/utils.server";

export const loader = notReady(async ({ request }) => {
  await authenticator.isAuthenticated(request);
  return null;
});

export default function AdminIndex() {
  return (
    <>
      <h1>Placeholder</h1>
      <h3>Admin Dashboard</h3>
    </>
  );
}
