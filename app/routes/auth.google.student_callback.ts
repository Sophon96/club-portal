import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { authReturnToCookie } from "~/cookies.server";
import { commitSession, getSession } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const returnToPath = (await authReturnToCookie.parse(request.headers.get("Cookie"))) ?? "/"

  const user = await authenticator.authenticate("student", request, {
    failureRedirect: "/login",
  });

  // boilerplate for manually handling the session
  // NOTE: I think this is necessary because we don't provide a successRedirect
  const session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, user);
  const headers = new Headers({ "Set-Cookie": await commitSession(session) });

  return redirect(returnToPath, { headers });
};
