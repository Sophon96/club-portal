import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { authenticator } from "~/auth.server";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Muted, P } from "~/components/ui/typography";
import { prisma } from "~/db.server";
import { isValidObjectId } from "~/lib/utils";
import { getPresignedUrl, s3Client } from "~/s3.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user || user.type !== "admin") {
    throw new Response(null, { status: 404 });
  }

  const pendingImages = await prisma.galleryImage
    .findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    })
    .then((images) =>
      Promise.all(
        images.map(async (image) => {
          let presignedUrl;
          try {
            presignedUrl = await getPresignedUrl(
              `${image.clubId}/gallery/${image.id}`,
            );
          } catch (err) {
            console.warn(
              "admin images dashboard: got error when getting presigned url:",
              err,
            );
            if (err instanceof Error && err.name === "NoSuchKey") {
              presignedUrl = null;
            }
          }
          return {
            id: image.id,
            // name: image.name,
            alt: image.alt,
            url: presignedUrl,
          };
        }),
      ),
    );

  return { pendingImages };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user || user.type !== "admin") {
    throw new Response(null, { status: 404 });
  }

  const formData = await request.formData();
  const schema = z.object({
    id: z.string().refine(isValidObjectId),
    _action: z.literal("approve").or(z.literal("reject")),
  });

  const parsedForm = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsedForm.success) {
    return {
      success: false,
      error: parsedForm.error.issues,
    };
  }

  // if approved, simply change the status in MongoDB
  // if rejected, also delete the image from S3
  // FIXME: does this even work?
  const currentIndex = await prisma.galleryImage.count({
    where: { club: { galleryImages: { some: { id: parsedForm.data.id } } } },
  });

  const image = await prisma.galleryImage.update({
    where: { id: parsedForm.data.id },
    data: {
      status: parsedForm.data._action === "approve" ? "APPROVED" : "REJECTED",
      index: currentIndex,
    },
  });

  // FIXME: on second thought, let's let the club delete the image after they
  // see that it's been rejected.
  // if (parsedForm.data._action === "reject") {
  //   try {
  //     await s3Client.send(
  //       new DeleteObjectCommand({
  //         Bucket: process.env.S3_BUCKET!,
  //         Key: `${image.clubId}/gallery/${image.id}`,
  //       }),
  //     );
  //   } catch (err) {
  //     console.error(
  //       "admin image dashboard: got error when trying to delete rejected image:",
  //       err,
  //     );
  //     return { success: false, error: "s3" };
  //   }
  // }

  return { success: true, error: null };
};

export default function AdminDashboardImages() {
  const { pendingImages } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [toastId, setToastId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!actionData || !toastId) {
      return;
    }

    if (actionData.success) {
      toast.success("Successfully updated image!", { id: toastId });
      setToastId(null);
    } else {
      console.error(
        "error encountered while updating image:",
        actionData.error,
      );
      toast.error(
        "An error was encountered while attempting to update the image. Please try again.",
        { id: toastId },
      );
      setToastId(null);
    }
  }, [actionData]);

  return (
    <>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">Pending Images</h2>
      <Muted>
        These images are pending review and will be displayed in each club's
        listing. Click on an image to approve or reject it.
      </Muted>
      {pendingImages.length > 0 ? (
        <ul className="my-2 flex flex-row flex-wrap justify-center gap-2">
          {pendingImages.map((e) => (
            <Dialog key={e.url}>
              <DialogTrigger>
                <li>
                  <div className="flex flex-col items-center justify-center">
                    <Card className="relative flex aspect-[4/3] w-24 items-center justify-center overflow-hidden bg-muted lg:w-48">
                      {e.url ? (
                        <img
                          src={e.url}
                          className="size-full object-contain"
                          draggable={false}
                        />
                      ) : (
                        <p>No image</p>
                      )}
                    </Card>
                  </div>
                </li>
              </DialogTrigger>
              <DialogContent className="max-h-dvh overflow-y-scroll">
                <DialogHeader>
                  <DialogTitle>Reviewing Image</DialogTitle>
                  <DialogDescription>
                    Review the image and accompanying text and choose to approve
                    or reject the image. Click submit when done.
                  </DialogDescription>
                </DialogHeader>

                <Card className="overflow-hidden">
                  {e.url ? <img src={e.url} /> : <p>No Image</p>}
                </Card>

                {/* FIXME: name field is unused for now */}
                {/* <Label>Name</Label>
                <Input readOnly value={e.name}></Input> */}
                <Label>Alt Text</Label>
                <Input readOnly value={e.alt} />

                <Form
                  method="POST"
                  onSubmit={() => {
                    setToastId(toast.loading("Updating image..."));
                  }}
                  autoFocus
                >
                  <input type="hidden" name="id" value={e.id} />
                  <RadioGroup name="_action" autoFocus required>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="approve" id="approve-rg" />
                      <Label htmlFor="approve-rg">Approve</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reject" id="reject-rg" />
                      <Label htmlFor="reject-rg">Reject</Label>
                    </div>
                  </RadioGroup>
                  <DialogClose asChild>
                    <Button type="submit" className="mt-4">
                      Submit
                    </Button>
                  </DialogClose>
                </Form>
              </DialogContent>
            </Dialog>
          ))}
        </ul>
      ) : (
        <p className="text-lg font-semibold">No images for review</p>
      )}
    </>
  );
}
