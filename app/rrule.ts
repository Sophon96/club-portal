import { Frequency, RRule, RRuleSet } from "rrule";

// export const ALL_WEEKDAYS = rrule.ALL_WEEKDAYS;
// // export class RRule extends rrule.RRule {}
// export class RRuleSet extends rrule.RRuleSet {}
// export const Frequency = rrule.Frequency;
// export class Weekday extends rrule.Weekday {}
// export const rrulestr = rrule.rrulestr;
// export const datetime = rrule.datetime;

interface RRuleSetSpec {
  rrules: string[];
  rdates: Date[];
  exrules: string[];
  exdates: Date[];
}

export function assembleRRuleSet(rawRules: RRuleSetSpec) {
  const set = new RRuleSet();
  for (const rruleStr of rawRules.rrules) {
    set.rrule(RRule.fromString(rruleStr));
  }

  for (const rdate of rawRules.rdates) {
    set.rdate(rdate);
  }

  for (const exruleStr of rawRules.exrules) {
    set.exrule(RRule.fromString(exruleStr));
  }

  for (const exdate of rawRules.exdates) {
    set.exdate(exdate);
  }
  return set;
}

export function formatRRule(rule: RRule) {
  /* XXX: rrule sucks and types are wrong: all of these options are nullable */
  const {
    freq,
    dtstart,
    interval,
    wkst,
    count,
    until,
    bysetpos,
    bymonth,
    byweekday,
    byhour,
    byminute,
    bysecond,
  } = rule.options;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const weekdayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  let result = "every ";

  switch (freq) {
    case Frequency.DAILY:
      result += `${interval > 1 ? `${interval} days` : "day"}`;
      break;
    case Frequency.WEEKLY:
      result += `${interval > 1 ? `${interval} weeks` : "week"}`;
      if (byweekday && byweekday.length) {
        result += ` on ${byweekday.map((day) => weekdayNames[day]).join(", ")}`;
      }
      break;
    case Frequency.MONTHLY:
      result += `${interval > 1 ? `${interval} months` : "month"}`;
      if (bymonth && bymonth.length) {
        result += ` in ${bymonth
          .map((month) => monthNames[month - 1])
          .join(", ")}`;
      }
      if (byweekday && byweekday.length) {
        result += ` on ${byweekday.map((day) => weekdayNames[day]).join(", ")}`;
      }
      break;
    case Frequency.YEARLY:
      result += `${interval > 1 ? `${interval} years` : "year"}`;
      if (bymonth && bymonth.length) {
        result += ` in ${bymonth
          .map((month) => monthNames[month - 1])
          .join(", ")}`;
      }
      if (byweekday && byweekday.length) {
        result += ` on ${byweekday.map((day) => weekdayNames[day]).join(", ")}`;
      }
      break;
    default:
      result += "unknown frequency";
      break;
  }

  const timeParts: string[] = [];
  if (byhour && byhour.length)
    timeParts.push(
      `${byhour[0].toLocaleString(undefined, { minimumIntegerDigits: 2 })}:`
    );
  if (byminute && byminute.length)
    timeParts.push(
      `${byminute[0].toLocaleString(undefined, { minimumIntegerDigits: 2 })}`
    );
  if (bysecond && bysecond.length) {
    timeParts.push(
      `:${bysecond[0].toLocaleString(undefined, { minimumIntegerDigits: 2 })}`
    );
  }
  if (timeParts.length) result += ` at ${timeParts.join("")}`;

  const startDate = `${weekdayNames[(dtstart.getUTCDay() + 6) % 7]}, ${
    monthNames[dtstart.getUTCMonth()]
  } ${dtstart.getUTCDate()}, ${dtstart.getUTCFullYear()}`;
  result += ` starting on ${startDate}`;

  if (count !== null) {
    result += ` for ${count} occurrences`;
  }

  if (until !== null) {
    result += ` until ${until.toDateString()}`;
  }

  return result;
}
