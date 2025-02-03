import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ActionFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { z } from "zod";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import { prisma } from "~/db.server";
import { isValidObjectId } from "~/lib/utils";
import { getGalleryImageNetSize } from "~/lib/utils.server";
import { s3Client } from "~/s3.server";

/* This is a resource route for modifying images in the edit page */
export const action = async ({ params, request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const isAuthorized = await checkIsOfficerOrAdvisor(user, {
    id: params.clubId,
  });
  if (!isAuthorized) {
    throw new Response(null, { status: 403, statusText: "Forbidden" });
  }

  if (!params.clubId || !isValidObjectId(params.clubId)) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  const formSchema = z.object({
    key: z.string(),
    name: z.string(),
    alt: z.string(),
  });
  const parsedForm = formSchema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parsedForm.success) {
    throw json(parsedForm.error.issues, {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const keyMatch = parsedForm.data.key.match(/^([0-9a-f]{24})\/gallery\/(.*)$/);
  if (!keyMatch) {
    throw new Response("invalid key", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const keyClubId = keyMatch.at(1);
  const keyImageId = keyMatch.at(2);
  invariant(
    keyClubId && keyImageId,
    "stray image key parsing regex somehow got undefined for capture groups",
  );

  // Make sure the image actually belongs to the club and make sure that the
  // image isn't already registered in MongoDB
  // These checks are kinda stupid because they rely on the format of the S3 keys
  if (keyClubId !== params.clubId) {
    throw new Response("image does not belong to specified club", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  if (
    isValidObjectId(keyImageId) &&
    (await prisma.galleryImage.findUnique({ where: { id: keyImageId } }))
  ) {
    throw new Response("image exists in db", {
      status: 422,
      statusText: "Unprocessable Entity",
    });
  }

  // Let's make sure the image does exist in S3
  let s3Resp;
  try {
    s3Resp = await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: parsedForm.data.key,
      }),
    );
  } catch (err) {
    if (err instanceof Error && err.name === "NoSuchKey") {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    console.error("Error heading object to check if it exists:", err);
    throw err;
  }

  if (typeof s3Resp.ContentLength === "undefined") {
    console.error("HeadObjectCommand returned `undefined` for ContentLength");
    throw new Response(null, { status: 500 });
  }

  const currentIndex = await prisma.galleryImage.count({
    where: { club: { id: params.clubId } },
  });

  const newImage = await prisma.galleryImage.create({
    data: {
      club: { connect: { id: params.clubId } },
      name: parsedForm.data.name,
      alt: parsedForm.data.alt,
      index: currentIndex,
      size: s3Resp.ContentLength,
    },
    select: { id: true },
  });

  const galleryImageSize = await getGalleryImageNetSize({ id: params.clubId });
  if (galleryImageSize > BigInt(process.env.GALLERY_IMAGE_QUOTA!)) {
    await prisma.galleryImage.delete({ where: newImage });
    throw new Response(null, { status: 413, statusText: "Content Too Large" });
  }

  // time to move the object
  // except s3 doesn't have a moveobject command, so we copy and then delete it
  try {
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: process.env.S3_BUCKET,
        CopySource: `${process.env.S3_BUCKET}/${parsedForm.data.key}`,
        Key: `${params.clubId}/gallery/${newImage.id}`,
      }),
    );
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: parsedForm.data.key,
      }),
    );
  } catch (err) {
    console.error("Error moving object after registering stray image:", err);
    // delete the db record
    await prisma.galleryImage.delete({ where: { id: newImage.id } });
    throw err;
  }

  return null;
};
