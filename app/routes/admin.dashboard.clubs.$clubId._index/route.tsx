import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import {
  Calendar,
  CalendarMinus,
  CalendarOff,
  CalendarPlus,
  Clock,
  MapPin,
  Pencil,
  Plus,
} from "lucide-react";
import { authenticator } from "~/auth.server";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Muted } from "~/components/ui/typography";
import { prisma } from "~/db.server";
import { formatDate, formatDuration, isValidObjectId } from "~/lib/utils";
import { assembleRRuleSet, formatRRule } from "~/rrule";
import { getPresignedUrl } from "~/s3.server";
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
    include: { meetings: true },
  });
  if (!club) {
    throw new Response(null, { status: 404 });
  }

  let bannerUrl: string | null = null;
  if (club.bannerImage) {
    try {
      bannerUrl = await getPresignedUrl(`${club.id}/banner.webp`);
    } catch (err) {
      // FIXME: handle this better later?
      throw err;
    }
  }

  const galleryImagesRecs = await prisma.galleryImage
    .findMany({
      where: { clubId: club.id },
      orderBy: { index: "asc" },
    })
    .then((val) => val.map((rec) => ({ ...rec, size: rec.size.toString() })));
  const galleryImageUrls = Promise.all(
    galleryImagesRecs.map(async (rec) => {
      const key = `/${params.clubId}/gallery/${rec.name}`;
      const url = await getPresignedUrl(key);
      return url;
    }),
  );

  // let pendingBannerUrl: string | null
  // if (club.pendingChanges)

  return { club: { ...club, bannerUrl, galleryImagesRecs, galleryImageUrls } };
};

export default function () {
  const { club } = useLoaderData<typeof loader>();

  const meetings = club.meetings.map((mtg) => {
    // Remember when we turned the dates into strings in the loader?
    // Time to turn them back into Date objects.
    const rdates = mtg.schedule.rdates.map((date) => new Date(date));
    const exdates = mtg.schedule.exdates.map((date) => new Date(date));
    const schedule = assembleRRuleSet({ ...mtg.schedule, rdates, exdates });
    return { ...mtg, schedule };
  });

  return (
    <>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">Editing Club</h2>
      <Muted>Make changes to this club. Click submit when done.</Muted>
      <Form method="PUT" className="mt-4">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={club.name} />
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={club.description}
        />
        <Button type="submit" className="mt-2">
          Submit
        </Button>
      </Form>
      <Card className="mt-4 border-none bg-muted">
        <CardHeader>
          <CardTitle>Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <Link to="meetings">
            <Button variant="default" className="rounded-full">
              <Pencil className="mr-2 size-[1.2rem]" />
              Edit meetings
            </Button>
          </Link>
          <div className="mt-4 flex flex-col gap-4">
            {meetings.map((meeting, i) => (
              // FIXME: extract this to a component
              <MeetingCard meeting={meeting} key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4 border-none bg-muted">
        <CardHeader>
          <CardTitle>Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="rounded-full">
            <Plus className="mr-2 size-[1.2rem]"/>
          </Button>
          <div className="mt-4 flex flex-col gap-4">
            
          </div>
        </CardContent>
      </Card>
    </>
  );
}
