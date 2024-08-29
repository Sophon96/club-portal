import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { ClubsNavbar } from "~/components/clubs-navbar";
import { Onboarding } from "~/components/onboarding";
import { Toaster } from "~/components/ui/sonner";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  let student = null;
  if (user) {
    student = await prisma.student.findUnique({ where: { email: user.email } });
  }
  return json({ user, student });
}

export default function Clubs() {
  const { user, student } = useLoaderData<typeof loader>();

  return (
    <>
      <ClubsNavbar user={user} />
      <Onboarding studentExists={!!student} />
      <Outlet />
      <Toaster />
    </>
  );
}
