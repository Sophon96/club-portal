/* FIXME: 2024-09-22 There is much to be done
 * 1. The upload functionality is not present (backend and frontend)
 * 2. Need to figure out a way to store the order of images (probably in Mongo)
 * 3. Need to implement admin approval of changes.
 * Overall, this should take a high priority after club fair.
 * A lot of the work was being done in `image-edit.tsx`
 */

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ImageOff } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { prisma } from "~/db.server";
import { cn, isValidObjectId } from "~/lib/utils";
import { notReady } from "~/lib/utils.server";
import { getPresignedUrl, s3Client } from "~/s3.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `General | Editing ${data?.club.name} | DSHS Clubs` }];
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
    throw redirect("../../../");
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

  let bannerUrl: string | null = null;
  if (club.bannerImage) {
    bannerUrl = await getPresignedUrl(`${club.id}/banner.webp`);
  }

  // FIXME: unused and outdated
  /* // Manually convert the dates to strings so we can send them across JSON
  const meetingsWithStringDates = club.meetings.map((mtg) => {
    return {
      ...mtg,
      schedule: {
        ...mtg.schedule,
        rdates: mtg.schedule.rdates.map((date) => date.toISOString()),
        exdates: mtg.schedule.exdates.map((date) => date.toISOString()),
      },
    };
  }); */

  return json({
    club: { ...club, bannerUrl },
  });
}
// 2024-09-08: create club edit page (for club pres feedback)
// 2025-02-10: not sure what ^ means. remove comment?

export const action = async ({
  request,
  params,
}: ActionFunctionArgs): Promise<
  | { success: true; error: null; signedUrl: string }
  | { success: false; error: string }
> => {
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
    throw redirect("../../../");
  }

  const club = await prisma.club.findUnique({ where: { id: params.clubId } });
  if (!club) {
    throw new Response(null, { status: 404 });
  }

  if (club.pendingChanges) {
    return { success: false, error: "there are already changes under review" };
  }

  const formData = await request.formData();
  const schema = z.object({
    name: z.string(),
    description: z.string(),
    size: z.number().int().gt(0),
  });
  const parsedForm = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsedForm.success) {
    return { success: false, error: "invalid data" };
  }

  await prisma.club.update({
    where: { id: params.clubId },
    data: {
      newName: parsedForm.data.name,
      newDescription: parsedForm.data.description,
      pendingChanges: true,
    },
  });

  /* Get presigned URL for uploading image */
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `${params.clubId}/newBanner`,
    ContentLength: parsedForm.data.size,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 600,
    });
    return { success: true, error: null, signedUrl };
  } catch (err) {
    console.error("Error generating presigned URL", err);
    return { success: false, error: "failed to upload image" };
  }
};

