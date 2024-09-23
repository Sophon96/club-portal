import { LoaderFunction } from "@remix-run/node";
import { isValidObjectId } from "~/lib/utils";

export const loader: LoaderFunction = ({ params }) => {
  if (!isValidObjectId(params.clubId!)) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return null;
};
