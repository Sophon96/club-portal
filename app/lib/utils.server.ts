import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Prisma } from "@prisma/client";
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";
import { s3Client } from "~/s3.server";

export const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.NETLIFY_CONTEXT === "production"; /* Set manually in Netlify */

/**
 * Loader function to indicate that the route is not ready for production use.
 * Remove when finished with implementation.
 */
export function notReady(): ({ request }: { request: Request }) => null;
export function notReady<T extends LoaderFunction>(
  func: T,
): (lfa: LoaderFunctionArgs) => ReturnType<T>;
export function notReady(func?: LoaderFunction) {
  if (func) {
    return (lfa: LoaderFunctionArgs) => {
      if (isProduction) {
        console.log("notReady loader hit:", lfa.request.url);
        throw new Response(null, { status: 404, statusText: "Not Found" });
      }

      return func(lfa);
    };
  } else {
    return ({ request }: { request: Request }) => {
      if (isProduction) {
        console.log("notReady loader hit:", request.url);
        throw new Response(null, { status: 404, statusText: "Not Found" });
      }
      return null;
    };
  }
}

export async function getGalleryImageNetSize(
  where: Prisma.ClubWhereUniqueInput,
) {
  const club = await prisma.club.findUnique({
    where,
    select: { id: true, galleryImages: { select: { id: true, size: true } } },
  });

  if (!club) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  const knownGalleryImages = club.galleryImages;

  const s3GalleryImages = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      Prefix: `${club.id}/gallery/`,
    }),
  );

  let netSize = 0n;
  const seenKeys = new Set();

  s3GalleryImages.Contents?.map((obj) => {
    const id = obj.Key?.split("/").at(-1);
    if (typeof id === "undefined") {
      // ???
      console.error("received an object with a malformed key from S3");
      return;
    }

    if (typeof obj.Size === "undefined") {
      // ???
      console.error("received an object with undefined size from S3");
      return;
    }

    seenKeys.add(id);
    netSize += BigInt(obj.Size);
  });

  knownGalleryImages.map((doc) => {
    if (seenKeys.has(doc.id)) return;

    netSize += doc.size;
  });

  console.log("gallery image net size (club: %s):", club.id, netSize);

  return netSize;
}

export async function isValidStrayKey(
  clubId: string,
  key: string,
): Promise<boolean> {
  const keyPattern = `^${clubId}/gallery/([a-zA-Z0-9_-]+)$`;
  const keyMatch = key.match(keyPattern);
  if (!keyMatch) {
    return false;
  }
  const keyImageName = keyMatch[1];
  if (
    await prisma.galleryImage.findUnique({
      where: { name: keyImageName },
      select: { id: true },
    })
  ) {
    return false;
  }

  return true;
}

export async function tryCreateGalleryImage(
  clubId: string,
  name: string,
  alt: string,
  size: number,
) {
  try {
    return await prisma.galleryImage.create({
      data: {
        club: { connect: { id: clubId } },
        name,
        alt,
        size,
        index: 0,
      },
      select: { id: true, name: true },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code == "P2002"
    ) {
      return null;
    } else {
      throw err;
    }
  }
}
