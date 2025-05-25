import {
  MapPin,
  Clock,
  Calendar,
  CalendarPlus,
  CalendarOff,
  CalendarMinus,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatDate, formatDuration } from "~/lib/utils";
import { type CustomRRuleSet, formatRRule } from "~/rrule";

interface MeetingCardProps {
  meeting: {
    schedule: CustomRRuleSet;
    name: string;
    location: string;
    duration: number;
    id: string;
    clubId: string;
  };
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{meeting.name}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="size-[1.2em]" />
          <span className="sr-only">Location: </span>
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
                <Calendar className="mr-1 size-[1.2em]" />
                {formatRRule(rrule)}
              </Badge>
            ))}
          </div>
        )}
        {meeting.schedule.rdates().length > 0 && (
          <div className="flex flex-wrap gap-2">
            {meeting.schedule.rdates().map((rdate) => (
              <Badge variant="secondary">
                <CalendarPlus className="mr-1 size-[1.2em]" />
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
                <CalendarOff className="mr-1 size-[1.2em] text-destructive" />
                except for {formatRRule(exrule)}
              </Badge>
            ))}
          </div>
        )}
        {meeting.schedule.exdates().length > 0 && (
          <div className="flex flex-wrap gap-2">
            {meeting.schedule.exdates().map((exdate) => (
              <Badge variant="secondary">
                <CalendarMinus className="mr-1 size-[1.2em] text-destructive" />
                except for {formatDate(exdate)}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
