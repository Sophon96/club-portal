import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { authenticator } from "~/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = authenticator.isAuthenticated(request);
  return json(user);
}

export default function Clubs() {
  return (
    <>
      <Outlet />
    </>
  );
}
