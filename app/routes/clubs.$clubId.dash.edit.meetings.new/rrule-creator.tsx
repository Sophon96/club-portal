import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { k } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
import React from "react";
import { useState } from "react";
import { RRule } from "rrule";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { TimePicker12Demo } from "~/components/ui/time-picker-demo-12h";
import { cn } from "~/lib/utils";

interface RruleProps {
  start: Date;
  frequency: string;
  interval?: number;
  bymonth?: string;
  bymonthday?: number;
  byweekday?: string;
  bysetpos?: string;
}

const DatePicker = React.forwardRef<
  HTMLDivElement,
  {
    date?: Date;
    setDate: (date?: Date) => void;
  }
>(function DatePickerCmp({ date, setDate }, ref) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" ref={ref}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          required
        />
      </PopoverContent>
    </Popover>
  );
});

export function RRuleForm({ callback }: { callback: (rule: RRule) => void }) {
  const [rruleProps, setRruleProps] = useState<RruleProps>({
    start: new Date(),
    frequency: "weekly",
  });
  const [monthRule, setMonthRule] = useState<string | undefined>(undefined);
  const [checkedWeedays, setCheckedWeedays] = useState({
    mo: false,
    tu: false,
    we: false,
    th: false,
    fr: false,
    sa: false,
    su: false,
  });
  const [byHour, setByHour] = useState<string | undefined>(undefined);
  const [byMin, setByMin] = useState<string | undefined>(undefined);
  const [timeDate, setTimeDate] = useState<Date | undefined>(new Date(0));

  return (
    <>
      {/* FIXME:  inaccessible */}
      <Label htmlFor="rrule-start">Start</Label>
      <DatePicker
        // id="rrule-start"
        // mode="single"
        // required
        date={rruleProps.start}
        setDate={(val) =>
          val && setRruleProps((prev) => ({ ...prev, start: val }))
        }
      />

      <Label htmlFor="interval">
        Interval (e.g. 1 for every rep, 2 for every other, etc.)
      </Label>
      <Input
        id="interval"
        type="number"
        value={rruleProps.interval ? rruleProps.interval.toString() : ""}
        onChange={(e) =>
          setRruleProps((prev) => ({
            ...prev,
            interval: Number.parseInt(e.currentTarget.value),
          }))
        }
      />

      <Label>Repeat</Label>
      {/* Reset all props on frequency change */}
      <Select
        value={rruleProps.frequency}
        onValueChange={(val) =>
          setRruleProps((prev) => ({
            start: prev.start,
            interval: prev.interval,
            frequency: val,
          }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Frequency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="yearly">Yearly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
        </SelectContent>
      </Select>

      {rruleProps.frequency === "yearly" && (
        <>
          on{" "}
          <Select
            value={rruleProps.bymonth}
            onValueChange={(val) =>
              setRruleProps((prev) => ({ ...prev, bymonth: val }))
            }
          >
            <SelectTrigger className="inline">
              <SelectValue placeholder="month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">January</SelectItem>
              <SelectItem value="2">February</SelectItem>
              <SelectItem value="3">March</SelectItem>
              <SelectItem value="4">April</SelectItem>
              <SelectItem value="5">May</SelectItem>
              <SelectItem value="6">June</SelectItem>
              <SelectItem value="7">July</SelectItem>
              <SelectItem value="8">August</SelectItem>
              <SelectItem value="9">September</SelectItem>
              <SelectItem value="10">October</SelectItem>
              <SelectItem value="11">November</SelectItem>
              <SelectItem value="12">December</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            className="inline"
            value={rruleProps.bymonthday?.toString()}
            onChange={(e) =>
              setRruleProps((prev) => ({
                ...prev,
                bymonthday: Number.parseInt(e.currentTarget.value),
              }))
            }
            placeholder="day"
          />
        </>
      )}

      {rruleProps.frequency === "monthly" && (
        <>
          <Label>Pattern</Label>
          <Select value={monthRule} onValueChange={setMonthRule}>
            <SelectTrigger>
              <SelectValue placeholder="on..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthday">on day N</SelectItem>
              <SelectItem value="weekday">on the N-th Weekday</SelectItem>
            </SelectContent>
          </Select>
          {monthRule === "monthday" ? (
            <>
              <div className="p-4">
                on day{" "}
                <Input
                  type="number"
                  className="inline w-48"
                  value={rruleProps.bymonthday?.toString()}
                  onChange={(e) =>
                    setRruleProps((prev) => ({
                      ...prev,
                      bymonthday: Number.parseInt(e.currentTarget.value),
                    }))
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-row items-center space-x-2 p-4">
                <span>on the </span>
                <Select
                  value={rruleProps.bysetpos}
                  onValueChange={(val) =>
                    setRruleProps((prev) => ({ ...prev, bysetpos: val }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="1st, 2nd, 3rd, ..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First</SelectItem>
                    <SelectItem value="2">Second</SelectItem>
                    <SelectItem value="3">Third</SelectItem>
                    <SelectItem value="4">Fourth</SelectItem>
                    <SelectItem value="-1">Last</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={rruleProps.byweekday}
                  onValueChange={(val) =>
                    setRruleProps((prev) => ({ ...prev, byweekday: val }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="(day of week)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Monday</SelectItem>
                    <SelectItem value="1">Tuesday</SelectItem>
                    <SelectItem value="2">Wednesday</SelectItem>
                    <SelectItem value="3">Thursday</SelectItem>
                    <SelectItem value="4">Friday</SelectItem>
                    <SelectItem value="5">Saturday</SelectItem>
                    <SelectItem value="6">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </>
      )}

      {rruleProps.frequency === "weekly" && (
        <>
          <div className="flex flex-col space-y-2 py-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checkmo"
                checked={checkedWeedays.mo}
                onCheckedChange={(val) =>
                  setCheckedWeedays((prev) => ({ ...prev, mo: !!val }))
                }
              />
              <Label
                htmlFor="checkmo"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Monday
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checktu"
                checked={checkedWeedays.tu}
                onCheckedChange={(val) =>
                  setCheckedWeedays((prev) => ({ ...prev, tu: !!val }))
                }
              />
              <Label
                htmlFor="checktu"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tuesday
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checkwe"
                checked={checkedWeedays.we}
                onCheckedChange={(val) =>
                  setCheckedWeedays((prev) => ({ ...prev, we: !!val }))
                }
              />
              <Label
                htmlFor="checkwe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Wednesday
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checkth"
                checked={checkedWeedays.th}
                onCheckedChange={(val) =>
                  setCheckedWeedays((prev) => ({ ...prev, th: !!val }))
                }
              />
              <Label
                htmlFor="checkth"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Thursday
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checkfr"
                checked={checkedWeedays.fr}
                onCheckedChange={(val) =>
                  setCheckedWeedays((prev) => ({ ...prev, fr: !!val }))
                }
              />
              <Label
                htmlFor="checkfr"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Friday
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checksa"
                checked={checkedWeedays.sa}
                onCheckedChange={(val) =>
                  setCheckedWeedays((prev) => ({ ...prev, sa: !!val }))
                }
              />
              <Label
                htmlFor="checksa"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Saturday
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checksu"
                checked={checkedWeedays.su}
                onCheckedChange={(val) =>
                  setCheckedWeedays((prev) => ({ ...prev, su: !!val }))
                }
              />
              <Label
                htmlFor="checksu"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sunday
              </Label>
            </div>
          </div>
        </>
      )}

      {/* <Label>Time (hh:mm)</Label>
      <div className="flex flex-row items-center space-x-2">
        <Select value={byHour} onValueChange={setByHour}>
          <SelectTrigger className="w-16">
            <SelectValue placeholder="hh" />
          </SelectTrigger>
          <SelectContent> */}
      {/* probably swap this for the map version below too */}
      {/* <SelectItem value="00">00</SelectItem>
            <SelectItem value="01">01</SelectItem>
            <SelectItem value="02">02</SelectItem>
            <SelectItem value="03">03</SelectItem>
            <SelectItem value="04">04</SelectItem>
            <SelectItem value="05">05</SelectItem>
            <SelectItem value="06">06</SelectItem>
            <SelectItem value="07">07</SelectItem>
            <SelectItem value="08">08</SelectItem>
            <SelectItem value="09">09</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="11">11</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="13">13</SelectItem>
            <SelectItem value="14">14</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="16">16</SelectItem>
            <SelectItem value="17">17</SelectItem>
            <SelectItem value="18">18</SelectItem>
            <SelectItem value="19">19</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="21">21</SelectItem>
            <SelectItem value="22">22</SelectItem>
            <SelectItem value="23">23</SelectItem>
          </SelectContent>
        </Select>
        <span>:</span>
        <Select value={byMin} onValueChange={setByMin}>
          <SelectTrigger className="w-16">
            <SelectValue placeholder="mm" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 60 }, (v, k) => k).map((i) => (
              <SelectItem value={i.toString()}>
                {String(i).padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div> */}
      <TimePicker12Demo date={timeDate} setDate={setTimeDate} />

      <Button
        className="mt-4"
        onClick={(e) => {
          // we need to check that all the fields are filled out
          // we will always need interval, hour, and minute filled so we check that now
          if (
            typeof rruleProps.interval === "undefined" /* ||
            typeof byHour === "undefined" ||
            typeof byMin === "undefined" */
          ) {
            toast.error("Please fill out all fields.");
            return;
          }
          /* const numByHour = Number.parseInt(byHour);
          const numByMin = Number.parseInt(byMin); */
          if (typeof timeDate === "undefined") {
            toast.error("Please fill out all fields.");
            return;
          }
          const numByHour = timeDate.getHours();
          const numByMin = timeDate.getMinutes();
          switch (rruleProps.frequency) {
            case "yearly":
              if (
                typeof rruleProps.bymonth === "undefined" ||
                typeof rruleProps.bymonthday === "undefined"
              ) {
                toast.error("Please fill out all fields.");
                return;
              }
              const bymonth = Number.parseInt(rruleProps.bymonth);
              // scope rule to avoid redefining it
              {
                const rule = new RRule({
                  tzid: "America/Los_Angeles",
                  dtstart: rruleProps.start,
                  freq: RRule.YEARLY,
                  interval: rruleProps.interval,
                  bymonth,
                  bymonthday: rruleProps.bymonthday,
                  byhour: numByHour,
                  byminute: numByMin,
                  bysecond: 0,
                });
                callback(rule);
              }
              break;

            case "monthly":
              if (monthRule === "monthday") {
                if (typeof rruleProps.bymonthday === "undefined") {
                  toast.error("Please fill out all fields.");
                  return;
                }
                const rule = new RRule({
                  tzid: "America/Los_Angeles",
                  dtstart: rruleProps.start,
                  freq: RRule.MONTHLY,
                  interval: rruleProps.interval,
                  bymonthday: rruleProps.bymonthday,
                  byhour: numByHour,
                  byminute: numByMin,
                  bysecond: 0,
                });
                callback(rule);
              } else if (monthRule === "weekday") {
                if (
                  typeof rruleProps.bysetpos === "undefined" ||
                  typeof rruleProps.byweekday === "undefined"
                ) {
                  toast.error("Please fill out all fields.");
                  return;
                }
                const rule = new RRule({
                  tzid: "America/Los_Angeles",
                  dtstart: rruleProps.start,
                  freq: RRule.MONTHLY,
                  interval: rruleProps.interval,
                  bysetpos: Number.parseInt(rruleProps.bysetpos),
                  byweekday: Number.parseInt(rruleProps.byweekday),
                  byhour: numByHour,
                  byminute: numByMin,
                  bysecond: 0,
                });
                callback(rule);
              } else {
                toast.error("Please fill out all fields.");
              }
              break;

            case "weekly":
              // code of debatable quality
              const byweekday = Object.entries(checkedWeedays)
                .filter(([_, v]) => v)
                .map(([k]) =>
                  ["mo", "tu", "we", "th", "fr", "sa", "su"].indexOf(k),
                );
              // ensure at least one weekday is checked
              if (byweekday.length == 0) {
                toast.error("Please choose at least one weekday.");
                return;
              }
              {
                const rule = new RRule({
                  tzid: "America/Los_Angeles",
                  dtstart: rruleProps.start,
                  freq: RRule.WEEKLY,
                  interval: rruleProps.interval,
                  byweekday,
                  byhour: numByHour,
                  byminute: numByMin,
                  bysecond: 0,
                });
                callback(rule);
              }
              break;
            case "daily": {
              const rule = new RRule({
                tzid: "America/Los_Angeles",
                dtstart: rruleProps.start,
                freq: RRule.DAILY,
                interval: rruleProps.interval,
                byhour: numByHour,
                byminute: numByMin,
                bysecond: 0,
              });
              callback(rule);
            }
          }
        }}
      >
        Create
      </Button>
    </>
  );
}
