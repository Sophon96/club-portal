import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
      <div className="min-h-screen">
        <ClubsNavbar user={user} />
        {user ? <Onboarding studentExists={!!student} user={user} /> : null}
        <Outlet />
      </div>
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>dshs.club | The platform for clubs at Davis Senior High School</p>
        </div>
      </footer>
    </>
  );
}
