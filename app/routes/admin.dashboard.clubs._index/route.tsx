import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Muted } from "~/components/ui/typography";
import { prisma } from "~/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user || user.type !== "admin") {
    throw new Response(null, { status: 404 });
  }

  const clubs = await prisma.club.findMany({
    select: { id: true, name: true, description: true },
  });
  return { clubs };
};

export default function () {
  const { clubs } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  return (
    <>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">Pending Clubs</h2>
      <Muted>Select a club to approve or reject changes.</Muted>
      <Card className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.map((club) => (
              <TableRow key={club.id} onClick={() => navigate(club.id)} className="cursor-pointer">
                <TableCell className="font-semibold">{club.id}</TableCell>
                <TableCell>{club.name}</TableCell>
                <TableCell>
                  <p className="line-clamp-3">{club.description}</p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