export default function ClubEditIndex() {
  const { club } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const uploadImageSrc = useMemo(
    () => uploadImage && URL.createObjectURL(uploadImage),
    [uploadImage],
  ); // FIXME: is this useMemo doing anything?
  const [nameValue, setNameValue] = useState(club.name);
  const [descriptionValue, setDescriptionValue] = useState(club.description);
  const [submitTriggered, setSubmitTriggered] = useState(false);
  const [toastId, setToastId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!actionData || !submitTriggered || !toastId) {
      return;
    }
    if (actionData.success) {
      if (uploadImage) {
        fetch(actionData.signedUrl, { method: "PUT", body: uploadImage }).then(
          (resp) => {
            if (resp.ok) {
              toast.success("Changes submitted!", { id: toastId });
            } else {
              toast.error("Failed to upload new banner image!", {
                id: toastId,
              });
            }
            setToastId(null);
          },
        );
      } else {
        toast.success("Changes submitted!", { id: toastId });
      }
    } else {
      toast.error(`Failed to submit changes! Error: ${actionData.error}`, {
        id: toastId,
      });
    }
    setToastId(null);
    setSubmitTriggered(false);
  }, [actionData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    /* Two step process: upload the new banner image (get presigned url, PUT to it), then let the browser submit everything else */
    if (uploadImage) {
      const toastId = toast.loading("Uploading banner image...");
      const data = {
        size: uploadImage.size,
      };

      let resp;
      try {
        resp = await fetch("../../images/banner", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("fetch to get presigned PUT url failed");
        console.error(error);
        toast.error("An error was encountered while uploading the image.", {
          id: toastId,
        });
        return;
      }

      const respJson = await resp.json();
      const parsedResp = z.string().url().safeParse(respJson);
      if (parsedResp.success) {
        try {
          await fetch(parsedResp.data, {
            method: "PUT",
            body: uploadImage,
          });
          toast.success("Image successfully uploaded!", { id: toastId });
        } catch (error) {
          console.error("fetch to presigned PUT url failed");
          console.error(error);
          toast.error("An error was encountered while uploading the image.", {
            id: toastId,
          });
        }
      } else {
        console.error("failed to parse returned presigned PUT url");
        console.error(parsedResp.error.issues);
        toast.error("An error was encountered while uploading the image.", {
          id: toastId,
        });
      }
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row">
        {/* <div className="min-h-full"> */}
        {/* <div className=""> */}
        <Form
          method="POST"
          onSubmit={(e) => {
            setSubmitTriggered(true);
            setToastId(toast.loading("Submitting changes..."));
          }}
          className="flex-1"
        >
          <fieldset disabled={club.pendingChanges}>
            {uploadImageSrc ? (
              <img
                src={uploadImageSrc}
                className="aspect-[4/3] max-h-96 max-w-96 rounded bg-muted object-contain"
              />
            ) : (
              <Card className="flex aspect-square max-h-96 max-w-96 flex-col items-center justify-center text-muted-foreground">
                {/* <CardContent className="flex h-full w-full flex-col items-center justify-center p-0 text-muted-foreground"> */}
                <ImageOff className="w-1/3" />
                No Image
                {/* </CardContent> */}
              </Card>
            )}
            <Label htmlFor="banner">Image</Label>
            <Input
              id="banner"
              type="file"
              accept="image/*"
              onChange={(event) => {
                if (event.target.files && event.target.files[0]) {
                  // FIXME: 4 MB max size for banner image
                  if (event.target.files[0].size > 4194304) {
                    // file too big
                    toast.error(
                      "Sorry, your image is too big. The max size is 4 MiB.",
                    );
                    return;
                  }
                  setUploadImage(event.target.files[0]);
                }
              }}
              className="cursor-pointer"
            />
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={nameValue}
              onChange={(e) => setNameValue(e.currentTarget.value)}
            />
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.currentTarget.value)}
              className="mt-1"
            />
            <Button variant="default" type="submit" className="mt-2">
              Submit
            </Button>
          </fieldset>
        </Form>
        {/* </div> */}
        {/* </div> */}
        <ClubPreview
          id={club.id}
          name={nameValue}
          description={descriptionValue}
          bannerUrl={uploadImageSrc || club.bannerUrl}
        />
      </div>
    </>
  );
}

const ClubPreview = ({
  id,
  bannerUrl,
  name,
  description,
}: {
  id: string;
  bannerUrl: string | null;
  name: string;
  description: string;
}) => {
  // only take the last two digits of the ID to prevent precision loss
  const idAsNum = parseInt(id.slice(-2), 16);
  // Every tailwindcss color
  const colorClassNames = [
    "bg-slate-200 dark:bg-slate-700",
    "bg-gray-200 dark:bg-gray-700",
    "bg-zinc-200 dark:bg-zinc-700",
    "bg-stone-200 dark:bg-stone-700",
    "bg-red-200 dark:bg-red-700",
    "bg-orange-200 dark:bg-orange-700",
    "bg-amber-200 dark:bg-amber-700",
    "bg-yellow-200 dark:bg-yellow-700",
    "bg-lime-200 dark:bg-lime-700",
    "bg-green-200 dark:bg-green-700",
    "bg-emerald-200 dark:bg-emerald-700",
    "bg-teal-200 dark:bg-teal-700",
    "bg-cyan-200 dark:bg-cyan-700",
    "bg-sky-200 dark:bg-sky-700",
    "bg-blue-200 dark:bg-blue-700",
    "bg-indigo-200 dark:bg-indigo-700",
    "bg-violet-200 dark:bg-violet-700",
    "bg-purple-200 dark:bg-purple-700",
    "bg-fuchsia-200 dark:bg-fuchsia-700",
    "bg-pink-200 dark:bg-pink-700",
    "bg-rose-200 dark:bg-rose-700",
  ];

  return (
    <Card className="flex h-60 min-h-0 w-full max-w-sm flex-col overflow-hidden">
      {bannerUrl ? (
        <img
          className="h-24 w-full flex-shrink-0 object-cover sm:mx-0"
          src={bannerUrl}
        />
      ) : (
        <div
          className={cn(
            "h-24 w-full flex-shrink-0 sm:mx-0",
            colorClassNames[idAsNum % colorClassNames.length],
          )}
        />
      )}
      <CardHeader className="flex min-h-0 flex-grow flex-col">
        <CardTitle>{name}</CardTitle>
        <CardDescription className="line-clamp-3 flex-grow">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
