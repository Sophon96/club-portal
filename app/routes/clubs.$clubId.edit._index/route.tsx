/* FIXME: 2024-09-22 There is much to be done
 * 1. The upload functionality is not present (backend and frontend)
 * 2. Need to figure out a way to store the order of images (probably in Mongo)
 * 3. Need to implement admin approval of changes.
 * Overall, this should take a high priority after club fair.
 * A lot of the work was being done in `image-edit.tsx`
 */

import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { H2 } from "~/components/ui/typography";
import { prisma } from "~/db.server";
import { getPresignedUrl, s3Client } from "~/s3.server";
import ImageEdit from "./image-edit";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Editing ${data?.club.name} | DSHS Clubs` }];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
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

  // Get gallery images from S3
  const galleryObjects = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      Prefix: `${club.id}/gallery/`,
    })
  );

  let galleryImageUrls: (string | null)[];
  if (typeof galleryObjects.Contents === "undefined") {
    console.error("No contents returned for gallery images");
    galleryImageUrls = [];
  } else {
    galleryImageUrls = await Promise.all(
      galleryObjects.Contents.map((obj) => {
        if (obj.Key) {
          return getPresignedUrl(obj.Key);
        } else {
          console.error("No key returned for gallery image");
          return null;
        }
      })
    );
  }

  return json({
    club: { ...club, meetings: meetingsWithStringDates },
    galleryImageUrls,
  });
}
// 2024-09-08: create club edit page (for club pres feedback)

export default function ClubEditIndex() {
  const { club, galleryImageUrls } = useLoaderData<typeof loader>();
  const [images, setImages] = useState(galleryImageUrls);

  return (
    <>
      <main className="w-screen p-4 md:px-16">
        <div className="flex flex-col md:flex-row gap-4 md:gap-12 ">
          <div className="basis-1/2 flex flex-row gap-2 flex-wrap justify-center">
            <ImageEdit images={images} />
          </div>
          <div className="basis-1/2">
            <Form method="POST">
              <H2>{club.name}</H2>
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
          </div>
        </div>
      </main>
    </>
  );
}
