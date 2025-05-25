import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLocation, useParams } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { authenticator } from "~/auth.server";
import { Button, buttonVariants } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { H1, H2 } from "~/components/ui/typography";
import { cn } from "~/lib/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user || user.type !== "admin") {
    throw new Response(null, { status: 404 });
  }
  return null;
};

const items = [
  {
    href: "general",
    title: "General",
  },
  { href: "images", title: "Pending Images" },
];

export default function AdminDashboard() {
  const { pathname } = useLocation();

  return (
    <>
      <header className="m-2">
        <h2 className="m-4 text-3xl font-bold">Administrator Dashboard</h2>
        <Link to="../" relative="path">
          <Button variant="link">
            <ArrowLeft className="mr-2 inline size-4" />
            Return to home
          </Button>
        </Link>
      </header>
      <main className="m-2">
        <div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-8">
          <aside className="lg:basis-1/5">
            <ScrollArea className="w-full">
              <nav className="flex gap-2 lg:flex-col lg:gap-1">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    to={`${item.href}`}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      pathname === `/admin/dashboard/${item.href}`
                        ? "bg-muted hover:bg-muted"
                        : "bg-transparent hover:bg-transparent",
                      "justify-start",
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
      </main>
    </>
  );
}
