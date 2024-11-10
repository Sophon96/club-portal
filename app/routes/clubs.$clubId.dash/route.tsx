import { Link, Outlet } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function ClubDashboard() {
  return (
    <>
      <Link to="../" relative="path">
        <Button variant="link">
          <ArrowLeft className="size-4 inline mr-2" />
          Return to public view
        </Button>
      </Link>
      <main className="m-2">
        <Outlet />
      </main>
    </>
  );
}
