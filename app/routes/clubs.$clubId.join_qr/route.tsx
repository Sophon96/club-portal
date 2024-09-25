import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx/lite";
import { CheckCircle, UserCircle } from "lucide-react";
import { authenticator } from "~/auth.server";
import { Large } from "~/components/ui/typography";
import { prisma } from "~/db.server";
import { isValidObjectId } from "~/lib/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Joining ${data?.name} | DSHS Clubs` }];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  if (!isValidObjectId(params.clubId!)) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

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

  const student = await prisma.student.findUnique({where: {email: user.email}})
  if (!student) {
    return json({name: club.name, onboardingNeeded: true, isMember: false})
  }

  // console.log(club)
  // more than zero members indicates that the user is already a member
  const isMember = club.members.length > 0;

  if (!isMember) {
    await prisma.member.create({
      data: {
        club: { connect: { id: params.clubId } },
        student: { connect: { email: user.email } },
      },
    });
  }

  return json({ name: club.name, isMember, onboardingNeeded: false });
};

export default function ClubJoinQR() {
  const { name, isMember, onboardingNeeded } = useLoaderData<typeof loader>();

  if (onboardingNeeded) {
    return <main className="w-screen min-h-full flex flex-col items-center justify-center">
      <UserCircle
        className={clsx(
          "size-1/4 aspect-square",
          "text-muted-foreground"
        )}
      />
      <Large className="text-4xl">
        Complete onboarding to join {name}.
      </Large>
    </main>
  }

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
