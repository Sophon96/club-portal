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
import {
  getGalleryImageNetSize,
  tryCreateGalleryImage,
} from "~/lib/utils.server";
import { s3Client } from "~/s3.server";

/* This is a resource route for uploading a new image. This route is called when submitting a new image to get a presigned PUT url */
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
    size: z.number().int().gt(0),
    name: z.string().regex(/^[a-zA-Z0-9_-]+$/),
    alt: z.string(),
  });
  const parsedForm = formSchema.safeParse(await request.json());
  if (!parsedForm.success) {
    return {
      success: false,
      error: parsedForm.error.issues,
      errorMessage: "invalid data",
    };
  }

  const newImage = await tryCreateGalleryImage(
    params.clubId,
    parsedForm.data.name,
    parsedForm.data.alt,
    parsedForm.data.size,
  );
  if (!newImage) {
    return {
      success: false,
      error: parsedForm.data.name,
      errorMessage: "name must be unique",
    };
  }

  const galleryImageSize = await getGalleryImageNetSize({ id: params.clubId });
  if (galleryImageSize > BigInt(process.env.GALLERY_IMAGE_QUOTA!)) {
    await prisma.galleryImage.delete({ where: newImage });
    throw new Response(null, { status: 413, statusText: "Content Too Large" });
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `${params.clubId}/gallery/${newImage.name}`,
    ContentLength: parsedForm.data.size,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 600,
    });
    return {
      success: true,
      url: signedUrl,
    };
  } catch (err) {
    console.error("Error generating presigned URL", err);
    throw err;
  }
};
