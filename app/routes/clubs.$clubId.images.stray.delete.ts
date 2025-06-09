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
import { getGalleryImageNetSize, isValidStrayKey } from "~/lib/utils.server";
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
      errorMessage: "invalid key or key in database"
    })
  }

  try {
    await s3Client.send(
      new DeleteObjectCommand({
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
    console.error("Error deleting object:", err);
    return json({
      success: false,
      error: err,
      errorMessage: "unknown S3 error",
    });
  }

  return { success: true, error: null, errorMessage: null };
};
