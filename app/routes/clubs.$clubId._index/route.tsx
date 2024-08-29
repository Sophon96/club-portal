import {
  ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { formatISO } from "date-fns";
import { User, Users } from "lucide-react";
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
import { formatDuration, isValidObjectId } from "~/lib/utils";
import { assembleRRuleSet, formatRRule } from "~/rrule";
import { Large, P, Small, UL } from "~/components/ui/typography";
import { toast } from "sonner";
import { useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";

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
  let membershipId: string | null = null;
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
      .then((val) =>
        val && val.memberships.length ? val.memberships[0].id : null
      );
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
        },
      },
      founder: {
        select: {
          name: true,
        },
      },
      officers: {
        select: {
          id: true,
          role: true,
          studentEmail: true,
          student: {
            select: {
              name: true,
            },
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

  const numMembers = await prisma.member.count({
    where: { club: { id: params.clubId } },
  });

  // Manually convert the dates to strings so we can send them across JSON
  const meetingsWithStringDates = club.meetings.map((mtg) => {
    return {
      ...mtg,
      schedule: {
        ...mtg.schedule,
        rdates: mtg.schedule.rdates.map((date) => date.toISOString()),
        exdates: mtg.schedule.exdates.map((date) => date.toISOString()),
      },
    };
  });

  return json({
    club: { ...club, meetings: meetingsWithStringDates, numMembers },
    user: { ...user, membershipId },
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  // Handle joining and leaving the club
  if (!isValidObjectId(params.clubId!)) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const club = await prisma.club.findUnique({
    where: { id: params.clubId },
    select: { name: true },
  });
  if (!club) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // Figure out if the student is a member or not.
  // Kinda unintuitive but we want to avoid selecting Members because of the awkward compound unique key
  const memberships = await prisma.student
    .findUnique({
      where: { email: user.email },
      select: { memberships: { where: { club: { id: params.clubId } } } },
    })
    .then((student) => student!.memberships);

  const formData = await request.formData();
  const { _action } = Object.fromEntries(formData);

  if (_action === "join") {
    if (memberships.length) {
      return json({
        success: false,
        action: "join",
        error: "Student is already a member of this club",
      });
    }
    await prisma.member.create({
      data: {
        student: { connect: { email: user.email } },
        club: { connect: { id: params.clubId } },
      },
    });
    return json({ success: true, action: "join", error: null });
  } else if (_action === "leave") {
    if (!memberships.length) {
      return json({
        success: false,
        action: "leave",
        error: "Student is not a member of this club",
      });
    }
    await prisma.member.delete({ where: { id: memberships[0].id } });
    return json({ success: true, action: "leave", error: null });
  } else {
    return json(
      {
        success: false,
        action: "noclue",
        error: "Unrecognized action",
      },
      { status: 400 }
    );
  }
}

export default function Club() {
  const params = useParams();
  const clubId = params.clubId;
  const { club, user } = useLoaderData<typeof loader>();
  const meetings = club.meetings.map((mtg) => {
    // Remember when we turned the dates into strings in the loader?
    // Time to turn them back into Date objects.
    const rdates = mtg.schedule.rdates.map((date) => new Date(date));
    const exdates = mtg.schedule.exdates.map((date) => new Date(date));
    const schedule = assembleRRuleSet({ ...mtg.schedule, rdates, exdates });
    return { ...mtg, schedule };
  });
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  // use optimistic data
  let optimisticValue = 0;
  if (navigation.formData) {
    // Optimistic offset to club members
    optimisticValue = navigation.formData.get("_action") === "join" ? 1 : -1;
    // Optimistic membership status
    if (optimisticValue == 1) {
      user.membershipId = "optimistic";
    } else {
      user.membershipId = null;
    }
    // console.log("Attempting optimistic UI");
  }
  // useEffect(() => {
  //   if (navigation.formData) {
  //     club.numMembers += +(navigation.formData!.get("_action") === "join");
  //     user.membershipId = navigation.formData!.get("_action")
  //       ? "optimistic"
  //       : null;
  //   }
  //   console.log("Attempting optimistic UI")
  // }, [navigation.state]);

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(
          `Club ${actionData.action === "join" ? "joined" : "left"}!`
        );
      } else {
        toast.error("Failed to join club", {
          description: actionData.error,
        });
      }
    }
  }, [actionData]);

  return (
    <>
      <div className="px-4 lg:px-8 w-fit max-w-screen-2xl m-auto flex flex-col lg:flex-row gap-8 mt-4 lg:mt-12 ">
        {/* <div className="lg:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1675889335685-4ac82f1e47ad"
            className="object-contain rounded-2xl"
            alt=""
          />
        </div> */}
        <Carousel className="lg:w-1/2">
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, idx) => (
              <CarouselItem key={idx}>
                <img
                  src={`https://picsum.photos/seed/${club.id}-${idx}/4000/3000`}
                  className="rounded-2xl"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 opacity-50 hover:opacity-100" />
          <CarouselNext className="right-4 opacity-50 hover:opacity-100" />
        </Carousel>
        <div className="lg:w-1/2">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            {club.name}
          </h2>
          <span>
            {club.numMembers + optimisticValue > 0 ? (
              <Users className="mr-2 h-4 w-4 inline" />
            ) : (
              <User className="mr-2 h-4 w-4 inline" />
            )}
            {club.numMembers + optimisticValue} member
            {club.numMembers + optimisticValue > 0 ? "s" : ""}
          </span>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            {club.description}
          </p>
          {!user.membershipId ? (
            <Form /* action={`/clubs/${clubId}/members`} */ method="POST">
              <Button
                type="submit"
                variant="default"
                size="lg"
                name="_action"
                value="join"
                className="w-full mt-6"
              >
                Join Club
              </Button>
            </Form>
          ) : (
            <Form
              // action={`/clubs/${clubId}/members/${user.membershipId}`}
              method="DELETE"
            >
              <Button
                type="submit"
                variant="destructive"
                size="lg"
                name="_action"
                value="leave"
                className="w-full mt-6"
              >
                Leave Club
              </Button>
            </Form>
          )}
          <Accordion
            type="multiple"
            defaultValue={[/* "meetings-accordion", */ "people-accordion"]}
          >
            <AccordionItem value="meetings-accordion">
              <AccordionTrigger>Meetings</AccordionTrigger>
              <AccordionContent>
                <UL className="my-0">
                  {meetings.map((mtg, i_mtg) => (
                    <li key={`${i_mtg}`}>
                      <Large>{mtg.name}</Large>
                      <p>
                        <span className="font-semibold">Location:</span>{" "}
                        {mtg.location}
                      </p>
                      <p>
                        <span className="font-semibold">Duration:</span>{" "}
                        {formatDuration(mtg.duration)}
                      </p>
                      <p>
                        <span className="font-semibold">Occurs:</span>
                      </p>
                      <UL className="[&>li]:mt-0.5 my-0">
                        {mtg.schedule.rrules().map((rule, i_rule) => {
                          return <li key={`${i_rule}`}>{formatRRule(rule)}</li>;
                        })}
                        {mtg.schedule.rdates().map((date, i_date) => (
                          <li key={`${i_date}`}>on {date.toDateString()}</li>
                        ))}
                        {mtg.schedule.exrules().map((exrule, i_exr) => (
                          <li key={`${i_exr}`}>except {formatRRule(exrule)}</li>
                        ))}
                        {mtg.schedule.exdates().map((exd, i_exd) => (
                          <li key={`${i_exd}`}>
                            except on {exd.toDateString()}
                          </li>
                        ))}
                      </UL>
                    </li>
                  ))}
                </UL>
                {/* <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Interval</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Start Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {club.meetings.map((mtg) => (
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
                </Table> */}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="people-accordion">
              <AccordionTrigger>People</AccordionTrigger>
              <AccordionContent>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  Advisor
                </h4>
                <UL className="mt-0">
                  <li>
                    <P>
                      {club.advisor.name}
                      <a href={"mailto:" + club.advisor.email}>
                        <small className="text-sm text-muted-foreground ml-2">
                          {club.advisor.email}
                        </small>
                      </a>
                    </P>
                  </li>
                </UL>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  Officers
                </h4>
                <UL className="mt-0">
                  {club.officers.map((officer) => {
                    return (
                      <li key={officer.id}>
                        <span className="font-semibold">{officer.role}:</span>{" "}
                        {officer.student.name}
                        <a href={`mailto: ${officer.studentEmail}`}>
                          <Small className="text-muted-foreground ml-2">
                            {officer.studentEmail}
                          </Small>
                        </a>
                      </li>
                    );
                  })}
                </UL>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
}
