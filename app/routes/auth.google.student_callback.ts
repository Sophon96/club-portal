// app/routes/auth/google/callback.tsx
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { prisma } from "~/db.server";
import { commitSession, getSession } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let user = await authenticator.authenticate("student", request, {
    failureRedirect: "/login",
  });

  // boilerplate for manually handling the session
  let session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, user);
  let headers = new Headers({ "Set-Cookie": await commitSession(session) });

  const userAlreadyExists = await prisma.student.findUnique({
    where: {
      email: user.email,
    },
    select: {
      id: true,
    },
  });

  if (userAlreadyExists) {
    return redirect("/clubs", { headers });
  } else {
    return redirect("/student_onboarding", { headers });
  }
};
