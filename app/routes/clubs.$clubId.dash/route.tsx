import { Link, Outlet } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function ClubDashboard() {
  return (
    <>
      <Link to="../" relative="path">
        <Button variant="link">
          <ArrowLeft className="mr-2 inline size-4" />
          Return to public view
        </Button>
      </Link>
      <main className="mx-4 my-2">
        <Outlet />
      </main>
    </>
  );
}
