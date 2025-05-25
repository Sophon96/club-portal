import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { Muted } from "~/components/ui/typography";
import { prisma } from "~/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user || user.type !== "admin") {
    throw new Response(null, { status: 404 });
  }

  const pendingClubs = await prisma.club.findMany({
    where: { pendingChanges: true },
  });
  return { clubs: pendingClubs };
};

export default function () {
  const { clubs } = useLoaderData<typeof loader>();

  return (
    <>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">Pending Clubs</h2>
      <Muted>Select a club to approve or reject changes.</Muted>
    </>
  );
}
