import { useParams } from "@remix-run/react";
import { notReady } from "~/lib/utils";

// FIXME: implement
export const loader = notReady();

export default function EditClub() {
  const params = useParams();
  const clubId = params.clubId;

  return (
    <>
      <h1>Placeholder</h1>
      <h3>Edit club page for club {clubId}</h3>
    </>
  );
}
