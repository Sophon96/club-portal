import { Prisma } from "@prisma/client";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { prisma } from "~/db.server";
import { cn } from "~/lib/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query) {
    const clubInfos = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
    return json(clubInfos);
  } else {
    const clubInfos = (await prisma.club.aggregateRaw({
      pipeline: [
        {
          $search: {
            index: "brandonDevIndex",
            text: {
              query: query,
              path: ["name", "description"],
              fuzzy: {},
            },
          },
        },
        {
          $project: {
            name: 1,
            description: 1,
          },
        },
      ],
    })) as unknown as Prisma.JsonObject[]; // FIXME: Pretty sure Prisma has the wrong type
    // console.log(typeof clubInfos);
    // console.log(clubInfos);
    return json(
      clubInfos.map((e) => {
        return {
          id: e._id.$oid,
          name: e.name,
          description: e.description,
        };
      })
    );
  }
}

export default function Club() {
  const clubInfos = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <div className="w-screen bg-blue-600 h-96 mb-8">
        <div className="w-1/3 m-auto flex flex-col justify-center items-center">
          <h1 className="scroll-m-20 text-4xl text-white font-extrabold tracking-tight lg:text-5xl mb-12 mt-24">
            Clubs Catalog
          </h1>
          <Form className="w-full" method="GET">
            <Input
              name="q"
              type="search"
              placeholder="Search for a club"
              defaultValue={searchParams.get("q") ?? undefined}
            />
          </Form>
        </div>
      </div>
      <div className="flex flex-wrap shrink-0 justify-center items-center gap-4 max-w-7xl m-auto">
        <Card className="w-96 h-60 overflow-hidden">
          <img
            className="w-full h-24 object-cover"
            src="https://images.unsplash.com/photo-1682687221175-fd40bbafe6ca"
            alt=""
          />
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>
              Jinzo faiya faiba waipa taiga taiga t-t-t-t-taiga chape ape kara
              kina chape ape kara kina myohontuske clap waipa
            </CardDescription>
          </CardHeader>
        </Card>
        {clubInfos.map((club) => {
          const idAsNum = parseInt(club.id, 16);
          // Every tailwindcss color
          const colorClassNames = [
            "bg-slate-200 dark:bg-slate-700",
            "bg-gray-200 dark:bg-gray-700",
            "bg-zinc-200 dark:bg-zinc-700",
            "bg-stone-200 dark:bg-stone-700",
            "bg-red-200 dark:bg-red-700",
            "bg-orange-200 dark:bg-orange-700",
            "bg-amber-200 dark:bg-amber-700",
            "bg-yellow-200 dark:bg-yellow-700",
            "bg-lime-200 dark:bg-lime-700",
            "bg-green-200 dark:bg-green-700",
            "bg-emerald-200 dark:bg-emerald-700",
            "bg-teal-200 dark:bg-teal-700",
            "bg-cyan-200 dark:bg-cyan-700",
            "bg-sky-200 dark:bg-sky-700",
            "bg-blue-200 dark:bg-blue-700",
            "bg-indigo-200 dark:bg-indigo-700",
            "bg-violet-200 dark:bg-violet-700",
            "bg-purple-200 dark:bg-purple-700",
            "bg-fuchsia-200 dark:bg-fuchsia-700",
            "bg-pink-200 dark:bg-pink-700",
            "bg-rose-200 dark:bg-rose-700",
          ];

          return (
            <Link
              key={club.id}
              to={`/clubs/${club.id}`}
              className="w-full max-w-sm h-60"
            >
              <Card className="h-full overflow-hidden">
                <div
                  className={cn(
                    "w-full h-24",
                    colorClassNames[idAsNum % colorClassNames.length]
                  )}
                />
                <CardHeader>
                  <CardTitle>{club.name}</CardTitle>
                  <CardDescription className="overflow-hidden text-ellipsis">
                    {club.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
