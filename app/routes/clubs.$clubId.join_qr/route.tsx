import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx/lite";
import { CheckCircle } from "lucide-react";
import { authenticator } from "~/auth.server";
import { Large } from "~/components/ui/typography";
import { prisma } from "~/db.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Joining ${data?.name} | DSHS Clubs` }];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login?returnTo=" + request.url,
  });

  const club = await prisma.club.findUnique({
    where: { id: params.clubId },
    select: { name: true, members: { where: { studentEmail: user.email } } },
  });

  if (!club) {
    // null indicates the clubId wasn't found
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  // console.log(club)
  // more than zero members indicates that the user is already a member
  const isMember = club.members.length > 0;

  if (!isMember) {
    // FIXME: one of these days, I'll refactor the prisma schema to not have
    // Member rely on that stupid clubName unique constraint and I'll be able
    // to get rid of these awkward queries that are probably slower anyways.
    await prisma.club.update({
      where: { id: params.clubId },
      data: { members: { create: { studentEmail: user.email } } },
    });
  }

  return json({ name: club.name, isMember });
};

export default function ClubJoinQR() {
  const { name, isMember } = useLoaderData<typeof loader>();

  return (
    <main className="w-screen min-h-full flex flex-col items-center justify-center">
      <CheckCircle
        className={clsx(
          "size-1/4 aspect-square",
          isMember ? "text-muted-foreground" : "text-green-500"
        )}
      />
      <Large className="text-4xl">
        {isMember
          ? `You are already a member of ${name}`
          : `You are now a member of ${name}!`}
      </Large>
    </main>
  );
}
