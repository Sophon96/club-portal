import { Frequency, RRule, RRuleSet } from "rrule";

// export const ALL_WEEKDAYS = rrule.ALL_WEEKDAYS;
// // export class RRule extends rrule.RRule {}
// export class RRuleSet extends rrule.RRuleSet {}
// export const Frequency = rrule.Frequency;
// export class Weekday extends rrule.Weekday {}
// export const rrulestr = rrule.rrulestr;
// export const datetime = rrule.datetime;

// Because of the esoteric Date format returned by RRule, we can't use the
// RRuleSet class provided, since it doesn't convert rdates and exdates into
// the same esoteric format, which means that we can't reconcile the esoteric
// format into a standard UTC timestamp. Thus, we build our own RRuleSet.
class CustomRRuleSet {
  #rrules: RRule[];
  #rdates: Date[];
  #exrules: RRule[];
  #exdates: Date[];

  constructor(rules: RRuleSetSpec) {
    this.#rrules = rules.rrules.map(RRule.fromString);
    this.#rdates = rules.rdates;
    this.#exrules = rules.exrules.map(RRule.fromString);
    this.#exdates = rules.exdates;
  }

  after(dt: Date, inc?: Boolean): Date | null {
    const rruleDate = toRRuleDateFormat(dt);
    const rruleOccurrences = this.#rrules
      .map((rule) => rule.after(rruleDate, true))
      .filter((el) => !!el)
      .map(fromRRuleDateFormat);
    const allOccurrences = [...rruleOccurrences, ...this.#rdates].toSorted(
      (a, b) => a.getTime() - b.getTime(),
    );
    const lastOccurrence = allOccurrences.at(-1);
    if (typeof lastOccurrence === "undefined") {
      return null;
    }
    const rruleLastOccurrence = toRRuleDateFormat(lastOccurrence);
    const exruleExclusions = this.#exrules
      .flatMap((rule) => rule.between(rruleDate, rruleLastOccurrence, true))
      .map(fromRRuleDateFormat);
    const allExclusions = [...exruleExclusions, this.#exdates];
    const validOccurrences = allOccurrences.filter(
      (dt) => !allExclusions.includes(dt),
    );
    return validOccurrences.at(0) || null;
  }

  rrules() {
    return this.#rrules;
  }
  rdates() {
    return this.#rdates;
  }
  exrules() {
    return this.#exrules;
  }
  exdates() {
    return this.#exdates;
  }
}

export { CustomRRuleSet };

/**
 * Converts standard JS timestamp to timestamp for rrule.js
 * @param dt standard timestamp with correct UTC time
 * @return rrule.js timestamp with seconds since local 1970
 */
function toRRuleDateFormat(dt: Date) {
  const tzOffset = dt.getTimezoneOffset() * 60_000;
  const convertedDate = new Date(dt.getTime() + tzOffset);
  return convertedDate;
}

/**
 * Converts timestamp for rrule.js to standard JS timestamp
 * @param dt rrule.js timestamp with seconds since local 1970
 * @returns standard timestamp with correct UTC time
 */
function fromRRuleDateFormat(dt: Date) {
  const tzOffset = dt.getTimezoneOffset() * 60_000;
  const standardDate = new Date(dt.getTime() - tzOffset);
  return standardDate;
}

interface RRuleSetSpec {
  rrules: string[];
  rdates: Date[];
  exrules: string[];
  exdates: Date[];
}

export function assembleRRuleSet(rawRules: RRuleSetSpec) {
  /* const set = new RRuleSet();
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
  return set; */
  return new CustomRRuleSet(rawRules);
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

  /* switch (freq) {
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
  } */

  result = rule.toText();

  // only special case is month where we have stuff like (every first Monday)
  // FIXME: update this if we ever use UNTIL or COUNT
  if (freq === Frequency.MONTHLY && bysetpos && bysetpos.length > 0) {
    // bysetpos is actually null when unset but rrule.js types are broken
    result = `every `;
    if (interval > 1) {
      result += `${interval} months on `;
    } else {
      result += "month on ";
    }

    if (bysetpos[0] > 0) {
      // stolen from SO
      function ordinal_suffix_of(i: number) {
        let j = i % 10,
          k = i % 100;
        if (j === 1 && k !== 11) {
          return i + "st";
        }
        if (j === 2 && k !== 12) {
          return i + "nd";
        }
        if (j === 3 && k !== 13) {
          return i + "rd";
        }
        return i + "th";
      }
      result += ordinal_suffix_of(bysetpos[0]) + " ";
    } else {
      result += "last ";
    }
    result += weekdayNames[byweekday[0]];
  }

  const timeParts: string[] = [];
  if (byhour && byhour.length)
    timeParts.push(
      `${byhour[0].toLocaleString(undefined, { minimumIntegerDigits: 2 })}:`,
    );
  if (byminute && byminute.length)
    timeParts.push(
      `${byminute[0].toLocaleString(undefined, { minimumIntegerDigits: 2 })}`,
    );
  if (bysecond && bysecond.length) {
    timeParts.push(
      `:${bysecond[0].toLocaleString(undefined, { minimumIntegerDigits: 2 })}`,
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
