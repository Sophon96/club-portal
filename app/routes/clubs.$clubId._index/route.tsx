import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData, useParams } from "@remix-run/react";
import { formatISO } from "date-fns";
import { Users } from "lucide-react";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { prisma } from "~/db.server";
import { isValidObjectId } from "~/lib/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Ensure that the ID passed in the path is valid
  // Prisma will error if not, so we have to manually return 404
  if (!isValidObjectId(params.clubId!)) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const user = await authenticator.isAuthenticated(request);
  const officerOrAdvisor = await checkIsOfficerOrAdvisor(user, {
    id: params.clubId,
  });

  // We'll use this to determine whether a user is in the club or not
  // 10/29/23 - I don't know what I was talking about, but I'm pretty sure we don't
  let membershipId = null;
  if (user) {
    membershipId = await prisma.student
      .findUnique({
        where: {
          email: user.email,
        },
        select: {
          memberships: {
            where: {
              club: {
                id: params.clubId,
              },
            },
            select: {
              id: true,
            },
          },
        },
      })
      .then((val) => (val ? val.memberships[0].id : null));
  }

  /* 9/29/2023
    i forgor what i did
    auth.server.ts - the AuthInfo type needs to be a discriminated union because TS is stupid
    here - basic layout is done, ofc cdn is missing (no credit card) so using placeholder img. currently working adding join and leave buttons (see above code).
    next need to sort out the join and leave routes
   */

  // Get club info
  const club = await prisma.club.findUnique({
    where: {
      id: params.clubId,
    },
    include: {
      advisor: {
        select: {
          email: true,
          name: true,
        }
      },
      founder: {
        select: {
          name: true,
        }
      },
      officers: {
        select: {
          id: true,
          role: true,
          studentEmail: true,
          student: {
            select: {
              name: true,
            }
          },
        },
      },
      members: officerOrAdvisor,
    },
  });

  if (!club) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  // Manually convert the dates to make them more user-friendly
  const clubInfo = {...club, meetings: club.meetings.map((mtg) => {
    return {
      ...mtg,
      startDate: formatISO(mtg.startDate, { representation: "date" }),
    };
  })};

  return json({ clubInfo, user: { ...user, membershipId } });
}

export default function Club() {
  const params = useParams();
  const clubId = params.clubId;
  const { clubInfo, user } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="mx-12 w-fit max-w-screen-2xl m-auto flex flex-row gap-8 mt-12 ">
        <div className="w-1/2">
          <img
            src="https://images.unsplash.com/photo-1675889335685-4ac82f1e47ad"
            className="object-contain rounded-2xl"
            alt=""
          />
        </div>
        <div className="w-1/2">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            {clubInfo.name}
          </h2>
          <span>
            <Users className="mr-2 h-4 w-4 inline" />
            200 members
          </span>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            {clubInfo.description}
          </p>
          {!user.membershipId ? (
            <Form action={`/clubs/${clubId}/members`} method="POST">
              <Button type="submit" className="w-full mt-6">
                Join Club
              </Button>
            </Form>
          ) : (
            <Form
              action={`/clubs/${clubId}/members/${user.membershipId}`}
              method="DELETE"
            >
              <Button
                type="submit"
                variant="destructive"
                size="lg"
                className="w-full mt-2"
              >
                Leave Club
              </Button>
            </Form>
          )}
          <Accordion
            type="multiple"
            defaultValue={["meetings-accordion", "people-accordion"]}
          >
            <AccordionItem value="meetings-accordion">
              <AccordionTrigger>Meetings</AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Interval</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Start Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clubInfo.meetings.map((mtg) => (
                      <TableRow
                        key={`${mtg.location}_${mtg.interval}_${mtg.frequency}_${mtg.startDate}`}
                      >
                        <TableCell>{mtg.location}</TableCell>
                        <TableCell>{mtg.interval}</TableCell>
                        <TableCell>{mtg.frequency}</TableCell>
                        <TableCell>{mtg.startDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="people-accordion">
              <AccordionTrigger>People</AccordionTrigger>
              <AccordionContent>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  Advisor
                </h4>
                <ul className="list-disc"><li>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                  {clubInfo.advisor.name}
                  <a href={"mailto:" + clubInfo.advisor.email}>
                    <small className="text-sm text-muted-foreground ml-2">
                      {clubInfo.advisor.email}
                    </small>
                  </a>
                </p>
                </li></ul>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  Officers
                </h4>
                <ul className="list-disc">
                  {clubInfo.officers.map((officer) => {
                    return (
                      <li key={officer.id}>
                        <em>{officer.role}</em>
                        <p>{officer.student.name}</p> {/*FIXME: wtf typescript (I posted a query in Remix discord 2024-04-13)*/}
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
}
