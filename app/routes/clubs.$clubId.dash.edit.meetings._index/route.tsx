import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import { Muted } from "~/components/ui/typography";
import { prisma } from "~/db.server";
import { isValidObjectId } from "~/lib/utils";
import { MeetingCard } from "./meeting-card";
import { assembleRRuleSet } from "~/rrule";
import { Button } from "~/components/ui/button";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // Generic auth check block
  if (!isValidObjectId(params.clubId!)) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const officerOrAdvisor = await checkIsOfficerOrAdvisor(user, {
    id: params.clubId,
  });

  if (!officerOrAdvisor) {
    throw redirect("../");
  }

  const club = await prisma.club.findUnique({
    where: { id: params.clubId },
    select: { name: true, meetings: true },
  });

  if (!club) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return { club };
};

export default function ClubMeetingEdit() {
  const { club } = useLoaderData<typeof loader>();

  const meetingsWithDates = club.meetings.map((mtg) => ({
    ...mtg,
    schedule: assembleRRuleSet({
      ...mtg.schedule,
      rdates: mtg.schedule.rdates.map((dt) => new Date(dt)),
      exdates: mtg.schedule.exdates.map((dt) => new Date(dt)),
    }),
  }));

  return (
    <>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">Edit Meetings</h2>
      <Muted>Choose a meeting to edit or add a new meeting.</Muted>
      <Link to="new">
        <Button className="mb-4 mt-2">New Meeting</Button>
      </Link>
      <ul className="justify-left flex flex-row flex-wrap gap-2">
        {meetingsWithDates.map((mtg) => (
          <li key={mtg.id}>
            <MeetingCard meeting={mtg} />
          </li>
        ))}
      </ul>
    </>
  );
}
