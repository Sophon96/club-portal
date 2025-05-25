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

/* FIXME: Delete (unused) */
export const action = async ({ params, request }: ActionFunctionArgs) => {
  throw new Response(null, { status: 410 });
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
  });
  const parsedForm = formSchema.safeParse(await request.json());
  if (!parsedForm.success) {
    throw json(parsedForm.error.issues, {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `${params.clubId}/newBanner`,
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
