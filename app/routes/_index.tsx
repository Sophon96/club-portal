import { LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { ClubsNavbar } from "~/components/clubs-navbar";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "Davis Senior High School Clubs" },
    {
      name: "description",
      content:
        "The platform for everything about clubs at Davis Senior High School",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  return { user };
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex h-screen flex-col">
        <ClubsNavbar user={user} />
        <main className="flex-grow basis-auto">
          <section className="flex h-full items-center justify-center bg-primary/70 text-primary-foreground">
            <div className="text-center">
              <h1 className="mb-4 text-4xl font-bold md:text-6xl">
                Welcome to{" "}
                <span className="rounded-full bg-background dark:bg-primary px-6 text-primary dark:text-primary-foreground">
                  dshs.club
                </span>
              </h1>
              <p className="mb-8 text-xl md:text-2xl">
                The all-in-one platform for clubs at Davis Senior High School
              </p>
              <Link to="/clubs" prefetch="viewport">
                <Button size="lg" className="h-16 rounded-lg px-16 text-xl">
                  Browse Clubs
                </Button>
              </Link>
            </div>
          </section>
        </main>
      </div>
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>dshs.club | The platform for clubs at Davis Senior High School</p>
        </div>
      </footer>
    </div>
  );
  /* return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  ); */
}
