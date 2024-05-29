import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export function action({ params }: ActionFunctionArgs) {
  return json({ placeholder: `joined club ${params.clubId}` });
}
