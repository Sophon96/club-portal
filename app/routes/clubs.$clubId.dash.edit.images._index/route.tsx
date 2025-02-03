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
  let knownGalleryImages: { [key: string]: string | null } = {};
  for (const rec of knownGalleryImageRecords) {
    const key = `${rec.clubId}/gallery/${rec.id}`;
    if (galleryImageKeys.includes(key)) {
      knownGalleryImages[rec.id] = await getPresignedUrl(key);
    } else {
      knownGalleryImages[rec.id] = null;
    }
  }

  // const galleryImageUrls = await Promise.all(
  //   galleryImageKeys.map((obj) => getPresignedUrl(obj)),
  // );

  const strayGalleryImages = await Promise.all(
    strayGalleryImageKeys.map(async (objKey) => {
      return { objKey, url: await getPresignedUrl(objKey) };
    }),
  );

  return {
    knownGalleryImages,
    knownGalleryImageIds,
    strayGalleryImages,
    name: club.name,
  };
}

export default function ClubDashboardEditImages() {
  const { knownGalleryImageIds, knownGalleryImages, strayGalleryImages } =
    useLoaderData<typeof loader>();

  return (
    <>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">Edit Images</h2>
      <Muted>Upload, modify, or delete images. Click submit when done.</Muted>
      <ImageUpload />
      <h3 className="mb-2 mt-4 text-xl font-semibold tracking-tighter">
        Gallery Images
      </h3>
      <Muted>
        Click an image to edit its metadata. Drag the dots to reorder images.
      </Muted>
      <ImageEdit imageIds={knownGalleryImageIds} images={knownGalleryImages} />
      {strayGalleryImages.length > 0 ? (
        <>
          <h3 className="mb-2 mt-4 text-xl font-semibold tracking-tighter">
            Stray Images
          </h3>
          <StrayImageEdit images={strayGalleryImages} />
        </>
      ) : null}
    </>
  );
}
