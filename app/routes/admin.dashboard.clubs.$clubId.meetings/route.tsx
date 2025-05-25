import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { Muted } from "~/components/ui/typography";
import { prisma } from "~/db.server";
import { isValidObjectId } from "~/lib/utils";
import { assembleRRuleSet } from "~/rrule";
import { MeetingCard } from "./meeting-card";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user || user.type !== "admin") {
    throw new Response(null, { status: 404 });
  }

  if (!params.clubId || !isValidObjectId(params.clubId)) {
    throw new Response(null, { status: 404 });
  }

  const club = await prisma.club.findUnique({
    where: { id: params.clubId },
    select: { meetings: true },
  });
  if (!club) {
    throw new Response(null, { status: 404 });
  }

  return { meetings: club.meetings };
};

export default function () {
  const { meetings } = useLoaderData<typeof loader>();

  const modifiedMeetings = meetings.map((meeting) => ({
    ...meeting,
    schedule: assembleRRuleSet({
      ...meeting.schedule,
      rdates: meeting.schedule.rdates.map((dt) => new Date(dt)),
      exdates: meeting.schedule.exdates.map((dt) => new Date(dt)),
    }),
  }));

  return (
    <>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">Edit Meetings</h2>
      <Muted>Choose a meeting to edit.</Muted>
      {modifiedMeetings.map((meeting) => (
        <MeetingCard meeting={meeting} key={meeting.id} />
      ))}
    </>
  );
}
