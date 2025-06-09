import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import { prisma } from "~/db.server";
import { isValidObjectId } from "~/lib/utils";
import { getPresignedUrl, s3Client } from "~/s3.server";

// FIXME: currently unused
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

  if (
    !params.clubId ||
    !params.imageId ||
    !isValidObjectId(params.clubId) ||
    !isValidObjectId(params.imageId)
  ) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  // Make sure the image actually belongs to the club
  const image = await prisma.galleryImage.findUnique({
    where: { id: params.imageId },
    select: { clubId: true, name: true },
  });
  if (!image) {
    // the image with id=imageId doesn't exist
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }
  if (image.clubId !== params.clubId) {
    throw new Response(null, { status: 403, statusText: "Forbidden" });
  }

  const parsedData = z
    .object({ size: z.number().int().gt(0) })
    .safeParse(Object.fromEntries(await request.formData()));
  if (!parsedData.success) {
    throw json(parsedData.error.issues, {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `${params.clubId}/gallery/${image.name}`,
    ContentLength: parsedData.data.size
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    return signedUrl;
  } catch (err) {
    console.error("Error generating presigned URL", err);
    throw err;
  }
};
