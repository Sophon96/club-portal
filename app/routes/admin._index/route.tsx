import { notReady } from "~/lib/utils.server"

export const loader = notReady()

export default function AdminIndex() {
  return <>
    <h1>Placeholder</h1>
    <h3>Admin Dashboard</h3>
  </>
}
