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
import { getGalleryImageNetSize } from "~/lib/utils.server";
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
    id: z.string().refine(isValidObjectId),
  });
  const parsedForm = formSchema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parsedForm.success) {
    return {
      success: false,
      error: parsedForm.error.issues,
      errorMessage: "invalid data",
    };
  }

  type ImageWithName = Prisma.GalleryImageGetPayload<{
    select: { name: true };
  }>;

  let rec: ImageWithName | null = null;

  try {
    rec = await prisma.galleryImage.delete({
      where: { clubId: params.clubId, id: parsedForm.data.id },
      select: { name: true },
    });
  } catch (err) {
    // if the problem is that we can't find it, we just return that
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return {
        success: false,
        error: err,
        errorMessage: "image not found",
      };
    } else {
      // otherwise, it's not our problem.
      throw err;
    }
  }

  const key = `${params.clubId}/gallery/${rec.name}`;
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      }),
    );
  } catch (err) {
    if (err instanceof Error && err.name === "NoSuchKey") {
      // this is not an issue, because it's possible that the image is recorded
      // in MongoDB, but there's no image in S3. Thus, we can continue to
      // delete the record from MongoDB
      // throw {
      //   success: false,
      //   error: parsedForm.data.key,
      //   errorMessage: "image not found",
      // };
    }
    console.error("Error deleting object:", err);
    return {
      success: false,
      error: err,
      errorMessage: "unknown S3 error",
    };
  }

  return { success: true, error: null, errorMessage: null };
};
