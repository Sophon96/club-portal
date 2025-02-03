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

  const formSchema = z.object({ size: z.number().int().gt(0) });
  const parsedForm = formSchema.safeParse(await request.json());
  if (!parsedForm.success) {
    throw json(parsedForm.error.issues, {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const currentIndex = await prisma.galleryImage.count({
    where: { club: { id: params.clubId } },
  });

  const newImage = await prisma.galleryImage.create({
    data: {
      club: { connect: { id: params.clubId } },
      size: parsedForm.data.size,
      index: currentIndex,
    },
    select: { id: true },
  });

  const galleryImageSize = await getGalleryImageNetSize({ id: params.clubId });
  if (galleryImageSize > BigInt(process.env.GALLERY_IMAGE_QUOTA!)) {
    await prisma.galleryImage.delete({ where: newImage });
    throw new Response(null, { status: 413, statusText: "Content Too Large" });
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `${params.clubId}/gallery/${newImage.id}`,
    ContentLength: parsedForm.data.size,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 600,
    });
    return signedUrl;
  } catch (err) {
    console.error("Error generating presigned URL", err);
    throw err;
  }
};
