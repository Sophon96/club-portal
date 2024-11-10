import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLocation, useParams } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { buttonVariants } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { notReady } from "~/lib/utils.server";

// FIXME: implement
export const loader = notReady(async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return null;
});

const items = [
  {
    href: "general",
    title: "General",
  },
  { href: "images", title: "Images" },
  { href: "meetings", title: "Meetings" },
  { href: "officers", title: "Officers" },
];

export default function ClubDashboardEdit() {
  const { pathname } = useLocation();
  const { clubId } = useParams();

  return (
    <div className="w-full flex flex-col gap-8 lg:flex-row lg:gap-8">
      <aside className="lg:basis-1/5">
        <ScrollArea className="w-full">
          <nav className="flex gap-2 lg:flex-col lg:gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                to={`${item.href}`}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  pathname === `/clubs/${clubId}/dash/edit/${item.href}`
                    ? "bg-muted hover:bg-muted"
                    : "bg-transparent hover:bg-transparent",
                  "justify-start"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
