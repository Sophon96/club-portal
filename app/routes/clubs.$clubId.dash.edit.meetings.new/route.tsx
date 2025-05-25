import { Form } from "@remix-run/react";
import { CalendarIcon, Plus } from "lucide-react";
import { useState } from "react";
import { RRule } from "rrule";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Muted } from "~/components/ui/typography";
import { formatRRule } from "~/rrule";
import { RRuleForm } from "./rrule-creator";
import { formatDate, isValidObjectId } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import { TimePicker12Demo } from "~/components/ui/time-picker-demo-12h";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticator, checkIsOfficerOrAdvisor } from "~/auth.server";
import { prisma } from "~/db.server";
import { z } from "zod";

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  // Generic auth check block
  if (!isValidObjectId(params.clubId!)) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const officerOrAdvisor = await checkIsOfficerOrAdvisor(user, {
    id: params.clubId,
  });

  if (!officerOrAdvisor) {
    throw redirect("../");
  }

  const schema = z.object({
    name: z.string(),
    location: z.string(),
    duration: z.coerce.number(),
    schedule: z.object({
      rrules: z.array(z.string()),
      rdates: z.array(z.coerce.date()),
      exrules: z.array(z.string()),
      exdates: z.array(z.coerce.date())
    })
  })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) {
    throw new Response(null, {status: 400, statusText: "Bad Request"})
  }

  await prisma.meeting.create({data: {
    clubId: params.clubId!,
    ...parsed.data
  }})
};

export default function ClubMeetingNew() {
  const [rrules, setRrules] = useState([] as string[]);
  const [rdates, setRdates] = useState([] as Date[]);
  const [exrules, setExrules] = useState([] as string[]);
  const [exdates, setExdates] = useState([] as Date[]);

  const [rruleDrawerOpen, setRruleDrawerOpen] = useState(false);
  const [rdateDrawerOpen, setRdateDrawerOpen] = useState(false);
  const [exruleDrawerOpen, setExruleDrawerOpen] = useState(false);
  const [exdateDrawerOpen, setExdateDrawerOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">New Meetings</h2>
      <Muted>Click submit when done.</Muted>
      <Form>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" />
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" />
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input id="duration" type="number" />

        <Label>Recurrence Rules (click to delete)</Label>
        <div>
          {rrules.map((rule, idx) => (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={(e) =>
                setRrules((prev) => prev.filter((_, i) => i !== idx))
              }
            >
              <CalendarIcon className="mr-1 size-[1.2em]" />
              {formatRRule(RRule.fromString(rule))}
            </Badge>
          ))}
          <Drawer open={rruleDrawerOpen} onOpenChange={setRruleDrawerOpen}>
            <DrawerTrigger>
              <Badge variant="secondary">
                <Plus className="size-[1.2em]" />
              </Badge>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4">
                <RRuleForm
                  callback={(rule) => {
                    setRruleDrawerOpen(false);
                    setRrules((prev) => [...prev, rule.toString()]);
                  }}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <Label>One-off Dates (click to delete)</Label>
        <div>
          {rdates.map((date, idx) => (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={(e) =>
                setRdates((prev) => prev.filter((_, i) => i !== idx))
              }
            >
              <CalendarIcon className="mr-1 size-[1.2em]" />
              {formatDate(date)}
            </Badge>
          ))}
          <Drawer open={rdateDrawerOpen} onOpenChange={setRdateDrawerOpen}>
            <DrawerTrigger>
              <Badge variant="secondary">
                <Plus className="size-[1.2em]" />
              </Badge>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(dt) => dt && setSelectedDate(dt)}
                  required
                />
                <TimePicker12Demo
                  date={selectedDate}
                  setDate={(dt) => dt && setSelectedDate(dt)}
                />
                <Button
                  className="mt-4"
                  onClick={(e) => {
                    const dtNoSeconds = selectedDate;
                    dtNoSeconds.setSeconds(0, 0);
                    setRdateDrawerOpen(false);
                    setRdates((prev) => [...prev, dtNoSeconds]);
                    setSelectedDate(new Date());
                  }}
                >
                  Add
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <Label>Exclusion Rules (click to delete)</Label>
        <div>
          {exrules.map((rule, idx) => (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={(e) =>
                setExrules((prev) => prev.filter((_, i) => i !== idx))
              }
            >
              <CalendarIcon className="mr-1 size-[1.2em]" />
              {formatRRule(RRule.fromString(rule))}
            </Badge>
          ))}
          <Drawer open={exruleDrawerOpen} onOpenChange={setExruleDrawerOpen}>
            <DrawerTrigger>
              <Badge variant="secondary">
                <Plus className="size-[1.2em]" />
              </Badge>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4">
                <RRuleForm
                  callback={(rule) => {
                    setExruleDrawerOpen(false);
                    setExrules((prev) => [...prev, rule.toString()]);
                  }}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <Label>Excluded Dates (click to delete)</Label>
        <div>
          {exdates.map((date, idx) => (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={(e) =>
                setExdates((prev) => prev.filter((_, i) => i !== idx))
              }
            >
              <CalendarIcon className="mr-1 size-[1.2em]" />
              {formatDate(date)}
            </Badge>
          ))}
          <Drawer open={exdateDrawerOpen} onOpenChange={setExdateDrawerOpen}>
            <DrawerTrigger>
              <Badge variant="secondary">
                <Plus className="size-[1.2em]" />
              </Badge>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(dt) => dt && setSelectedDate(dt)}
                  required
                />
                <TimePicker12Demo
                  date={selectedDate}
                  setDate={(dt) => dt && setSelectedDate(dt)}
                />
                <Button
                  className="mt-4"
                  onClick={(e) => {
                    const dtNoSeconds = selectedDate;
                    dtNoSeconds.setSeconds(0, 0);
                    setExdateDrawerOpen(false);
                    setExdates((prev) => [...prev, dtNoSeconds]);
                    setSelectedDate(new Date());
                  }}
                >
                  Add
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <Button className="mt-2" type="submit">
          Submit
        </Button>
      </Form>
    </>
  );
}
