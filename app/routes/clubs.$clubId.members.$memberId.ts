import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { prisma } from "~/db.server";

export async function action({ params, request }: ActionFunctionArgs) {
  // TODO: add authentication
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // Update database
  // Get the name of the club
  const clubName = await prisma.club
    .findUnique({
      where: {
        id: params.clubId,
      },
      select: {
        name: true,
      },
    })
    .then((value) => {
      if (!value)
        throw new Response(null, { status: 400, statusText: "Not Found" });
      return value.name;
    });

  await prisma.club.update({
    where: {
      id: params.clubId,
    },
    data: {
      members: {
        delete: {
          studentEmail_clubName: {
            studentEmail: user.email,
            clubName,
          },
        },
      },
    },
  });

  return null;
}
