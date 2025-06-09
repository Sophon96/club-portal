import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { z } from "zod";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import { prisma } from "~/db.server";
import { isValidObjectId } from "~/lib/utils";
import { getGalleryImageNetSize, isValidStrayKey, tryCreateGalleryImage } from "~/lib/utils.server";
import { s3Client } from "~/s3.server";

/* This is a resource route for modifying images in the edit page */
export const action = async ({ params, request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (!params.clubId || !isValidObjectId(params.clubId)) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  const isAuthorized = await checkIsOfficerOrAdvisor(user, {
    id: params.clubId,
  });
  if (!isAuthorized) {
    throw new Response(null, { status: 403, statusText: "Forbidden" });
  }

  const formSchema = z.object({
    key: z.string(),
    name: z.string().regex(/^[a-zA-Z0-9_-]+$/),
    alt: z.string(),
  });
  const parsedForm = formSchema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parsedForm.success) {
    return json({
      success: false,
      error: parsedForm.error.issues,
      errorMessage: "invalid data",
    });
  }

  const validKey = await isValidStrayKey(params.clubId, parsedForm.data.key);
  if (!validKey) {
    return json({
      success: false,
      error: parsedForm.data.key,
      errorMessage: "invalid key or key in database",
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
      return json({
        success: false,
        error: parsedForm.data.key,
        errorMessage: "image not found",
      });
    }
    console.error("Error heading object to check if it exists:", err);
    return json({
      success: false,
      error: err,
      errorMessage: "unknown S3 error",
    });
  }

  if (typeof s3Resp.ContentLength === "undefined") {
    console.error("HeadObjectCommand returned `undefined` for ContentLength");
    throw new Response(null, { status: 500 });
  }

  // const currentIndex = await prisma.galleryImage.count({
  //   where: { club: { id: params.clubId } },
  // });

  type ImageWithIdName = Prisma.GalleryImageGetPayload<{
    select: { id: true; name: true };
  }>;

  const newImage = await tryCreateGalleryImage(params.clubId, parsedForm.data.name, parsedForm.data.alt, s3Resp.ContentLength)
  if (!newImage) {
    return {
      success: false,
      error: parsedForm.data.name,
      errorMessage: "Name must be unique"
    }
  }

  // FIXME: I don't think it's possible to exceed the max image size...
  // (I probably copied this logic from the upload handler)
  const galleryImageSize = await getGalleryImageNetSize({ id: params.clubId });
  if (galleryImageSize > BigInt(process.env.GALLERY_IMAGE_QUOTA!)) {
    await prisma.galleryImage.delete({ where: newImage });
    return json({
      success: false,
      error: null,
      errorMessage: "Image too big",
    });
    // new Response(null, { status: 413, statusText: "Content Too Large" });
  }

  // time to move the object
  // except s3 doesn't have a moveobject command, so we copy and then delete it
  try {
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: process.env.S3_BUCKET,
        CopySource: `${process.env.S3_BUCKET}/${parsedForm.data.key}`,
        Key: `${params.clubId}/gallery/${newImage.name}`,
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

  return { success: true, error: null, errorMessage: null };
};
