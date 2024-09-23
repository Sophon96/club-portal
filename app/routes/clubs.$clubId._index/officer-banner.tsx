import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export default function OfficerBanner() {
  return (
    <div className="w-full py-2 bg-teal-200 dark:bg-teal-800 flex flex-col md:flex-row gap-2 md:gap-4 justify-center items-center">
      You are an officer or the advisor of this club.
      <Link to="./dash" prefetch="intent">
        <Button size="sm">Go to dashboard (view members)</Button>
      </Link>
    </div>
  );
}
