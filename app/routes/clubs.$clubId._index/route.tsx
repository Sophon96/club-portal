import {
  ActionFunctionArgs,
  type LoaderFunctionArgs,
  MetaFunction,
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
import {
  Calendar,
  CalendarMinus,
  CalendarOff,
  CalendarPlus,
  Clock,
  ImageOff,
  Loader2,
  MapPin,
  User,
  Users,
} from "lucide-react";
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
import { formatDate, formatDuration, isValidObjectId } from "~/lib/utils";
import { assembleRRuleSet, formatRRule } from "~/rrule";
import { H1, Large, P, Small, UL } from "~/components/ui/typography";
import { toast } from "sonner";
import { useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { getPresignedUrl, s3Client } from "~/s3.server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ImageGallery } from "./image-gallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import OfficerBanner from "./officer-banner";
import { z } from "zod";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const preloadGalleryTags = data
    ? data.galleryImageUrls
        .filter((url) => typeof url === "string")
        .map((url) => {
          return { tagName: "link", rel: "preload", href: url, as: "image" };
        })
    : [];

  return [{ title: `${data?.club.name} | DSHS Clubs` }, ...preloadGalleryTags];
};

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
    },
  });

  if (!club) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  // School policy disallows revealing student names or emails to the public
  // so we overwrite the officers data with null if unauthenticated
  // FIXME: this probably isn't secure because it's 1:09 am
  const overwriteOfficers = user ? {} : { officers: null };

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

  // Get gallery images from S3
  const galleryObjects = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      Prefix: `${club.id}/gallery/`,
    })
  );

  let galleryImageUrls: (string | null)[];
  if (typeof galleryObjects.Contents === "undefined") {
    console.error("No contents returned for gallery images");
    galleryImageUrls = [];
  } else {
    galleryImageUrls = await Promise.all(
      galleryObjects.Contents.map((obj) => {
        if (obj.Key) {
          return getPresignedUrl(obj.Key);
        } else {
          console.error("No key returned for gallery image");
          return null;
        }
      })
    );
  }

  return json({
    club: {
      ...club,
      meetings: meetingsWithStringDates,
      numMembers,
      ...overwriteOfficers,
    },
    user: { ...user, membershipId },
    officerOrAdvisor,
    galleryImageUrls,
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

  // FIXME: add returnTo parameters to other /login redirects and check
  // security of unsafely appending request.url as param
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login?returnTo=" + request.url,
  });

  const formData = await request.formData();
  const actionResult = z
    .literal("join")
    .or(z.literal("leave"))
    .safeParse(formData.get("_action"));
  if (!actionResult.success) {
    return json(
      {
        success: false,
        action: "noclue",
        error: "Unrecognized action",
      },
      400
    );
  }
  const _action = actionResult.data;

  // Figure out if the student is a member or not.
  // Kinda unintuitive but we want to avoid selecting Members because of the awkward compound unique key
  const student = await prisma.student.findUnique({
    where: { email: user.email },
    select: { memberships: { where: { club: { id: params.clubId } } } },
  });

  if (!student) {
    // Didn't finish onboarding
    return json({
      success: false,
      action: _action,
      error: "Onboarding must be completed before joining clubs.",
    });
  }
  // .then((student) => student!.memberships);
  const memberships = student.memberships;

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
    console.error("zod broke, club join action:", _action);
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
  const { club, user, officerOrAdvisor, galleryImageUrls } =
    useLoaderData<typeof loader>();
  const meetings = club.meetings.map((mtg) => {
    // Remember when we turned the dates into strings in the loader?
    // Time to turn them back into Date objects.
    const rdates = mtg.schedule.rdates.map((date) => new Date(date));
    const exdates = mtg.schedule.exdates.map((date) => new Date(date));
    const schedule = assembleRRuleSet({ ...mtg.schedule, rdates, exdates });
    return { ...mtg, schedule };
  });
  const nextMeeting = meetings
    .map((mtg) => {
      // ensuing ternary is because typescript can't follow the filter
      const nextDT = mtg.schedule.after(new Date(), true);
      return nextDT ? { name: mtg.name, dt: nextDT } : null;
    })
    .filter((m) => !!m)
    .sort((a, b) => a.dt.getTime() - b.dt.getTime())
    .at(0);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  // use optimistic data
  // FIXME: no as of 2024-09-24 because pending is better
  let optimisticValue = 0;
  /* if (navigation.formData) {
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
  // }, [navigation.state]); */

  const submittingForm = navigation.state !== "idle" && !!navigation.formAction;
  // console.log(navigation)

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(
          `Club ${actionData.action === "join" ? "joined" : "left"}!`
        );
      } else {
        toast.error("Failed to join/leave club", {
          description: actionData.error,
        });
      }
    }
  }, [actionData]);

  return (
    <>
      {officerOrAdvisor ? <OfficerBanner /> : null}
      <div className="px-4 lg:px-8 w-full max-w-screen-2xl m-auto flex flex-col lg:flex-row gap-4 lg:gap-8 mt-4 lg:mt-12 ">
        <ImageGallery galleryImageUrls={galleryImageUrls} />
        <div className="lg:w-1/2">
          <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            {club.name}
          </h2>
          <Badge variant="secondary" className="mb-1">
            {club.numMembers + optimisticValue > 0 ? (
              <Users className="mr-1 size-[1.2em] inline" />
            ) : (
              <User className="mr-1 size-[1.2em] inline" />
            )}
            {club.numMembers + optimisticValue} member
            {club.numMembers + optimisticValue !== 1 ? "s" : ""}
          </Badge>
          <Separator />
          <p className="leading-relaxed my-4">{club.description}</p>
          <Form method="POST">
            {!user.membershipId ? (
              <Button
                type="submit"
                variant="default"
                // size="lg"
                name="_action"
                value="join"
                className="w-full"
                disabled={submittingForm}
              >
                {submittingForm ? (
                  <Loader2 className="size-[1.2em] mr-2 animate-spin" />
                ) : null}
                Join Club
              </Button>
            ) : (
              <Button
                type="submit"
                variant="secondary"
                // size="lg"
                name="_action"
                value="leave"
                className="w-full"
                disabled={submittingForm}
              >
                {submittingForm ? (
                  <Loader2 className="size-[1.2em] mr-2 animate-spin" />
                ) : null}
                Leave Club
              </Button>
            )}
          </Form>
          <Accordion type="multiple" defaultValue={["meetings-accordion","people-accordion"]}>
            <AccordionItem value="meetings-accordion">
              <AccordionTrigger>Meetings</AccordionTrigger>
              <AccordionContent>
                <p className="leading-relaxed">
                  {nextMeeting ? (
                    <>
                      <b>Next meeting:</b> {nextMeeting.name} on{" "}
                      {formatDate(nextMeeting.dt)}
                    </>
                  ) : (
                    "There are no upcoming meetings"
                  )}
                </p>
                <div className="mt-4 flex flex-col gap-4">
                  {meetings.map((meeting, i) => (
                    <Card>
                      <CardHeader>
                        <CardTitle>{meeting.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="size-[1.2em]" /><span className="sr-only">Location: </span>
                          {meeting.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-[1.2em]" />
                          {formatDuration(meeting.duration)}
                        </div>
                        {meeting.schedule.rrules().length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {meeting.schedule.rrules().map((rrule) => (
                              <Badge variant="secondary">
                                <Calendar className="size-[1.2em] mr-1" />
                                {formatRRule(rrule)}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {meeting.schedule.rdates().length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {meeting.schedule.rdates().map((rdate) => (
                              <Badge variant="secondary">
                                <CalendarPlus className="size-[1.2em] mr-1" />
                                on {formatDate(rdate)}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {meeting.schedule.exrules().length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {meeting.schedule.exrules().map((exrule) => (
                              <Badge
                                variant="secondary"
                                // className="bg-destructive/80 hover:bg-destructive/50"
                              >
                                <CalendarOff className="text-destructive size-[1.2em] mr-1" />
                                except for {formatRRule(exrule)}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {meeting.schedule.exdates().length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {meeting.schedule.exdates().map((exdate) => (
                              <Badge variant="secondary">
                                <CalendarMinus className="text-destructive size-[1.2em] mr-1" />
                                except for {formatDate(exdate)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {/* <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Schedule</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetings.map((mtg, idxMtg) => (
                      <TableRow key={idxMtg}>
                        <TableCell>{mtg.name}</TableCell>
                        <TableCell>{mtg.location}</TableCell>
                        <TableCell>{formatDuration(mtg.duration)}</TableCell>
                        <TableCell>
                          <UL className="[&>li]:mt-0.5 my-0">
                            {mtg.schedule.rrules().map((rule, i_rule) => {
                              return (
                                <li key={`${i_rule}`}>{formatRRule(rule)}</li>
                              );
                            })}
                            {mtg.schedule.rdates().map((date, i_date) => (
                              <li key={`${i_date}`}>
                                on {date.toDateString()}
                              </li>
                            ))}
                            {mtg.schedule.exrules().map((exrule, i_exr) => (
                              <li key={`${i_exr}`}>
                                except for {formatRRule(exrule)}
                              </li>
                            ))}
                            {mtg.schedule.exdates().map((exd, i_exd) => (
                              <li key={`${i_exd}`}>
                                except for {exd.toDateString()}
                              </li>
                            ))}
                          </UL>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table> */}
                {/* <UL className="my-0">
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
                </UL> */}
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
                {club.officers ? (
                  <UL className="mt-0">
                    {club.officers.map((officer) => {
                      return (
                        <li key={officer.id}>
                          <span className="font-semibold">{officer.role}:</span>{" "}
                          {officer.student.name}
                          <a href={`mailto:${officer.studentEmail}`}>
                            <Small className="text-muted-foreground ml-2">
                              {officer.studentEmail}
                            </Small>
                          </a>
                        </li>
                      );
                    })}
                  </UL>
                ) : (
                  <P>Please log in to view club officers.</P>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
}
