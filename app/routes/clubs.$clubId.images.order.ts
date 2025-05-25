import { ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import { prisma } from "~/db.server";
import { isValidObjectId } from "~/lib/utils";

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
    ids: z.array(z.string().refine(isValidObjectId)),
  });
  const parsedForm = formSchema.safeParse(await request.json());
  if (!parsedForm.success) {
    throw json(parsedForm.error.issues, {
      status: 400,
      statusText: "Bad Request",
    });
  }

  // check to ensure that the new order is not adding/removing any images
  // race condition technically, but it should never happen
  const currentImages = await prisma.club.findUnique({
    where: { id: params.clubId },
    select: {
      galleryImages: { select: { id: true }, where: { status: "APPROVED" } },
    },
  });
  if (!currentImages) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  const currentSortedIds = currentImages.galleryImages
    .map((val) => val.id)
    .toSorted();
  const newSortedIds = parsedForm.data.ids.toSorted();
  if (currentSortedIds.length !== newSortedIds.length) {
    return {
      success: false,
      error: "images do not match with database records",
    };
    // throw new Response(null, { status: 400, statusText: "Bad Request" });
  }

  const elementsMatch = currentSortedIds.every(
    (value, index) => value === newSortedIds[index],
  );
  if (!elementsMatch) {
    return {
      success: false,
      error: "images do not match with database records",
    };
    // throw new Response(null, { status: 400, statusText: "Bad Request" });
  }

  // if we've made it here, the images match

  await prisma.club.update({
    where: { id: params.clubId },
    data: {
      galleryImages: {
        updateMany: parsedForm.data.ids.map((id, index) => {
          return { where: { id }, data: { index } };
        }),
      },
    },
  });
  return { success: true, error: null };
};
