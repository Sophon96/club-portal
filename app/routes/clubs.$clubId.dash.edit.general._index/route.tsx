/* FIXME: 2024-09-22 There is much to be done
 * 1. The upload functionality is not present (backend and frontend)
 * 2. Need to figure out a way to store the order of images (probably in Mongo)
 * 3. Need to implement admin approval of changes.
 * Overall, this should take a high priority after club fair.
 * A lot of the work was being done in `image-edit.tsx`
 */

import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { prisma } from "~/db.server";
import { isValidObjectId } from "~/lib/utils";
import { notReady } from "~/lib/utils.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Editing ${data?.club.name} | DSHS Clubs` }];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  notReady()({ request });

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
  });

  if (!club) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  // Manually convert the dates to strings so we can send them across JSON
  const meetingsWithStringDates = club.meetings.map((mtg) => {
    return {
      ...mtg,
      schedule: {
        ...mtg.schedule,
        rdates: mtg.schedule.rdates.map((date) => date.toISOString()),
        exdates: mtg.schedule.exdates.map((date) => date.toISOString()),
      },
    };
  });

  return json({
    club: { ...club, meetings: meetingsWithStringDates },
  });
}
// 2024-09-08: create club edit page (for club pres feedback)

export default function ClubEditIndex() {
  const { club } = useLoaderData<typeof loader>();

  return (
    <>
      <Form method="POST">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={club.description}
          className="mt-1"
        />
        <Button variant="default" type="submit" className="mt-2">
          Submit
        </Button>
      </Form>
    </>
  );
}
