import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { prisma } from "~/db.server";
import { isValidObjectId } from "~/lib/utils";

export async function action({ params, request }: ActionFunctionArgs) {
  if (!isValidObjectId(params.clubId!)) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // Kinda unintuitive but we want to avoid selecting Members because of the awkward compound unique key
  const student = await prisma.student.findUnique({
    where: { email: user.email },
    select: { memberships: { where: { club: { id: params.clubId } } } },
  });

  // Already in club, throw error
  if (student?.memberships.length) {
    throw new Response(null, {
      status: 409,
      statusText: "User is already in the club"
    })
  }

  return null;
}
