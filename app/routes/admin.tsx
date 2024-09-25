import { Outlet } from "@remix-run/react";
import { notReady } from "~/lib/utils.server";

// FIXME: implement
export const loader = notReady();

export default function Admin() {
  return (
    <>
      <Outlet />
    </>
  );
}
