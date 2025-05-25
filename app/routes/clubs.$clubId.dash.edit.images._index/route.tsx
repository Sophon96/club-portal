import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { getPresignedUrl, s3Client } from "~/s3.server";
import ImageEdit from "./image-edit";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { H1, H2, H3, Muted } from "~/components/ui/typography";
import { StrayImageEdit } from "./stray-image-edit";
import ImageUpload from "./image-upload";
import { isValidObjectId } from "~/lib/utils";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import { notReady } from "~/lib/utils.server";
import { PendingImages } from "./pending-images";
import { RejectedImages } from "./rejected-images";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Images | Editing ${data?.name} | DSHS Clubs`,
    },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  // FIXME:
  notReady()({ request });

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
    select: { name: true, galleryImages: { orderBy: { index: "asc" } } },
  });

  if (!club) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  // Get gallery images from S3
  // If no gallery images (undefined returned), coalesce into empty array
  // If gallery image key is defined, I have no idea why, so just log an error
  const galleryImageKeys = await s3Client
    .send(
      new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET,
        Prefix: `${params.clubId}/gallery/`,
      }),
    )
    .then(
      (objs) =>
        objs.Contents?.map((obj) => obj.Key).filter((key): key is string => {
          if (typeof key === "string") return true;
          console.error("Gallery image key was `undefined`");
          return false;
        }) ?? [],
    );

  // Functionality for reconciling disparities between S3 and database
  // Images in MongoDB are "known" (even if they aren't in S3)
  // Images in S3, but not in MongoDB are "stray"
  const knownGalleryImageRecords = club.galleryImages;

  const knownGalleryImageKeys = knownGalleryImageRecords.map(
    (rec) => `${rec.clubId}/gallery/${rec.id}`,
  );

  const knownGalleryImageIds = knownGalleryImageRecords.map((rec) => rec.id);
  console.log(knownGalleryImageIds);

  console.log("known keys", knownGalleryImageKeys);
  console.log("s3 keys", galleryImageKeys);

  // FIXME: This is O(N*M), but apparently ECMA didn't think to include set
  // operations in the original spec for Sets (ES6)
  const strayGalleryImageKeys = galleryImageKeys.filter(
    (key) => !knownGalleryImageKeys.includes(key),
  );

  // If an image recorded in Mongo doesn't actually exist in s3, don't try to
  // get a presigned url for it
  let approvedGalleryImages: {
    [key: string]: { name: string; alt: string; url: string | null };
  } = {};
  let pendingGalleryImages: {
    [key: string]: { name: string; alt: string; url: string | null };
  } = {};
  let rejectedGalleryImages: {
    [key: string]: { name: string; alt: string; url: string | null };
  } = {};
  for (const rec of knownGalleryImageRecords) {
    const key = `${rec.clubId}/gallery/${rec.id}`;
    const presignedUrl = galleryImageKeys.includes(key)
      ? await getPresignedUrl(key)
      : null;
    switch (rec.status) {
      case "PENDING":
        pendingGalleryImages[rec.id] = {
          name: rec.name,
          alt: rec.alt,
          url: presignedUrl,
        };
        break;
      case "APPROVED":
        approvedGalleryImages[rec.id] = {
          name: rec.name,
          alt: rec.alt,
          url: presignedUrl,
        };
        break;
      case "REJECTED":
        rejectedGalleryImages[rec.id] = {
          name: rec.name,
          alt: rec.alt,
          url: presignedUrl,
        };
        break;
    }
  }

  const approvedGalleryImageIds = knownGalleryImageIds.filter((value) =>
    Object.keys(approvedGalleryImages).includes(value),
  );
  const pendingGalleryImageIds = knownGalleryImageIds.filter((value) =>
    Object.keys(pendingGalleryImages).includes(value),
  );
  const rejectedGalleryImageIds = knownGalleryImageIds.filter((value) =>
    Object.keys(rejectedGalleryImages).includes(value),
  );

  // const galleryImageUrls = await Promise.all(
  //   galleryImageKeys.map((obj) => getPresignedUrl(obj)),
  // );

  const strayGalleryImages = await Promise.all(
    strayGalleryImageKeys.map(async (objKey) => {
      return { objKey, url: await getPresignedUrl(objKey) };
    }),
  );

  return {
    approvedGalleryImages,
    pendingGalleryImages,
    rejectedGalleryImages,
    approvedGalleryImageIds,
    pendingGalleryImageIds,
    rejectedGalleryImageIds,
    strayGalleryImages,
    name: club.name,
  };
}

export default function ClubDashboardEditImages() {
  const {
    approvedGalleryImages,
    pendingGalleryImages,
    rejectedGalleryImages,
    approvedGalleryImageIds,
    pendingGalleryImageIds,
    rejectedGalleryImageIds,
    strayGalleryImages,
  } = useLoaderData<typeof loader>();

  return (
    <>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">Edit Images</h2>
      <Muted>Upload, modify, or delete images. Click submit when done.</Muted>
      <ImageUpload />
      {/* <h3 className="mb-2 mt-4 text-xl font-semibold tracking-tighter">
        Gallery Images
      </h3>
      <Muted>
        Click an image to edit its metadata. Drag the dots to reorder images.
      </Muted>
      <ImageEdit
        imageIds={approvedGalleryImageIds}
        images={approvedGalleryImages}
      /> */}
      <div className="my-4 space-y-4">
        <Card className="border-none bg-muted">
          <CardHeader>
            <CardTitle>Gallery Images</CardTitle>
            <CardDescription>
              These images are displayed on your club's listing. Drag the dots
              to reorder images.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Pass a key so this component gets replaced whenever the key
            changes, so we don't need to deal with reconciling new or deleted
            images */}
            {/* Or don't because we can just hack around it in the component.
            This way I don't need to mess with the other functionality. */}
            <ImageEdit
              imageIds={approvedGalleryImageIds}
              images={approvedGalleryImages}
              // key={approvedGalleryImageIds.join()}
            />
          </CardContent>
        </Card>
        <Card className="border-none bg-muted">
          <CardHeader>
            <CardTitle>Pending Images</CardTitle>
            <CardDescription>
              These images are under review by admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PendingImages images={pendingGalleryImages} />
          </CardContent>
        </Card>
        <Card className="border-none bg-muted">
          <CardHeader>
            <CardTitle>Rejected Images</CardTitle>
            <CardDescription>
              These images were rejected by admin. Delete these images to free
              up space.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RejectedImages images={rejectedGalleryImages} />
          </CardContent>
        </Card>
        {strayGalleryImages.length > 0 && (
          <Card className="border-none bg-muted">
            <CardHeader>
              <CardTitle>Stray Images</CardTitle>
              <CardDescription>
                These images got lost in our database. Click on an image to
                register it to the database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StrayImageEdit images={strayGalleryImages} />
            </CardContent>
          </Card>
        )}
        {/* <h3 className="mb-2 mt-4 text-xl font-semibold tracking-tighter">
          Pending Images
        </h3>
        <Muted>These images are under review by admin.</Muted>
        <PendingImages images={pendingGalleryImages} />
        <h3 className="mb-2 mt-4 text-xl font-semibold tracking-tighter">
          Rejected Images
        </h3>
        <Muted>Images rejected by admin. Delete images to free up space.</Muted>
        <RejectedImages images={rejectedGalleryImages} />
        {strayGalleryImages.length > 0 ? (
          <>
            <h3 className="mb-2 mt-4 text-xl font-semibold tracking-tighter">
              Stray Images
            </h3>
            <StrayImageEdit images={strayGalleryImages} />
          </>
        ) : null} */}
      </div>
    </>
  );
}
