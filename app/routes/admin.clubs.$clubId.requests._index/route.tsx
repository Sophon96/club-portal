import {useParams} from "@remix-run/react";
import { notReady } from "~/lib/utils";

export const loader = notReady();

export default function AdminClubsRequests() {
  const params = useParams();
  const clubId = params.clubId

  return <>
    <h1>Placeholder</h1>
    <h3>Admin Clubs Requests Dashboard for club {clubId}</h3>
  </>
}
