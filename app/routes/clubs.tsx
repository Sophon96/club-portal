import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { ClubsNavbar } from "~/components/clubs-navbar";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  return json(user);
}

export default function Clubs() {
  const user = useLoaderData<typeof loader>();

  return (
    <>
      <ClubsNavbar user={user} />
      <Outlet />
    </>
  );
}
